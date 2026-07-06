import * as service from "./delivery-address.service.js";

export async function getMyAddresses(req, res, next) {

    try {

        const addresses = await service.getMyAddresses(

            req.user.id

        );

        return res.json({

            success: true,

            data: addresses

        });

    } catch (error) {

        next(error);

    }

}

export async function createAddress(req, res, next) {

    try {

        const address = await service.createAddress(

            req.user.id,

            req.body

        );

        return res.status(201).json({

            success: true,

            message: "Address created successfully.",

            data: address

        });

    } catch (error) {

        next(error);

    }

}

export async function updateAddress(req, res, next) {

    try {

        const address = await service.updateAddress(

            req.user.id,

            req.params.id,

            req.body

        );

        return res.json({

            success: true,

            message: "Address updated successfully.",

            data: address

        });

    } catch (error) {

        next(error);

    }

}

export async function deleteAddress(req, res, next) {

    try {

        await service.deleteAddress(

            req.user.id,

            req.params.id

        );

        return res.json({

            success: true,

            message: "Address deleted successfully."

        });

    } catch (error) {

        next(error);

    }

}

export async function setDefaultAddress(req, res, next) {

    try {

        const address = await service.setDefaultAddress(

            req.user.id,

            req.params.id

        );

        return res.json({

            success: true,

            message: "Default address updated.",

            data: address

        });

    } catch (error) {

        next(error);

    }

}