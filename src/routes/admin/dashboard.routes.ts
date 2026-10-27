import { Router } from "express";
import { getDashboardController } from "../../modules/admin/dashboard/dashboard.controller.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", getDashboardController);
