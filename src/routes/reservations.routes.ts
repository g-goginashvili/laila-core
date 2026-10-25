import { Router } from "express";
import {
    addReservationController, deleteReservationController, listReservationsController, updateReservationController
} from "../modules/reservations.module/reservations.controller.js";
import { addReservationSchema, updateReservationSchema } from "../modules/reservations.module/reservations.schema.js";
import { validate } from "../middlewares/validate.js";

// Mounted under /stores/:storeId, which already authenticates.
export const reservationsRouter = Router({ mergeParams: true });

reservationsRouter.get("/", listReservationsController);
reservationsRouter.post("/", validate(addReservationSchema), addReservationController);
reservationsRouter.patch("/:reservationId", validate(updateReservationSchema), updateReservationController);
reservationsRouter.delete("/:reservationId", deleteReservationController);
