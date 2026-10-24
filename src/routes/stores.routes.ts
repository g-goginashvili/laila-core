import { Router } from "express";
import { addStoreController, deleteStoreController, getStoreController, getStoresListController, updateStoreController } from "../modules/stores.module/stores.controller.js";
import { addStoreSchema, updateStoreSchema } from "../modules/stores.module/stores.schema.js";
import { validate } from "../middlewares/validate.js";
import { authenticate, requireRole } from "../middlewares/authenticate.js";

export const storeRouter = Router();

storeRouter.use(authenticate, requireRole("admin"));

storeRouter.get("/", getStoresListController);
storeRouter.post("/", validate(addStoreSchema), addStoreController);
storeRouter.get("/:id", getStoreController);
storeRouter.patch("/:id", validate(updateStoreSchema), updateStoreController);
storeRouter.delete("/:id", deleteStoreController);
