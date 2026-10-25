import { Router } from "express";
import {
    addGroupController, addItemController, deleteGroupController, deleteItemController, getMenuController,
    reorderGroupsController, updateGroupController, updateItemController
} from "../modules/menu.module/menu.controller.js";
import {
    addMenuItemSchema, menuGroupOrderSchema, menuGroupSchema, updateMenuItemSchema
} from "../modules/menu.module/menu.schema.js";
import { validate } from "../middlewares/validate.js";

// Mounted under /stores/:storeId, which already authenticates.
export const menuRouter = Router({ mergeParams: true });

menuRouter.get("/", getMenuController);
menuRouter.post("/groups", validate(menuGroupSchema), addGroupController);
menuRouter.put("/groups/order", validate(menuGroupOrderSchema), reorderGroupsController);
menuRouter.patch("/groups/:groupId", validate(menuGroupSchema), updateGroupController);
menuRouter.delete("/groups/:groupId", deleteGroupController);
menuRouter.post("/items", validate(addMenuItemSchema), addItemController);
menuRouter.patch("/items/:itemId", validate(updateMenuItemSchema), updateItemController);
menuRouter.delete("/items/:itemId", deleteItemController);
