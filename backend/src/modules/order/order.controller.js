import * as service from "./order.service.js";

export async function createOrder(req, res, next) {

    try {

        const order = await service.createOrder(

            req.user.id,

            req.body

        );

        return res.status(201).json({

            success: true,

            message: "Order created successfully.",

            data: order

        });

    }

    catch (error) {

        next(error);

    }

}

export async function getMyOrders(req, res, next) {

    try {

        const orders = await service.getMyOrders(

            req.user.id

        );

        return res.status(200).json({

            success: true,

            data: orders

        });

    }

    catch (error) {

        next(error);

    }

}

export async function getOrderById(req, res, next) {

    try {

        const order = await service.getOrderById(

            req.user.id,

            req.params.id

        );

        return res.status(200).json({

            success: true,

            data: order

        });

    }

    catch (error) {

        next(error);

    }

}



export async function getRestaurantOrders(req, res, next) {

    try {

        const orders = await service.getRestaurantOrders(

            req.user.id

        );

        return res.status(200).json({

            success: true,

            data: orders

        });

    }

    catch (error) {

        next(error);

    }

}

export async function updateRestaurantOrderStatus(req, res, next) {

    try {

        const order = await service.updateRestaurantOrderStatus(

            req.user.id,

            req.params.orderId,

            req.body.status

        );

        return res.status(200).json({

            success: true,

            message: "Order status updated successfully.",

            data: order

        });

    }

    catch (error) {

        next(error);

    }

}

