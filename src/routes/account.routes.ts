import { Router } from "express";
import { getAccountController } from "../modules/auth.module/auth.controller.js";
import { authenticate, requireRole } from "../middlewares/authenticate.js";

export const accountRouter = Router();

accountRouter.use(authenticate, requireRole("admin"));

accountRouter.get("/", getAccountController);
