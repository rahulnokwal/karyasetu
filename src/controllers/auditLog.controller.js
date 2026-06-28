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

  const auditLogs = await AuditLog.find({
    taskId,
    projectId: task.projectId,
  })
    .sort({ createdAt: -1 })
    .lean()
    .populate("performedBy", "fullName email profile");

  res
    .status(200)
    .json(new apiResponse(200, "Logs fetched successfully", auditLogs));
});

const getProjectActivity = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const [auditLogs, totalDocument] = await Promise.all([
    AuditLog.find({
      projectId,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .populate("performedBy", "fullName email profile"),
    AuditLog.countDocuments({ projectId }),
  ]);

  const totalPage = Math.ceil(totalDocument / limit);

  res.status(200).json(
    new apiResponse(200, "Project AuditLog fetched successfully", {
      auditLogs,
      totalDocument,
      totalPage,
      currentPage: page,
      hasNextPage: page < totalPage,
    })
  );
});

const getWorkspaceActivity = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const [auditLogs, totalDocument] = await Promise.all([
    AuditLog.find({
      workspaceId,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .populate("performedBy", "fullName email profile"),
    AuditLog.countDocuments({ workspaceId }),
  ]);

  const totalPage = Math.ceil(totalDocument / limit);

  res.status(200).json(
    new apiResponse(200, "Workspace AuditLog fetched successfully", {
      auditLogs,
      totalDocument,
      totalPage,
      currentPage: page,
      hasNextPage: page < totalPage,
    })
  );
});

export { getTaskActivity, getProjectActivity, getWorkspaceActivity };
