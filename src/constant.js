export const DB_NAME = "nexusBase";

export const UserRoleEnum = {
  OWNER: "OWNER",
  PROJECT_ADMIN: "PROJECT_ADMIN",
  EDITOR: "EDITOR",
  VIEWER: "VIEWER",
};

export const AvailableUserRole = Object.values(UserRoleEnum);

export const TaskStatusEnum = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  IN_REVIEW: "IN_REVIEW",
  COMPLETED: "COMPLETED",
};

export const AvailableTaskStatus = Object.values(TaskStatusEnum);

export const actionTypeEnum = {
  CREATED: "CREATED",
  UPDATED: "UPDATED",
  DELETED: "DELETED",
  COMMENTED: "COMMENTED",
};

export const actionStatus = Object.values(actionTypeEnum);
