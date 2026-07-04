import { Router } from "express";
import {
  createTask,
  listProjectTasks,
  getMyTasks,
  getTaskById,
  updateTaskInfo,
  assignTask,
  changeStatus,
  deleteTask,
  reorderTask,
} from "../controllers/task.controller.js";
import {
  createTaskValidation,
  updateTaskValidation,
} from "../validators/index.js";
import userAuth from "../middleware/userAuth.middleware.js";
import { validateProjectPermissions } from "../middleware/validatePermissions.js";
import validate from "../middleware/validator.middleware.js";
import { AvailableProjectRoles, ProjectRoleEnum } from "../constant.js";
import { uploadTaskNotes } from "../middleware/multer.middleware.js";
import { nestedNoteRouter } from "./note.routes.js";
import { taskActivityRouter } from "./auditLog.routes.js";

const nestedTaskRouter = Router({ mergeParams: true });
nestedTaskRouter
  .route("/")
  .post(
    userAuth,
    validateProjectPermissions([
      ProjectRoleEnum.PROJECT_ADMIN,
      ProjectRoleEnum.EDITOR,
    ]),
    uploadTaskNotes.array("uploadFiles", 3),
    createTaskValidation(),
    validate,
    createTask
  )
  .get(
    userAuth,
    validateProjectPermissions(AvailableProjectRoles),
    listProjectTasks
  );

const shallowTaskRouter = Router();

shallowTaskRouter.use("/:taskId/notes", nestedNoteRouter);

shallowTaskRouter.use("/:taskId/activity", taskActivityRouter);

shallowTaskRouter.route("/my-tasks").get(userAuth, getMyTasks);

shallowTaskRouter
  .route("/:taskId")
  .get(userAuth, getTaskById)
  .patch(
    userAuth,
    validateProjectPermissions([
      ProjectRoleEnum.PROJECT_ADMIN,
      ProjectRoleEnum.EDITOR,
    ]),
    uploadTaskNotes.array("uploadFiles", 3),
    updateTaskValidation(),
    validate,
    updateTaskInfo
  )
  .delete(
    userAuth,
    validateProjectPermissions([
      ProjectRoleEnum.PROJECT_ADMIN,
      ProjectRoleEnum.EDITOR,
    ]),
    deleteTask
  );

shallowTaskRouter
  .route("/:taskId/assign")
  .patch(
    userAuth,
    validateProjectPermissions([
      ProjectRoleEnum.PROJECT_ADMIN,
      ProjectRoleEnum.EDITOR,
    ]),
    assignTask
  );

shallowTaskRouter
  .route("/:taskId/reorder")
  .patch(
    userAuth,
    validateProjectPermissions([
      ProjectRoleEnum.PROJECT_ADMIN,
      ProjectRoleEnum.EDITOR,
    ]),
    reorderTask
  );

shallowTaskRouter.route("/:taskId/status").patch(userAuth, changeStatus);

export { nestedTaskRouter, shallowTaskRouter };
