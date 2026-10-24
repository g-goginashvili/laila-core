import { Router } from "express";
import { getOrganisationController } from "../modules/organisations.module/organisations.controller.js";
import { authenticate, requireRole } from "../middlewares/authenticate.js";

export const orgRouter = Router();

orgRouter.use(authenticate, requireRole("admin"));

orgRouter.get("/", getOrganisationController);
