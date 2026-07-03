import { z } from "zod";

export const createCategorySchema = z.object({

    name: z
        .string()
        .trim()
        .min(2)
        .max(100),

    description: z
        .string()
        .trim()
        .max(255)
        .optional(),

    displayOrder: z
        .number()
        .int()
        .min(0)
        .optional()

});

export const updateCategorySchema = createCategorySchema.partial();