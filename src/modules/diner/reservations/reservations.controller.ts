import type { Request, Response } from "express";
import { bookReservationService } from "./reservations.service.js";
import type { BookReservationType } from "./reservations.schema.js";
import { getAuth } from "../../../middlewares/authenticate.js";

export const bookReservationController = async (req: Request<{}, {}, BookReservationType>, res: Response) => {
    res.status(201).json(await bookReservationService(getAuth(req).uid, req.body));
};
