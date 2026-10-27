import { Router } from "express";
import {
    getAvailabilityController, getListedStoreController, getListedStoresController
} from "../../modules/diner/stores/stores.controller.js";

export const dinerStoreRouter = Router();

dinerStoreRouter.get("/", getListedStoresController);
dinerStoreRouter.get("/:storeId", getListedStoreController);
dinerStoreRouter.get("/:storeId/availability", getAvailabilityController);
