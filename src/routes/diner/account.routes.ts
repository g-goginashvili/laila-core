import { Router } from "express";
import { getDinerAccountController, updateDinerAccountController } from "../../modules/diner/account/account.controller.js";
import { validate } from "../../middlewares/validate.js";
import { updateDinerAccountSchema } from "../../modules/diner/account/account.schema.js";

export const dinerAccountRouter = Router();

dinerAccountRouter.get("/", getDinerAccountController);
dinerAccountRouter.patch("/", validate(updateDinerAccountSchema), updateDinerAccountController);
