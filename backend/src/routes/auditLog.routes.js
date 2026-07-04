import { Router } from "express";
import userAuth from "../middleware/userAuth.middleware.js";
import {
  validateProjectPermissions,
  validatePermissions,
} from "../middleware/validatePermissions.js";
import {
  getTaskActivity,
  getProjectActivity,
  getWorkspaceActivity,
} from "../controllers/auditLog.controller.js";
import { AvailableProjectRoles, UserRoleEnum } from "../constant.js";

const workspaceActivityRouter = Router({ mergeParams: true });
workspaceActivityRouter
  .route("/")
  .get(
    userAuth,
    validatePermissions([UserRoleEnum.OWNER, UserRoleEnum.ADMIN]),
    getWorkspaceActivity
  );

const projectActivityRouter = Router({ mergeParams: true });
projectActivityRouter
  .route("/")
  .get(
    userAuth,
    validateProjectPermissions(AvailableProjectRoles),
    getProjectActivity
  );

const taskActivityRouter = Router({ mergeParams: true });
taskActivityRouter.route("/").get(userAuth, getTaskActivity);

export { workspaceActivityRouter, projectActivityRouter, taskActivityRouter };
