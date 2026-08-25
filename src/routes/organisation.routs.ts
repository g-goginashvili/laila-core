import { Router } from "express";
import { getOrganisationDetails } from "../modules/organisations.module/organization.controller.js";

export const orgRouter = Router();

orgRouter.get("/organisation-details", getOrganisationDetails);