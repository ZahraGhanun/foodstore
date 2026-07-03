import { z } from "zod";

export const createFoodSchema = z.object({

    name: z
        .string()
        .trim()
        .min(2)
        .max(150),

    description: z
        .string()
        .trim()
        .max(500)
        .optional(),

    price: z.coerce.number().positive(),

    imageUrl: z
        .string()
        .url()
        .optional(),

    categoryId: z
        .string()
        .uuid()

});

export const updateFoodSchema =
    createFoodSchema.partial();