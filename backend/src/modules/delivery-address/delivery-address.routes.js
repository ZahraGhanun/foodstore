import { Router } from "express";

import authenticate from "../../middlewares/authenticate.middleware.js";

import {

    getMyAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress

} from "./delivery-address.controller.js";

const router = Router();

router.get(

    "/",

    authenticate,

    getMyAddresses

);

router.post(

    "/",

    authenticate,

    createAddress

);

router.patch(

    "/:id",

    authenticate,

    updateAddress

);

router.delete(

    "/:id",

    authenticate,

    deleteAddress

);

router.patch(

    "/:id/default",

    authenticate,

    setDefaultAddress

);

export default router;