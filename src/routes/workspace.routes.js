import { Router } from "express";
import { workspaceValidation } from "../validators/index.js";
import {
  createWorkspace,
  listWorkspaces,
  deleteWorkspace,
} from "../controllers/workspace.controller.js";
import validator from "../middleware/validator.middleware.js";
import userAuth from "../middleware/userAuth.middleware.js";
import validatePermissions from "../middleware/validatePermissions.js";
import { UserRoleEnum } from "../constant.js";

const router = Router();
router
  .route("/workspaces")
  .post(userAuth, workspaceValidation(), validator, createWorkspace);
router.route("/workspaces").get(userAuth, listWorkspaces);
router
  .route("/workspaces/:workspaceId")
  .delete(userAuth, validatePermissions([UserRoleEnum.OWNER]), deleteWorkspace);
export default router;
