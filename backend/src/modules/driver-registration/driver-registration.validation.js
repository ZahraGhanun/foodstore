import { z } from "zod";

export const createDriverRequestSchema = z.object({

    vehicleType: z.enum([

        "MOTORCYCLE",

        "CAR"

    ]),

    licensePlate: z
        .string()
        .trim()
        .min(5)
        .max(20)

});

export const reviewDriverRequestSchema = z.object({

    status: z.enum([

        "APPROVED",

        "REJECTED"

    ]),

    adminMessage: z
        .string()
        .trim()
        .max(500)
        .optional()

});