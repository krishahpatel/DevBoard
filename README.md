# DevBoard

A lightweight, full-stack project management tool built for developers — create projects, invite teammates, assign issues, and track progress on a real-time Kanban board.

**Live demo:** https://devboard-frontend-theta.vercel.app
**Backend API:** https://devboard-backend-fzco.onrender.com

> Note: the backend is hosted on Render's free tier, which spins down after 15 minutes of inactivity. The first request after idle time may take 20–30 seconds to respond while the server wakes up.

---

## Overview

DevBoard is a Jira/Linear-style project management tool. Users can create projects, invite team members with role-based access, create issues, assign them to teammates, and move them across a Kanban board through validated status transitions.

Built to demonstrate a complete full-stack skill set: relational database design, authentication, REST API design, role-based access control, and a polished React frontend — all built from scratch without third-party auth or backend-as-a-service tools.

---

## Features

- **Authentication** — secure registration and login with JWT and bcrypt password hashing
- **Projects** — create, view, and delete projects
- **Team members** — invite teammates by email, owner-only role enforcement, remove members
- **Issues** — full CRUD with title, description, priority, assignee, and due date
- **Kanban board** — drag-and-drop issue management across Todo, In Progress, and Done columns
- **Status transitions** — enforced state machine (e.g. a "Done" issue can't jump straight back to "In Progress")
- **Role-based access control** — owners and members have different permissions on every protected route

---

## Tech Stack

**Frontend**
- React (Vite)
- React Router
- Axios
- `@hello-pangea/dnd` for drag-and-drop

**Backend**
- Node.js + Express
- PostgreSQL
- JWT for authentication
- bcrypt for password hashing

**Deployment**
- Backend — Render
- Frontend — Vercel
- Database — Render PostgreSQL

---

## Architecture

```
DevBoard/
├── devboard-backend/
│   ├── src/
│   │   ├── config/        # database connection
│   │   ├── middleware/    # JWT auth middleware
│   │   ├── routes/        # auth, projects, members, issues
│   │   └── index.js
│   └── notes.md           # full API reference
└── devboard-frontend/
    ├── src/
    │   ├── api/            # axios instance with token interceptor
    │   ├── components/     # reusable UI pieces (board, modals, navbar)
    │   ├── pages/           # Login, Register, Dashboard, ProjectDetail
    │   └── App.jsx
    └── vercel.json
```

### Database schema

Four relational tables with foreign key constraints:

- **users** — id, name, email, password_hash
- **projects** — id, name, description, owner_id
- **project_members** — links users to projects with a role (`owner` / `member`)
- **issues** — title, description, status, priority, assignee_id, project_id, due_date

### Status transition rules

| From | Can move to |
|---|---|
| `todo` | `in_progress` |
| `in_progress` | `done`, `todo` |
| `done` | `todo` |

Enforced server-side — invalid transitions are rejected with a 400 error regardless of what the client sends.

---

## API Reference

Full endpoint documentation is in [`devboard-backend/notes.md`](./devboard-backend/notes.md). Summary:

```
Auth
  POST   /api/auth/register
  POST   /api/auth/login
  GET    /api/auth/me

Projects
  POST   /api/projects
  GET    /api/projects
  GET    /api/projects/:id
  PATCH  /api/projects/:id
  DELETE /api/projects/:id

Members
  GET    /api/projects/:id/members
  POST   /api/projects/:id/members
  DELETE /api/projects/:id/members/:userId

Issues
  POST   /api/projects/:id/issues
  GET    /api/projects/:id/issues
  GET    /api/projects/:id/issues/:issueId
  PATCH  /api/projects/:id/issues/:issueId
  PATCH  /api/projects/:id/issues/:issueId/status
  DELETE /api/projects/:id/issues/:issueId
```

All routes except register and login require a `Bearer` token in the `Authorization` header.

---

## Running Locally

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed locally

### Backend setup

```bash
cd devboard-backend
npm install
```

Create a `.env` file:
```
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=devboard
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your_secret_key
```

Create the database and run the table creation SQL found in `devboard-backend/notes.md`, then:
```bash
npm run dev
```

### Frontend setup

```bash
cd devboard-frontend
npm install
```

Create a `.env` file:
```
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

Visit `http://localhost:5173`.

---

## Key Design Decisions

**Why PostgreSQL over MongoDB/SQLite** — the data is inherently relational (users belong to projects, issues belong to projects and have assignees). Foreign keys and joins map naturally to this domain and enforce data integrity at the database level.

**Why JWT over sessions** — stateless authentication that scales horizontally without needing shared session storage, and keeps the backend and frontend cleanly decoupled.

**Why role checks live in middleware, not controllers** — keeps authorization logic centralized and reusable across every protected route instead of duplicated in each handler.

**Optimistic UI for drag-and-drop** — the card moves instantly on drag, then the status update is sent to the server in the background. If the server rejects the transition, the UI reverts and shows the error — this keeps the board feeling responsive.

---

## What I'd Improve With More Time

- Real-time updates via WebSockets so multiple users see board changes live
- Email notifications on issue assignment and due dates
- Pagination for projects with a large number of issues
- Activity log / audit trail per issue
- Tests (unit tests for the status transition logic, integration tests for the API)

---

## Author

Built by Krisha as a portfolio project to demonstrate full-stack engineering skills — authentication, relational database design, REST API architecture, and a production deployment pipeline.
