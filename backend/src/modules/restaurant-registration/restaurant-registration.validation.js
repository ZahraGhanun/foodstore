import { z } from "zod";

export const createRestaurantRequestSchema = z.object({

    restaurantName: z
        .string()
        .trim()
        .min(3, "Restaurant name must be at least 3 characters.")
        .max(100),

    phone: z
        .string()
        .regex(/^09\d{9}$/, "Phone number is not valid."),

    address: z
        .string()
        .trim()
        .min(10)
        .max(500),

    description: z
        .string()
        .trim()
        .max(500)
        .optional()

});

export const reviewRestaurantRequestSchema = z.object({

    status: z.enum(["APPROVED", "REJECTED"]),

    adminMessage: z
        .string()
        .trim()
        .max(500)
        .optional()

});