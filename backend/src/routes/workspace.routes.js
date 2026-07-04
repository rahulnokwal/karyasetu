import { Router } from "express";
import { workspaceValidation, emailValidation } from "../validators/index.js";
import {
  createWorkspace,
  listWorkspaces,
  deleteWorkspace,
  renameWorkspace,
  sendWorkspaceInvitation,
  acceptInvitation,
  listWorkspaceMember,
  modifyMemberRole,
  transferOwnershipAccess,
  restrictWorkspaceAccess,
  leaveWorkspace,
} from "../controllers/workspace.controller.js";
import userAuth from "../middleware/userAuth.middleware.js";
import { validatePermissions } from "../middleware/validatePermissions.js";
import { UserRoleEnum, AvailableUserRole } from "../constant.js";
import validate from "../middleware/validator.middleware.js";
import { nestedProjectRouter } from "./project.routes.js";
import { workspaceActivityRouter } from "./auditLog.routes.js";

const router = Router();

router.use("/:workspaceId/projects", nestedProjectRouter);

router.use("/:workspaceId/activity", workspaceActivityRouter);

router
  .route("/")
  .post(userAuth, workspaceValidation(), validate, createWorkspace)
  .get(userAuth, listWorkspaces);

router
  .route("/:workspaceId")
  .delete(userAuth, validatePermissions([UserRoleEnum.OWNER]), deleteWorkspace)
  .patch(
    userAuth,
    validatePermissions([UserRoleEnum.OWNER, UserRoleEnum.ADMIN]),
    workspaceValidation(),
    validate,
    renameWorkspace
  );

router
  .route("/:workspaceId/invites")
  .post(
    userAuth,
    validatePermissions([UserRoleEnum.OWNER, UserRoleEnum.ADMIN]),
    emailValidation(),
    validate,
    sendWorkspaceInvitation
  );

router.route("/invites-accept/:token").post(userAuth, acceptInvitation);

router
  .route("/:workspaceId/members")
  .get(userAuth, validatePermissions(AvailableUserRole), listWorkspaceMember);

router
  .route("/:workspaceId/members/:userId")
  .patch(
    userAuth,
    validatePermissions([UserRoleEnum.OWNER, UserRoleEnum.ADMIN]),
    modifyMemberRole
  )
  .delete(
    userAuth,
    validatePermissions([UserRoleEnum.OWNER, UserRoleEnum.ADMIN]),
    restrictWorkspaceAccess
  );

router
  .route("/:workspaceId/transfer-ownership/:userId")
  .patch(
    userAuth,
    validatePermissions([UserRoleEnum.OWNER]),
    transferOwnershipAccess
  );

router
  .route("/:workspaceId/leave")
  .delete(userAuth, validatePermissions(AvailableUserRole), leaveWorkspace);

export default router;
