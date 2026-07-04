import { validationResult } from "express-validator";
import apiError from "../utils/apiError.js";

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const extractedErrors = errors.array().map((err) => ({
    [err.path]: err.msg,
  }));

  return next(new apiError(422, "Data recieved is invalid", extractedErrors));
};

export default validate;
