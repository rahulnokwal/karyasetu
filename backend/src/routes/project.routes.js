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
import { nestedTaskRouter } from "./task.routes.js";
import { projectActivityRouter } from "./auditLog.routes.js";

const nestedProjectRouter = Router({ mergeParams: true });
nestedProjectRouter
  .route("/")
  .post(
    userAuth,
    validatePermissions([UserRoleEnum.OWNER, UserRoleEnum.ADMIN]),
    projectValidation(),
    validate,
    createProject
  )
  .get(userAuth, validatePermissions(AvailableUserRole), listProjects);

const shallowProjectRouter = Router();

shallowProjectRouter.use("/:projectId/tasks", nestedTaskRouter);
shallowProjectRouter.use("/:projectId/activity", projectActivityRouter);

shallowProjectRouter
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

shallowProjectRouter
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

shallowProjectRouter
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

export { nestedProjectRouter, shallowProjectRouter };
