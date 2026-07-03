import { z } from "zod";

export const addToCartSchema = z.object({

    foodId: z.string().uuid(),

    quantity: z.number().int().min(1).default(1)

});