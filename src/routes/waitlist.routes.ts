import { Router } from "express";
import { joinWaitlistController } from "../modules/waitlist/waitlist.controller.js";
import { joinWaitlistSchema } from "../modules/waitlist/waitlist.schema.js";
import { validate } from "../middlewares/validate.js";

export const waitlistRouter = Router();

waitlistRouter.post("/", validate(joinWaitlistSchema), joinWaitlistController);
