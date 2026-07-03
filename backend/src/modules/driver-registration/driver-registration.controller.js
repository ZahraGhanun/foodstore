import * as service from "./driver-registration.service.js";

export async function createRequest(req, res, next) {

    try {

        const request = await service.createRequest(

            req.user.id,

            req.body

        );

        return res.status(201).json({

            success: true,

            message:
                "Driver registration request submitted successfully.",

            data: request

        });

    }

    catch (error) {

        next(error);

    }

}

export async function reviewRequest(req, res, next) {

    try {

        const request = await service.reviewRequest(

            req.params.id,

            req.user.id,

            req.body

        );

        return res.status(200).json({

            success: true,

            message: "Driver request reviewed successfully.",

            data: request

        });

    }

    catch (error) {

        next(error);

    }

}