import { Router } from "express";
import { joinWaitlistController } from "../modules/waitlist.module/waitlist.controller.js";
import { joinWaitlistSchema } from "../modules/waitlist.module/waitlist.schema.js";
import { validate } from "../middlewares/validate.js";

export const waitlistRouter = Router();

waitlistRouter.post("/", validate(joinWaitlistSchema), joinWaitlistController);
