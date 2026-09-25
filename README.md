# 🚀 Project Management REST API

A robust, scalable backend API for a comprehensive project and task management system. This system is designed with a focus on strict Role-Based Access Control (RBAC), data integrity, and high-performance querying.

## ✨ Engineering Highlights

- **Hybrid Routing Architecture:** Implements a deliberate mix of **Nested** and **Shallow** routing. Parent resources use nested routes (`/workspaces/:id/projects`) to maintain strict relational hierarchy, while individual resource mutations use shallow routes (`/tasks/:id`) to prevent deep-nesting anti-patterns and parameter dropping.
- **Granular Role-Based Access Control (RBAC):** Custom middleware intercepts requests to validate hierarchical permissions (Owner, Admin, Editor, Member) at the Workspace, Project, and Task levels before hitting the controllers.
- **Lexical Ordering for Kanban:** Uses LexoRank/fractional indexing principles to handle task reordering (`/tasks/:taskId/reorder`) efficiently without cascading database updates.
- **Comprehensive Audit Logging:** Tracks activity histories across Workspaces, Projects, and Tasks to maintain a clear system of record for all state mutations.

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js (v5.x)
- **Database:** MongoDB & Mongoose
- **Authentication:** JWT (Access & Refresh token rotation)
- **Storage:** Cloudinary (for profile pictures and task attachments)
- **Email:** Nodemailer (with Mailtrap for testing)

## ⚙️ Environment Variables

To run this project locally, create a `.env` file in the root directory and add the following credentials:

```env
MONGO_URI=YOUR_MONGODB_CONNECTION_URL
PORT=3000
CORS_ORIGIN=*

// mailtrap credentials
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USERNAME=YOUR_USERNAME
MAILTRAP_PASSWORD=YOUR_PASSWORD

CLIENT_URL=YOUR_CLIENT_URL

// node env
NODE_ENV=YOUR_ENVIRONMENT

//cloudinary credentials
CLOUDINARY_CLOUDNAME=YOUR_CLOUDNAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET
```

## 🌐 Base API Path

`Base URL: /api/v1`

---

## 🩺 Health Check

| Method | Endpoint        | Description           | Auth Required |
| :----- | :-------------- | :-------------------- | :------------ |
| `GET`  | `/healthcheck/` | Get API health status | No            |

---

## 🔐 Authentication & Users

**Base Path:** `/users`

| Method  | Endpoint                           | Description                            | Auth Required           |
| :------ | :--------------------------------- | :------------------------------------- | :---------------------- |
| `POST`  | `/register`                        | Register a new user                    | No                      |
| `POST`  | `/login`                           | Authenticate user & get tokens         | No                      |
| `POST`  | `/logout`                          | Terminate session                      | **Yes**                 |
| `POST`  | `/refresh-token`                   | Generate new access token              | No (Uses Refresh Token) |
| `GET`   | `/current-user`                    | Retrieve authenticated user profile    | **Yes**                 |
| `POST`  | `/change-password`                 | Update account password                | **Yes**                 |
| `GET`   | `/verify-email/:verificationToken` | Verify user email address              | No                      |
| `POST`  | `/resend-email-verification`       | Resend verification link               | **Yes**                 |
| `POST`  | `/forget-password-mail`            | Request password reset email           | No                      |
| `POST`  | `/reset-password/:passwordToken`   | Set new password via token             | No                      |
| `POST`  | `/update-profile`                  | Update profile picture (Multer upload) | **Yes**                 |
| `PATCH` | `/update-details`                  | Update basic user details              | **Yes**                 |

---

## 🏢 Workspaces

**Base Path:** `/workspaces`

| Method   | Endpoint                                   | Description                        | RBAC / Permissions  |
| :------- | :----------------------------------------- | :--------------------------------- | :------------------ |
| `POST`   | `/`                                        | Create a new workspace             | Authenticated User  |
| `GET`    | `/`                                        | List all user's workspaces         | Authenticated User  |
| `DELETE` | `/:workspaceId`                            | Delete a workspace                 | `OWNER`             |
| `PATCH`  | `/:workspaceId`                            | Rename workspace                   | `OWNER`, `ADMIN`    |
| `POST`   | `/:workspaceId/invites`                    | Send email invitation to workspace | `OWNER`, `ADMIN`    |
| `POST`   | `/invites-accept/:token`                   | Accept a workspace invitation      | Authenticated User  |
| `GET`    | `/:workspaceId/members`                    | List all workspace members         | Available User Role |
| `PATCH`  | `/:workspaceId/members/:userId`            | Update a member's role             | `OWNER`, `ADMIN`    |
| `DELETE` | `/:workspaceId/members/:userId`            | Restrict/Remove a member           | `OWNER`, `ADMIN`    |
| `PATCH`  | `/:workspaceId/transfer-ownership/:userId` | Transfer workspace ownership       | `OWNER`             |
| `DELETE` | `/:workspaceId/leave`                      | Leave the workspace                | Available User Role |
| `GET`    | `/:workspaceId/activity`                   | Get workspace audit logs           | `OWNER`, `ADMIN`    |

