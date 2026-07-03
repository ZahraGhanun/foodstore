import * as authService from "./auth.service.js";
import { registerSchema } from "./auth.validation.js";

export async function register(req, res, next) {

    try {

        const validatedData = registerSchema.parse(req.body);

        const user = await authService.register(validatedData);

        return res.status(201).json({

            success: true,
            message: "User registered successfully.",
            data: user

        });

    } catch (error) {

        next(error);

    }

}


export async function login(req, res, next) {

    try {

        const result = await authService.login(req.body);

        return res.status(200).json({

            success: true,

            message: "Login successful.",

            data: result

        });

    } catch (error) {

        next(error);

    }

}

export async function me(req, res) {

    return res.status(200).json({

        success: true,

        data: req.user

    });

}