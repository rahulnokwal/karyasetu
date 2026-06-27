import Router from "express";
import userAuth from "../middleware/userAuth.middleware.js";
import { getTaskActivity } from "../controllers/auditLog.controller.js";

const router = Router({ mergeParams: true });

router.route("/").get(userAuth, getTaskActivity);

export default router;
