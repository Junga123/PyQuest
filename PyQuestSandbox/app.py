import json
import os
import signal
import subprocess
import sys
import tempfile
import textwrap
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field


app = FastAPI(title="PyQuest Sandbox")


class ExecuteRequest(BaseModel):
    code: str = Field(..., description="Python source code to execute")
    # If true, returns an execution trace (best-effort, limited)
    step_through: bool = False
    tests_code: Optional[str] = Field(None, description="Optional tests code (executed after user code)")
    timeout_ms: int = Field(1200, ge=100, le=20000)
    # Limit trace size to avoid huge responses
    max_trace_events: int = Field(300, ge=20, le=2000)


class ExecuteResponse(BaseModel):
    stdout: str
    stderr: str
    success: bool
    trace: Optional[List[Dict[str, Any]]] = None


def _run_python(
    code: str,
    timeout_ms: int,
    step_through: bool,
    max_trace_events: int,
    tests_code: Optional[str] = None,
) -> ExecuteResponse:
    # Wrap the user's code so we can attach a tracer without relying on file layout.
    # Note: This is MVP-level. A production sandbox should enforce stronger isolation.
    if step_through:
        # We print trace JSON with a marker into stdout, so the backend can separate it.
        tests_block = ""
        if tests_code and tests_code.strip():
            tests_block = textwrap.indent(tests_code, "    ")

        wrapped = textwrap.dedent(
            f"""
            import sys
            import json
            import traceback

            __trace_events__ = []
            __max_trace_events__ = {max_trace_events}

            __USER_CODE_START_LINE__ = 1
            __USER_CODE_END_LINE__ = 0

            def __safe_repr__(v):
                try:
                    s = repr(v)
                except Exception:
                    s = "<unrepr>"
                if len(s) > 200:
                    s = s[:200] + "...<cut>"
                return s

            def __tracer__(frame, event, arg):
                # We trace only "line" events.
                if event != "line":
                    return __tracer__
                try:
                    if len(__trace_events__) >= __max_trace_events__:
                        return __tracer__

                    # Restrict trace to user-code region.
                    if frame.f_lineno < __USER_CODE_START_LINE__ or frame.f_lineno > __USER_CODE_END_LINE__:
                        return __tracer__

                    locs = frame.f_locals
                    locals_snapshot = {{k: __safe_repr__(v) for k, v in locs.items()}}

                    # Build a short stack (best-effort).
                    stack = []
                    f = frame
                    while f is not None and len(stack) < 8:
                        stack.append(f.f_code.co_name)
                        f = f.f_back

                    # Convert wrapper line-number to user-code line-number (1-based).
                    user_lineno = frame.f_lineno - __USER_CODE_START_LINE__ + 1

                    __trace_events__.append({{
                        "lineno": user_lineno,
                        "function": frame.f_code.co_name,
                        "stack": stack,
                        "locals": locals_snapshot,
                    }})
                except Exception:
                    # Tracing must not break execution
                    pass

                return __tracer__

            def __user_main__():
                sys.settrace(__tracer__)
                try:
                    global __USER_CODE_START_LINE__, __USER_CODE_END_LINE__
                    __USER_CODE_START_LINE__ = sys._getframe().f_lineno + 1
                    {textwrap.indent(code, "    ")}
                    __USER_CODE_END_LINE__ = sys._getframe().f_lineno - 1
                    {tests_block if tests_block else "pass"}
                finally:
                    sys.settrace(None)

            if __name__ == "__main__":
                ok = True
                try:
                    __user_main__()
                except Exception:
                    ok = False
                    # Let Python print the traceback to stderr by re-raising.
                    raise
                finally:
                    # Marker is used by backend to parse trace JSON.
                    print("__PYQUEST_TRACE__" + json.dumps(__trace_events__, ensure_ascii=False, separators=(",", ":")), flush=True)
            """
        )
    else:
        tests_part = ""
        if tests_code and tests_code.strip():
            tests_part = textwrap.indent(tests_code, "    ")
        wrapped = textwrap.dedent(
            f"""
            def __user_main__():
            {textwrap.indent(code, "    ")}
            {tests_part if tests_part else ""}

            if __name__ == "__main__":
                __user_main__()
            """
        )

    with tempfile.TemporaryDirectory() as tmp:
        script_path = os.path.join(tmp, "main.py")
        with open(script_path, "w", encoding="utf-8") as f:
            f.write(wrapped)

        # Hard limits are enforced primarily by the container runtime.
        # This timeout protects the request path.
        try:
            proc = subprocess.run(
                [sys.executable, script_path],
                input=b"",
                capture_output=True,
                timeout=timeout_ms / 1000,
                env={"PYTHONIOENCODING": "utf-8"},
            )
            stdout_raw = proc.stdout.decode("utf-8", errors="replace")
            stderr = proc.stderr.decode("utf-8", errors="replace")
            success = proc.returncode == 0

            if step_through:
                marker = "__PYQUEST_TRACE__"
                idx = stdout_raw.rfind(marker)
                if idx != -1:
                    trace_json = stdout_raw[idx + len(marker) :].strip()
                    stdout = stdout_raw[:idx].rstrip()
                    try:
                        trace = json.loads(trace_json)
                    except Exception:
                        trace = None
                    return ExecuteResponse(stdout=stdout, stderr=stderr, success=success, trace=trace)

                # Marker not found: return best-effort without trace.
                return ExecuteResponse(stdout=stdout_raw, stderr=stderr, success=success, trace=None)

            return ExecuteResponse(stdout=stdout_raw, stderr=stderr, success=success, trace=None)
        except subprocess.TimeoutExpired:
            return ExecuteResponse(stdout="", stderr="Timeout while executing code", success=False, trace=None)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Sandbox error: {e}")


@app.get("/healthz")
def healthz():
    return {"ok": True}


@app.post("/execute", response_model=ExecuteResponse)
def execute(req: ExecuteRequest):
    return _run_python(
        req.code,
        req.timeout_ms,
        step_through=bool(req.step_through),
        max_trace_events=req.max_trace_events,
        tests_code=req.tests_code,
    )

