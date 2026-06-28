import { Router } from "express";
import {
  projectValidation,
  projectUpdateValidation,
} from "../validators/index.js";
import {
  createProject,
  listProjects,
  getProjectDetails,
  updateProjectDetails,
  deleteProject,
  addProjectMember,
  updateProjectMemberRole,
  restrictProjectAccess,
  listProjectMembers,
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
  ProjectRoleEnum,
} from "../constant.js";
import taskRouter from "./task.routes.js";
import auditLogRouter from "./auditLog.routes.js";

const router = Router({ mergeParams: true });

router.use("/:projectId/tasks", taskRouter);

router.use("/:projectId/activity", auditLogRouter);

router
  .route("/")
  .post(
    userAuth,
    validatePermissions([UserRoleEnum.OWNER, UserRoleEnum.ADMIN]),
    projectValidation(),
    validate,
    createProject
  )
  .get(userAuth, validatePermissions(AvailableUserRole), listProjects);

router
  .route("/:projectId")
  .get(
    userAuth,
    validateProjectPermissions(AvailableProjectRoles),
    getProjectDetails
  )
  .patch(
    userAuth,
    validateProjectPermissions([
      ProjectRoleEnum.PROJECT_ADMIN,
      ProjectRoleEnum.EDITOR,
    ]),
    projectUpdateValidation(),
    validate,
    updateProjectDetails
  )
  .delete(
    userAuth,
    validateProjectPermissions([ProjectRoleEnum.PROJECT_ADMIN]),
    deleteProject
  );

router
  .route("/:projectId/members")
  .post(
    userAuth,
    validateProjectPermissions([ProjectRoleEnum.PROJECT_ADMIN]),
    addProjectMember
  )
  .get(
    userAuth,
    validateProjectPermissions(AvailableProjectRoles),
    listProjectMembers
  );

router
  .route("/:projectId/members/:userId")
  .patch(
    userAuth,
    validateProjectPermissions([ProjectRoleEnum.PROJECT_ADMIN]),
    updateProjectMemberRole
  )
  .delete(
    userAuth,
    validateProjectPermissions([ProjectRoleEnum.PROJECT_ADMIN]),
    restrictProjectAccess
  );

export default router;
