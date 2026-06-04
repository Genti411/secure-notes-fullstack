import { useState } from "react";
import {
  createNote,
  listNotes,
  login,
  logout,
  register,
  type Note,
} from "./api";

export function App() {
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  async function refresh() {
    setNotes(await listNotes());
  }

  async function onAuth(mode: "login" | "register") {
    setError(null);
    try {
      if (mode === "register") await register(username, password);
      await login(username, password);
      setAuthed(true);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await createNote(title, body);
    setTitle("");
    setBody("");
    await refresh();
  }

  if (!authed) {
    return (
      <main style={wrap}>
        <h1>Secure Notes</h1>
        <p style={{ opacity: 0.7 }}>Django REST + JWT + PostgreSQL</p>
        <input style={inp} placeholder="username" value={username}
               onChange={(e) => setUsername(e.target.value)} />
        <input style={inp} placeholder="password" type="password" value={password}
               onChange={(e) => setPassword(e.target.value)} />
        <div style={{ display: "flex", gap: 8 }}>
          <button style={btn} onClick={() => onAuth("login")}>Log in</button>
          <button style={btnAlt} onClick={() => onAuth("register")}>Register</button>
        </div>
        {error && <p style={{ color: "crimson" }}>{error}</p>}
      </main>
    );
  }

  return (
    <main style={wrap}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Your notes</h1>
        <button style={btnAlt} onClick={() => { logout(); setAuthed(false); setNotes([]); }}>
          Log out
        </button>
      </div>
      <form onSubmit={onCreate} style={{ display: "grid", gap: 8 }}>
        <input style={inp} placeholder="title" value={title}
               onChange={(e) => setTitle(e.target.value)} />
        <textarea style={inp} placeholder="body" value={body}
                  onChange={(e) => setBody(e.target.value)} />
        <button style={btn} type="submit">Add note</button>
      </form>
      <ul>
        {notes.map((n) => (
          <li key={n.id}><strong>{n.title}</strong> — {n.body}</li>
        ))}
        {notes.length === 0 && <p style={{ opacity: 0.6 }}>No notes yet.</p>}
      </ul>
    </main>
  );
}

const wrap: React.CSSProperties = {
  fontFamily: "system-ui, sans-serif", maxWidth: "32rem",
  margin: "3rem auto", padding: "0 1rem", display: "grid", gap: "0.75rem",
};
const inp: React.CSSProperties = {
  padding: "0.5rem", borderRadius: 8, border: "1px solid #8888", font: "inherit",
};
const btn: React.CSSProperties = {
  padding: "0.5rem 1rem", borderRadius: 8, border: 0,
  background: "#2563eb", color: "#fff", cursor: "pointer",
};
const btnAlt: React.CSSProperties = { ...btn, background: "#6b7280" };
