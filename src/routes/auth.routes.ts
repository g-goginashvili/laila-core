import { Router } from "express";
import { adminSignUpController } from "../modules/auth.module/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { adminSignUpSchema } from "../modules/auth.module/auth.schema.js";

export const authRouter = Router();

authRouter.post("/admin-sign-up", validate(adminSignUpSchema), adminSignUpController);