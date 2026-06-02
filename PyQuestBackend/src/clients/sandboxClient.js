async function executeInSandbox({ sandboxBaseUrl, code, testsCode, stepThrough, timeoutMs }) {
  const res = await fetch(`${sandboxBaseUrl}/execute`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      code,
      step_through: !!stepThrough,
      tests_code: testsCode,
      timeout_ms: timeoutMs,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Sandbox returned ${res.status}: ${text}`);
  }

  return res.json();
}

module.exports = { executeInSandbox };

