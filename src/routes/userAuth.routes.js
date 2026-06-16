import Router from "express";
import validate from "../middleware/validator.middleware.js";
import { userRegisterValidator } from "../validators/index.js";
import { registerUser } from "../controllers/userAuth.controller.js";
const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);

export default router;
