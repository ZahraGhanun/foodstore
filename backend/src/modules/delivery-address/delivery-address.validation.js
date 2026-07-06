import { z } from "zod";

export const createAddressSchema = z.object({

    title: z
        .string()
        .trim()
        .min(2)
        .max(50),

    receiverName: z
        .string()
        .trim()
        .min(2)
        .max(100),

    receiverPhone: z
        .string()
        .regex(/^09\d{9}$/, "Phone number is not valid."),

    address: z
        .string()
        .trim()
        .min(10),

    isDefault: z
        .boolean()
        .optional()

});

export const updateAddressSchema = createAddressSchema.partial();