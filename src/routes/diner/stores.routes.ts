import { Router } from "express";
import { getListedStoresController } from "../../modules/diner/stores/stores.controller.js";

export const dinerStoreRouter = Router();

dinerStoreRouter.get("/", getListedStoresController);
