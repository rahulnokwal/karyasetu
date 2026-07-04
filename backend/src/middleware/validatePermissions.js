import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import WorkspaceMember from "../models/workspaceMember.models.js";
import ProjectMember from "../models/projectMember.js";
import Task from "../models/task.models.js";
import Note from "../models/note.model.js";

const validatePermissions = (allowedRoles = []) => {
  return asyncHandler(async (req, res, next) => {
    const { workspaceId } = req.params;
    if (!workspaceId) {
      throw new apiError(400, "Workspace ID is missing");
    }

    const membership = await WorkspaceMember.findOne({
      workspaceId: workspaceId,
      userId: req.user._id,
    });
    if (!membership) {
      throw new apiError(404, "Workspace not found or you are not a member");
    }

    const currentRole = membership.role;
    req.workspaceRole = currentRole;
    if (!allowedRoles.includes(currentRole)) {
      throw new apiError(
        403,
        "You do not have permission to perform this action in this workspace"
      );
    }
    next();
  });
};

const validateProjectPermissions = (allowedRoles = []) => {
  return asyncHandler(async (req, res, next) => {
    let projectId = req.params.projectId;

    if (!projectId && req.params.taskId) {
      const task = await Task.findById(req.params.taskId).select("projectId");
      if (!task) throw new apiError(404, "Task not found");
      projectId = task.projectId;
    }

    if (!projectId && req.params.noteId) {
      const note = await Note.findById(req.params.noteId).select("projectId");
      if (!note) throw new apiError(404, "Note not found");
      projectId = note.projectId;
    }

    if (!projectId) throw new apiError(404, "Project Id is missing");

    const membership = await ProjectMember.findOne({
      userId: req.user._id,
      projectId: projectId,
    });
    if (!membership) {
      throw new apiError(
        404,
        "Project not found or you are not a Project Member"
      );
    }
    const currentRole = membership.role;
    req.projectRole = currentRole;
    if (!allowedRoles.includes(currentRole)) {
      throw new apiError(
        403,
        "You do not have permission to perform this action in this project"
      );
    }
    next();
  });
};

export { validatePermissions, validateProjectPermissions };
