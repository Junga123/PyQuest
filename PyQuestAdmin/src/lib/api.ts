const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('pyquest_admin_token');
}

export async function api<T = any>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = true, ...init } = options;
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string>),
  };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  if (init.body && !headers['Content-Type'] && !(init.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return null as T;
  return res.json() as Promise<T>;
}

export async function getLessons(): Promise<{ lessons: any[] }> {
  return api('/api/public/lessons', { method: 'GET', auth: false });
}

export async function getLesson(id: string): Promise<{ lesson: any }> {
  return api(`/api/public/lessons/${id}`, { method: 'GET', auth: false });
}

export async function getTasks(lessonId: string): Promise<{ tasks: any[] }> {
  return api(`/api/public/tasks?lessonId=${lessonId}`, { method: 'GET', auth: false });
}
