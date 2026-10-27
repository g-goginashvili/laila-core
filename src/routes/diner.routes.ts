import { Router } from "express";
import { authenticate, requireRole } from "../middlewares/authenticate.js";
import { dinerStoreRouter } from "./diner/stores.routes.js";

export const dinerRouter = Router();

dinerRouter.use(authenticate, requireRole("diner"));

dinerRouter.use("/stores", dinerStoreRouter);
