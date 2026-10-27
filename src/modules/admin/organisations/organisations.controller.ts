import type { Request, Response } from "express";
import { getOwnOrganisation } from "./organisations.service.js";
import { getAuth } from "../../../middlewares/authenticate.js";

export const getOrganisationController = async (req: Request, res: Response) => {
    res.status(200).json(await getOwnOrganisation(getAuth(req).uid));
};
