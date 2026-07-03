import { ZodError } from "zod";

export default function errorMiddleware(err, req, res, next) {

    if (err instanceof ZodError) {

        return res.status(400).json({

            success: false,

            message: "Validation failed.",

            errors: err.issues.map(issue => ({
                field: issue.path.join("."),
                message: issue.message
            }))

        });

    }

    console.error(err);

    return res.status(500).json({

        success: false,

        message: "Internal server error."

    });

}