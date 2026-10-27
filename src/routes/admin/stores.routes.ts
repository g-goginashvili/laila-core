import { Router } from "express";
import {
    addClosureController, addStoreController, deleteClosureController, deleteStoreController, getStoreController,
    getStoresListController, replaceHoursController, replaceTablesController, setTableOccupancyController,
    updateStoreController
} from "../../modules/admin/stores/stores.controller.js";
import {
    addStoreSchema, storeClosureSchema, storeHoursSchema, storeTablesSchema, tableOccupancySchema, updateStoreSchema
} from "../../modules/admin/stores/stores.schema.js";
import { validate } from "../../middlewares/validate.js";
import { menuRouter } from "./menu.routes.js";
import { reservationsRouter } from "./reservations.routes.js";

export const storeRouter = Router();

storeRouter.get("/", getStoresListController);
storeRouter.post("/", validate(addStoreSchema), addStoreController);
storeRouter.get("/:id", getStoreController);
storeRouter.patch("/:id", validate(updateStoreSchema), updateStoreController);
storeRouter.delete("/:id", deleteStoreController);
storeRouter.put("/:id/hours", validate(storeHoursSchema), replaceHoursController);
storeRouter.put("/:id/tables", validate(storeTablesSchema), replaceTablesController);
storeRouter.patch("/:id/tables/:tableId", validate(tableOccupancySchema), setTableOccupancyController);
storeRouter.post("/:id/closures", validate(storeClosureSchema), addClosureController);
storeRouter.delete("/:id/closures/:closureId", deleteClosureController);

storeRouter.use("/:storeId/menu", menuRouter);
storeRouter.use("/:storeId/reservations", reservationsRouter);
