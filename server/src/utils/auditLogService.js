import AuditLog from "../models/auditLog.models.js";

const createAuditLog = async ({
  workspaceId,
  projectId,
  taskId,
  performedBy,
  actionType,
  changes,
}) => {
  try {
    await AuditLog.create({
      workspaceId,
      projectId,
      taskId,
      performedBy,
      actionType,
      changes,
    });
  } catch (error) {
    console.error("Failed to create audit log", error);
  }
};

export default createAuditLog;
