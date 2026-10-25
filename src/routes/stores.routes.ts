import { Router } from "express";
import {
    addClosureController, addStoreController, deleteClosureController, deleteStoreController, getStoreController,
    getStoresListController, replaceHoursController, replaceTablesController, updateStoreController
} from "../modules/stores.module/stores.controller.js";
import {
    addStoreSchema, storeClosureSchema, storeHoursSchema, storeTablesSchema, updateStoreSchema
} from "../modules/stores.module/stores.schema.js";
import { validate } from "../middlewares/validate.js";
import { authenticate, requireRole } from "../middlewares/authenticate.js";
import { menuRouter } from "./menu.routes.js";
import { reservationsRouter } from "./reservations.routes.js";

export const storeRouter = Router();

storeRouter.use(authenticate, requireRole("admin"));

storeRouter.get("/", getStoresListController);
storeRouter.post("/", validate(addStoreSchema), addStoreController);
storeRouter.get("/:id", getStoreController);
storeRouter.patch("/:id", validate(updateStoreSchema), updateStoreController);
storeRouter.delete("/:id", deleteStoreController);
storeRouter.put("/:id/hours", validate(storeHoursSchema), replaceHoursController);
storeRouter.put("/:id/tables", validate(storeTablesSchema), replaceTablesController);
storeRouter.post("/:id/closures", validate(storeClosureSchema), addClosureController);
storeRouter.delete("/:id/closures/:closureId", deleteClosureController);

storeRouter.use("/:storeId/menu", menuRouter);
storeRouter.use("/:storeId/reservations", reservationsRouter);
