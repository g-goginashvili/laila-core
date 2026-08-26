import type { Request, Response } from "express";
import { selectOrganisationDetails } from "./organisations.service.js";

export const getOrganisationDetails = async (req: Request, res: Response) => {
    return res.status(201).json(await selectOrganisationDetails(req.query.id as string));
};