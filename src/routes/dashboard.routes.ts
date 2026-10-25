import { Router } from "express";
import { getDashboardController } from "../modules/dashboard.module/dashboard.controller.js";
import { authenticate, requireRole } from "../middlewares/authenticate.js";

export const dashboardRouter = Router();

dashboardRouter.use(authenticate, requireRole("admin"));

dashboardRouter.get("/", getDashboardController);
