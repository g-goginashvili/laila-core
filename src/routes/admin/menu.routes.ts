import { Router } from "express";
import {
    addGroupController, addItemController, deleteGroupController, deleteItemController, getMenuController,
    reorderGroupsController, updateGroupController, updateItemController
} from "../../modules/admin/menu/menu.controller.js";
import {
    addMenuItemSchema, menuGroupOrderSchema, menuGroupSchema, updateMenuItemSchema
} from "../../modules/admin/menu/menu.schema.js";
import { validate } from "../../middlewares/validate.js";

// Mounted under /stores/:storeId.
export const menuRouter = Router({ mergeParams: true });

menuRouter.get("/", getMenuController);
menuRouter.post("/groups", validate(menuGroupSchema), addGroupController);
menuRouter.put("/groups/order", validate(menuGroupOrderSchema), reorderGroupsController);
menuRouter.patch("/groups/:groupId", validate(menuGroupSchema), updateGroupController);
menuRouter.delete("/groups/:groupId", deleteGroupController);
menuRouter.post("/items", validate(addMenuItemSchema), addItemController);
menuRouter.patch("/items/:itemId", validate(updateMenuItemSchema), updateItemController);
menuRouter.delete("/items/:itemId", deleteItemController);