---

## 📁 Projects (Shallow Routing Implementation)

_Note: Creation/Listing uses the Workspace parent ID. Updates/Deletions use the direct Project ID._

| Method   | Endpoint                               | Description                              | RBAC / Permissions         |
| :------- | :------------------------------------- | :--------------------------------------- | :------------------------- |
| `POST`   | `/workspaces/:workspaceId/projects/`   | **[Nested]** Create a project            | Workspace `OWNER`, `ADMIN` |
| `GET`    | `/workspaces/:workspaceId/projects/`   | **[Nested]** List projects in workspace  | Workspace Member           |
| `GET`    | `/projects/:projectId`                 | **[Shallow]** Get project details        | Project Member             |
| `PATCH`  | `/projects/:projectId`                 | **[Shallow]** Update project details     | Project `ADMIN`, `EDITOR`  |
| `DELETE` | `/projects/:projectId`                 | **[Shallow]** Delete project             | Project `ADMIN`            |
| `POST`   | `/projects/:projectId/members`         | **[Shallow]** Add member to project      | Project `ADMIN`            |
| `GET`    | `/projects/:projectId/members`         | **[Shallow]** List project members       | Project Member             |
| `PATCH`  | `/projects/:projectId/members/:userId` | **[Shallow]** Update member role         | Project `ADMIN`            |
| `DELETE` | `/projects/:projectId/members/:userId` | **[Shallow]** Remove member from project | Project `ADMIN`            |
| `GET`    | `/projects/:projectId/activity`        | **[Shallow]** Get project audit logs     | Project Member             |

---

## ✅ Tasks (Shallow Routing Implementation)

_Note: Creation/Listing uses the Project parent ID. Updates/Deletions use the direct Task ID._

| Method   | Endpoint                      | Description                                           | RBAC / Permissions        |
| :------- | :---------------------------- | :---------------------------------------------------- | :------------------------ |
| `POST`   | `/projects/:projectId/tasks/` | **[Nested]** Create task (supports file upload)       | Project `ADMIN`, `EDITOR` |
| `GET`    | `/projects/:projectId/tasks/` | **[Nested]** List all tasks in a project              | Project Member            |
| `GET`    | `/tasks/my-tasks`             | **[Shallow]** Get tasks assigned to current user      | Authenticated User        |
| `GET`    | `/tasks/:taskId`              | **[Shallow]** Get specific task details               | Project Member (Dynamic)  |
| `PATCH`  | `/tasks/:taskId`              | **[Shallow]** Update task info (supports uploads)     | Project `ADMIN`, `EDITOR` |
| `DELETE` | `/tasks/:taskId`              | **[Shallow]** Delete a task                           | Project `ADMIN`, `EDITOR` |
| `PATCH`  | `/tasks/:taskId/assign`       | **[Shallow]** Assign a task to a user                 | Project `ADMIN`, `EDITOR` |
| `PATCH`  | `/tasks/:taskId/reorder`      | **[Shallow]** Reorder task position/priority          | Project `ADMIN`, `EDITOR` |
| `PATCH`  | `/tasks/:taskId/status`       | **[Shallow]** Change task status (e.g. To Do -> Done) | Authenticated User        |
| `GET`    | `/tasks/:taskId/activity`     | **[Shallow]** Get task audit logs                     | Authenticated User        |

---

## 📝 Notes (Shallow Routing Implementation)

_Note: Creation/Listing uses the Task parent ID. Updates/Deletions use the direct Note ID._

| Method   | Endpoint                | Description                           | RBAC / Permissions          |
| :------- | :---------------------- | :------------------------------------ | :-------------------------- |
| `POST`   | `/tasks/:taskId/notes/` | **[Nested]** Add a note to a task     | Project Member              |
| `GET`    | `/tasks/:taskId/notes/` | **[Nested]** Get all notes for a task | Project Member              |
| `PATCH`  | `/notes/:noteId`        | **[Shallow]** Update a specific note  | Note Author / Dynamic Check |
| `DELETE` | `/notes/:noteId`        | **[Shallow]** Delete a specific note  | Note Author / Dynamic Check |
