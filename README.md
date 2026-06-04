# Secure Notes — Full-Stack (Django + React + PostgreSQL)

A small, secure full-stack app: a **Django REST Framework** API with stateless
**JWT** auth and row-level **RBAC**, a **React + TypeScript** frontend, and
**PostgreSQL** for storage. Users sign in and manage *their own* notes; a staff
user can see all notes.

| Area | What's shown |
|------|--------------|
| **Django / DRF** | ModelViewSet, serializers, JWT auth (SimpleJWT), password validation |
| **React / TypeScript** | Vite SPA, typed API client, login + CRUD UI |
| **PostgreSQL** | Django ORM persistence (SQLite fallback for tests) |
| **Security / RBAC** | row-level ownership in `get_queryset` (other users' rows → 404, not 403), in-memory token (no localStorage), PBKDF2 password hashing, CORS allow-list, secrets via env |

---

## Architecture

```
browser ─▶ nginx (frontend) ─┬─ "/"     → React static bundle
                             └─ "/api/" → Django REST API ─▶ PostgreSQL
```

The frontend container serves the built SPA and reverse-proxies `/api` to the
backend, so the browser only ever talks to one origin.

## Run it

```bash
docker compose up --build
# Frontend: http://localhost:3000   (Register, then add notes)
# API:      http://localhost:8000/api/healthz
```

Stop: `docker compose down -v`.

## API

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/register` | public | Create a user (PBKDF2-hashed password) |
| POST | `/api/auth/token` | public | Obtain a JWT access/refresh pair |
| POST | `/api/auth/token/refresh` | public | Refresh an access token |
| GET/POST | `/api/notes` | JWT | List/create *your* notes (staff sees all) |
| GET/PUT/DELETE | `/api/notes/{id}` | JWT (owner) | Retrieve/update/delete one note |
| GET | `/api/healthz` | public | Liveness probe |

Example:

```bash
curl -s localhost:8000/api/auth/register -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"supersecret"}'
TOKEN=$(curl -s localhost:8000/api/auth/token -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"supersecret"}' | python -c "import sys,json;print(json.load(sys.stdin)['access'])")
curl -s localhost:8000/api/notes -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"title":"First","body":"hello"}'
curl -s localhost:8000/api/notes -H "Authorization: Bearer $TOKEN"
```

## Security choices (and why)

- **Row-level RBAC in `get_queryset`** — the queryset *is* the boundary, so a
  non-staff user can never retrieve another user's note (it 404s, not 403, so
  IDs can't be probed). Staff users see everything.
- **Stateless JWT** (SimpleJWT) — short-lived access token + refresh token.
- **Access token kept in memory** on the client, never `localStorage`, to limit
  XSS token theft.
- **PBKDF2 password hashing** + Django password validators (min length, common
  password list).
- **CORS allow-list** from env, not `*`.
- **All secrets via environment** (`DJANGO_SECRET_KEY`, DB creds).

## Layout

```
backend/   Django project (config/) + api app (models, serializers, views, urls, migration)
frontend/  Vite + React + TS SPA (src/api.ts typed client, src/App.tsx UI) + nginx
docker-compose.yml   postgres + backend + frontend
```
