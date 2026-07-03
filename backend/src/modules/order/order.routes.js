import { Router } from "express";


import authenticate
    from "../../middlewares/authenticate.middleware.js";

import {

    createOrder,

    getMyOrders,

    getOrderById

} from "./order.controller.js";

const router = Router();
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

export default router;