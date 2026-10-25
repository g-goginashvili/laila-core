import type { Request, Response } from "express";
import {
    addReservationService, deleteReservationService, listReservationsService, updateReservationService
} from "./reservations.service.js";
import { listReservationsQuerySchema, type AddReservationSchemaType, type UpdateReservationSchemaType } from "./reservations.schema.js";
import { getAuth } from "../../middlewares/authenticate.js";
import { AppError } from "../../utils/app-error.js";

type StoreParamsType = { storeId: string };
type ReservationParamsType = StoreParamsType & { reservationId: string };

export const listReservationsController = async (req: Request<StoreParamsType>, res: Response) => {
    const query = listReservationsQuerySchema.safeParse(req.query);
    if (!query.success) throw new AppError(400, "Query must include from and to as YYYY-MM-DD.");
    res.status(200).json(await listReservationsService(getAuth(req).uid, req.params.storeId, query.data.from, query.data.to));
};

export const addReservationController = async (req: Request<StoreParamsType, {}, AddReservationSchemaType>, res: Response) => {
    res.status(201).json(await addReservationService(getAuth(req).uid, req.params.storeId, req.body));
};

export const updateReservationController = async (req: Request<ReservationParamsType, {}, UpdateReservationSchemaType>, res: Response) => {
    res.status(200).json(await updateReservationService(getAuth(req).uid, req.params.storeId, req.params.reservationId, req.body));
};

export const deleteReservationController = async (req: Request<ReservationParamsType>, res: Response) => {
    res.status(200).json(await deleteReservationService(getAuth(req).uid, req.params.storeId, req.params.reservationId));
};
