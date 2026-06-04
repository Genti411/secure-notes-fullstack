// Tiny typed API client for the Django backend. The access token is kept in
// memory (module scope) — not in localStorage — to avoid XSS token theft.

export interface Note {
  id: number;
  owner: string;
  title: string;
  body: string;
  created: string;
}

let accessToken: string | null = null;

export function isLoggedIn(): boolean {
  return accessToken !== null;
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

export async function login(username: string, password: string): Promise<void> {
  const res = await fetch("/api/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await json<{ access: string }>(res);
  accessToken = data.access;
}

export async function register(username: string, password: string): Promise<void> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  await json(res);
}

function authHeaders(): HeadersInit {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export async function listNotes(): Promise<Note[]> {
  return json<Note[]>(await fetch("/api/notes", { headers: authHeaders() }));
}

export async function createNote(title: string, body: string): Promise<Note> {
  const res = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ title, body }),
  });
  return json<Note>(res);
}

export function logout(): void {
  accessToken = null;
}
