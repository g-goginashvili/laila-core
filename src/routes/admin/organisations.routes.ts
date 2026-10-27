import { Router } from "express";
import { getOrganisationController } from "../../modules/admin/organisations/organisations.controller.js";

export const orgRouter = Router();

orgRouter.get("/", getOrganisationController);
