# DevBoard API Reference

## Base URL
http://localhost:5000

## Authentication
All routes except /register and /login require:
Authorization: Bearer {token}

---

## Auth
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/auth/register | Register new user | No |
| POST | /api/auth/login | Login and get token | No |
| GET | /api/auth/me | Get logged in user | Yes |

---

## Projects
| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| POST | /api/projects | Create a project | Any member |
| GET | /api/projects | Get all your projects | Any member |
| GET | /api/projects/:id | Get single project | Member |
| PATCH | /api/projects/:id | Update project | Owner |
| DELETE | /api/projects/:id | Delete project | Owner |

---

## Members
| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| GET | /api/projects/:id/members | List all members | Member |
| POST | /api/projects/:id/members | Invite a member | Owner |
| DELETE | /api/projects/:id/members/:userId | Remove a member | Owner |

---

## Issues
| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| POST | /api/projects/:id/issues | Create an issue | Member |
| GET | /api/projects/:id/issues | Get all issues | Member |
| GET | /api/projects/:id/issues/:issueId | Get single issue | Member |
| PATCH | /api/projects/:id/issues/:issueId | Update an issue | Member |
| PATCH | /api/projects/:id/issues/:issueId/status | Transition status | Member |
| DELETE | /api/projects/:id/issues/:issueId | Delete an issue | Member |

---

## Status Transitions
| From | Can go to |
|------|-----------|
| todo | in_progress |
| in_progress | done, todo |
| done | todo |

---

## Database Tables
- users
- projects
- project_members
- issues