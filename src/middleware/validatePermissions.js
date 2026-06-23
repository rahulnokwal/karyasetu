import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import WorkspaceMember from "../models/workspaceMember.models.js";
import ProjectMember from "../models/projectMember.js";

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
    const { projectId } = req.params;
    if (!projectId) throw new apiError(400, "Project ID is missing");

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
