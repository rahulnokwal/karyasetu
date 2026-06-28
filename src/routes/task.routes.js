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
import noteRouter from "./note.routes.js";
import auditLogRouter from "./auditLog.routes.js";

const router = Router({ mergeParams: true });

router.use("/:taskId/notes", noteRouter);

router.use("/:taskId/activity", auditLogRouter);

router.route("/my-tasks").get(userAuth, getMyTasks);

router
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

router
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

router
  .route("/:taskId/assign")
  .patch(
    userAuth,
    validateProjectPermissions([
      ProjectRoleEnum.PROJECT_ADMIN,
      ProjectRoleEnum.EDITOR,
    ]),
    assignTask
  );

router
  .route("/:taskId/reorder")
  .patch(
    userAuth,
    validateProjectPermissions([
      ProjectRoleEnum.PROJECT_ADMIN,
      ProjectRoleEnum.EDITOR,
    ]),
    reorderTask
  );

router.route("/:taskId/status").patch(userAuth, changeStatus);

export default router;
