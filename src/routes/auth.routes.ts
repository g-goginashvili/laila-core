import { Router } from "express";
import { adminSignUpController } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { adminSignUpSchema } from "../validators/auth.schema.js";

export const authRouter = Router();

authRouter.post("/admin-sign-up", validate(adminSignUpSchema), adminSignUpController);