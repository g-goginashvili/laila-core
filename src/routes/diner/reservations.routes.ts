import { Router } from "express";
import { bookReservationController } from "../../modules/diner/reservations/reservations.controller.js";
import { bookReservationSchema } from "../../modules/diner/reservations/reservations.schema.js";
import { validate } from "../../middlewares/validate.js";

export const dinerReservationRouter = Router();

dinerReservationRouter.post("/", validate(bookReservationSchema), bookReservationController);
