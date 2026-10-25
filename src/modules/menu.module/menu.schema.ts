import { z } from "zod";

export const menuGroupSchema = z.object({
    name: z.string().trim().min(1).max(100),
});

export const menuGroupOrderSchema = z.object({
    groupIds: z.array(z.string().min(1).max(255)).min(1).max(200),
});

const menuItemFields = {
    groupId: z.string().min(1).max(255),
    name: z.string().trim().min(1).max(150),
    description: z.string().trim().max(1000).default(""),
    // Euros, as typed by the admin; stored as integer cents, so at most two decimals.
    price: z.number().min(0).max(100_000)
        .refine(euros => Math.abs(euros * 100 - Math.round(euros * 100)) < 1e-6, "must have at most 2 decimals"),
    components: z.array(z.object({
        name: z.string().trim().min(1).max(100),
        allergen: z.boolean(),
    })).max(100).default([]),
    available: z.boolean().default(true),
};

export const addMenuItemSchema = z.object(menuItemFields);

export const updateMenuItemSchema = z.object({
    groupId: menuItemFields.groupId.optional(),
    name: menuItemFields.name.optional(),
    description: z.string().trim().max(1000).optional(),
    price: menuItemFields.price.optional(),
    components: z.array(z.object({
        name: z.string().trim().min(1).max(100),
        allergen: z.boolean(),
    })).max(100).optional(),
    available: z.boolean().optional(),
}).refine(values => Object.keys(values).length > 0, "at least one field is required");

export type MenuGroupSchemaType = z.infer<typeof menuGroupSchema>;
export type MenuGroupOrderSchemaType = z.infer<typeof menuGroupOrderSchema>;
export type AddMenuItemSchemaType = z.infer<typeof addMenuItemSchema>;
export type UpdateMenuItemSchemaType = z.infer<typeof updateMenuItemSchema>;
