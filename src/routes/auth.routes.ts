import { Router } from "express";
import { adminSignUpController, dinerSignUpController } from "../modules/auth/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { adminSignUpSchema, dinerSignUpSchema } from "../modules/auth/auth.schema.js";

export const authRouter = Router();

authRouter.post("/admin-sign-up", validate(adminSignUpSchema), adminSignUpController);
authRouter.post("/diner-sign-up", validate(dinerSignUpSchema), dinerSignUpController);