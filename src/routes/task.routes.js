import { Router } from "express";
import { createTask } from "../controllers/task.controller.js";
import { createTaskValidation } from "../validators/index.js";
import userAuth from "../middleware/userAuth.middleware.js";
import { validateProjectPermissions } from "../middleware/validatePermissions.js";
import validate from "../middleware/validator.middleware.js";
import { ProjectRoleEnum } from "../constant.js";
import { uploadTaskNotes } from "../middleware/multer.middleware.js";
const router = Router();
router
  .route("/:projectId/tasks")
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
  );
export default router;
