import AuditLog from "../models/auditLog.models.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import Task from "../models/task.models.js";
import ProjectMember from "../models/projectMember.js";

const getTaskActivity = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  if (!taskId) throw new apiError(400, "Task Id is missing");

  const task = await Task.findById(taskId);
  if (!task) throw new apiError(404, "Task not found");

  const projectMember = await ProjectMember.findOne({
    userId: req.user._id,
    projectId: task.projectId,
  });
  if (!projectMember)
    throw new apiError(
      404,
      "Your are not a Project Member so, not allowed to see Task Logs."
    );

  const AuditLogs = await AuditLog.find({
    taskId,
    projectId: task.projectId,
  })
    .sort({ createdAt: -1 })
    .lean()
    .populate("performedBy", "fullName email profile");

  res
    .status(200)
    .json(new apiResponse(200, "Logs fetched successfully", AuditLog));
});

export { getTaskActivity };
