import { deleteStore, insertStore, selectStore, selectStoresList, updateStore } from "./stores.repository.js"
import { AppError } from "../../utils/app-error.js";
import type { storesInsertType, storesUpdateType } from "../../db/schema/stores.js";

export const addStoreService = async (insertValues: storesInsertType) => {
    try {
        const details = await insertStore(insertValues);
        return { id: details[0]?.id };
    } catch (error) {
        console.error(error);
        throw new AppError(500, "Internal server error");
    }
};

export const getStoreService = async (id: string) => {
    try {
        const details = await selectStore(id);
        return details;
    } catch (error) {
        console.error(error);
        throw new AppError(500, "Internal server error");
    }
};

export const getStoresListService = async (organisationId: string) => {
    try {
        const details = await selectStoresList(organisationId);
        return details;
    } catch (error) {
        console.error(error);
        throw new AppError(500, "Internal server error");
    }
};

export const updateStoreService = async (id: string, updateValues: storesUpdateType) => {
    try {
        const details = await updateStore(id, updateValues);
        return { id: details[0]?.id };
    } catch (error) {
        console.error(error);
        throw new AppError(500, "Internal server error");
    }
};

export const deleteStoreService = async (id: string) => {
    try {
        const details = await deleteStore(id);
        return { id: details[0]?.id };
    } catch (error) {
        console.error(error);
        throw new AppError(500, "Internal server error");
    }
};