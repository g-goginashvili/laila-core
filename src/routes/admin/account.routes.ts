import { Router } from "express";
import { getAccountController } from "../../modules/admin/account/account.controller.js";

export const accountRouter = Router();

accountRouter.get("/", getAccountController);
