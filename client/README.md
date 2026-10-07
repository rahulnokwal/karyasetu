# KaryaSetu Frontend

A modern, high-performance project management web application built with **React** (pure JavaScript / JSX) and **Tailwind CSS**, designed to integrate with the KaryaSetu REST API.

## ✨ Features

- **Pure JavaScript + React**: Clean, modern component architecture using JSX and standard JavaScript.
- **Two-Tier RBAC**:
  - Workspace Tier (`OWNER`, `ADMIN`, `MEMBER`)
  - Project Tier (`PROJECT_ADMIN`, `EDITOR`, `VIEWER`)
- **Drag-and-Drop Kanban Board**:
  - Powered by `@hello-pangea/dnd` and `mudder` for lexical string ordering (fractional indexing).
  - Cross-column status transitions with assignee enforcement.
  - Soft-delete ("CANCELLED") handling.
- **Authentication Lifecycle**:
  - JWT Access Token in-memory + silent token refresh via Axios response interceptors.
  - Email verification floating banner with a 2-minute cooldown timer.
  - Password recovery and reset via tokens.
  - Workspace invitation acceptance workflow (`/invitation-accept?token=...`).
- **File Attachments**: Upload and preview file attachments (Cloudinary storage integration).
- **Task Notes & Discussions**: Real-time collaborative notes per task with author and admin edit/delete permissions.
- **Comprehensive Audit Trail**: Workspace, Project, and Task activity logs with visual change diffs.

## 🛠 Tech Stack

- **Library**: React 18
- **Language**: JavaScript (ESNext + JSX)
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios with automatic 401 refresh interceptors
- **Kanban Reordering**: `mudder` (lexical ordering) & `@hello-pangea/dnd`
- **Icons**: Lucide React
- **Notifications**: Sonner

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

Ensure the KaryaSetu backend is running on `http://localhost:3000`.

```bash
npm run dev
```

The Vite development server will start at `http://localhost:5173` with a proxy forwarding `/api` calls directly to the backend.

### 3. Production Build

```bash
npm run build
```
