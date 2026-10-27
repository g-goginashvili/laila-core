import { Router } from "express";
import {
    addReservationController, deleteReservationController, listReservationsController, updateReservationController
} from "../../modules/admin/reservations/reservations.controller.js";
import { addReservationSchema, updateReservationSchema } from "../../modules/admin/reservations/reservations.schema.js";
import { validate } from "../../middlewares/validate.js";

// Mounted under /stores/:storeId.
export const reservationsRouter = Router({ mergeParams: true });

reservationsRouter.get("/", listReservationsController);
reservationsRouter.post("/", validate(addReservationSchema), addReservationController);
reservationsRouter.patch("/:reservationId", validate(updateReservationSchema), updateReservationController);
reservationsRouter.delete("/:reservationId", deleteReservationController);
