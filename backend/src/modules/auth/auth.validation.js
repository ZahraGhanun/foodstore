import { z } from "zod";

export const registerSchema = z.object({
    firstName: z
        .string()
        .trim()
        .min(2, "First name must be at least 2 characters.")
        .max(50, "First name must be at most 50 characters."),

    lastName: z
        .string()
        .trim()
        .min(2, "Last name must be at least 2 characters.")
        .max(50, "Last name must be at most 50 characters."),

    phone: z
        .string()
        .regex(/^09\d{9}$/, "Phone number is not valid."),

    email: z
        .email("Email is not valid.")
        .optional(),

    password: z
        .string()
        .min(6, "Password must be at least 6 characters.")
        .max(72, "Password must be at most 72 characters.")
});

export const loginSchema = z.object({

    phone: z
        .string()
        .regex(/^09\d{9}$/, "Phone number is not valid."),

    password: z
        .string()
        .min(6, "Password must be at least 6 characters.")
        .max(72, "Password must be at most 72 characters.")

});