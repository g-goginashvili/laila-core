import { Router } from "express";
import { authenticate, requireRole } from "../middlewares/authenticate.js";
import { dinerStoreRouter } from "./diner/stores.routes.js";
import { dinerAccountRouter } from "./diner/account.routes.js";
import { dinerReservationRouter } from "./diner/reservations.routes.js";

export const dinerRouter = Router();

dinerRouter.use(authenticate, requireRole("diner"));

dinerRouter.use("/stores", dinerStoreRouter);
dinerRouter.use("/account", dinerAccountRouter);
dinerRouter.use("/reservations", dinerReservationRouter);
