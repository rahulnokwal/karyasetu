import Router from "express";
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

const router = Router({ mergeParams: true });

router.route("/task-info").get(userAuth, getTaskActivity);

router
  .route("/project-info")
  .get(
    userAuth,
    validateProjectPermissions(AvailableProjectRoles),
    getProjectActivity
  );

router
  .route("/workspace-info")
  .get(
    userAuth,
    validatePermissions([UserRoleEnum.OWNER, UserRoleEnum.ADMIN]),
    getWorkspaceActivity
  );

export default router;
