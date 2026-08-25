import { Router } from "express";
import { addStoreController, deleteStoreController, getStoreController, updateStoreController } from "../modules/stores.module/stores.controller.js";
import { addStoreSchema, updateStoreSchema } from "../modules/stores.module/stores.schema.js";
import { validate } from "../middlewares/validate.js";

export const storeRouter = Router();

storeRouter.get("/store-details", getStoreController);
storeRouter.post("/add-store", validate(addStoreSchema), addStoreController);
storeRouter.put("/update-store", validate(updateStoreSchema), updateStoreController);
storeRouter.delete("/delete-store/:id", deleteStoreController);