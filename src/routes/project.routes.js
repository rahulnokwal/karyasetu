import { Router } from "express";
import { projectValidation } from "../validators/index.js";
import {
  createProject,
  listProjects,
  getProjectDetails,
} from "../controllers/project.controller.js";
import userAuth from "../middleware/userAuth.middleware.js";
import {
  validatePermissions,
  validateProjectPermissions,
} from "../middleware/validatePermissions.js";
import validate from "../middleware/validator.middleware.js";
import {
  UserRoleEnum,
  AvailableUserRole,
  AvailableProjectRoles,
} from "../constant.js";

const router = Router({ mergeParams: true });
router
  .route("/")
  .post(
    userAuth,
    validatePermissions([UserRoleEnum.OWNER, UserRoleEnum.ADMIN]),
    projectValidation(),
    validate,
    createProject
  );

router
  .route("/")
  .get(userAuth, validatePermissions(AvailableUserRole), listProjects);

router
  .route("/:projectId")
  .get(
    userAuth,
    validateProjectPermissions(AvailableProjectRoles),
    getProjectDetails
  );
export default router;
