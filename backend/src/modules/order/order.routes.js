import { Router } from "express";

import authenticate
    from "../../middlewares/authenticate.middleware.js";

import requireRole
    from "../../middlewares/require-role.middleware.js";
import {

    createOrder,

    getMyOrders,

    getOrderById,

    getRestaurantOrders,

    updateRestaurantOrderStatus,

    getAvailableOrders,

    acceptOrder,

    getMyDeliveries,

    deliverOrder

} from "./order.controller.js";

const router = Router();


router.get(

    "/driver/available-orders",

    authenticate,

    requireRole("Driver"),

    getAvailableOrders

);


router.patch(

    "/driver/orders/:id/accept",

    authenticate,

    requireRole("Driver"),

    acceptOrder

);


router.get(

    "/restaurant/my-orders",

    authenticate,

    getRestaurantOrders

);

router.patch(

    "/restaurant/my-orders/:orderId",

    authenticate,

    updateRestaurantOrderStatus

);


router.get("/test", (req, res) => {

    res.json({

        message: "Order Route Works"

    });

});

router.post(

    "/",

    authenticate,

    createOrder

);

router.get(

    "/my",

    authenticate,

    getMyOrders

);

router.get(

    "/:id",

    authenticate,

    getOrderById

);


router.get(

    "/driver/my-deliveries",

    authenticate,

    requireRole("Driver"),

    getMyDeliveries

);

router.patch(

    "/driver/orders/:id/deliver",

    authenticate,

    requireRole("Driver"),

    deliverOrder

);


export default router;