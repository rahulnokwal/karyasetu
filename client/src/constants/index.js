export const WorkspaceRole = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
};

export const ProjectRole = {
  PROJECT_ADMIN: "PROJECT_ADMIN",
  EDITOR: "EDITOR",
  VIEWER: "VIEWER",
};

export const TaskStatus = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  IN_REVIEW: "IN_REVIEW",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export const ActionType = {
  CREATED: "CREATED",
  UPDATED: "UPDATED",
  DELETED: "DELETED",
  CANCELLED: "CANCELLED",
};

export const TASK_COLUMNS = [
  { id: TaskStatus.TODO, title: "To Do", color: "bg-slate-500" },
  { id: TaskStatus.IN_PROGRESS, title: "In Progress", color: "bg-blue-500" },
  { id: TaskStatus.IN_REVIEW, title: "In Review", color: "bg-amber-500" },
  { id: TaskStatus.COMPLETED, title: "Completed", color: "bg-emerald-500" },
];
