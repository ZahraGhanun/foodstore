import { Router } from "express";
import requireRole from "../../middlewares/require-role.middleware.js";

import authenticate
    from "../../middlewares/authenticate.middleware.js";

import {

    createRequest,

    getPendingRequests,

    reviewRequest

} from "./restaurant-registration.controller.js";

const router = Router();

router.post(

    "/",

    authenticate,

    createRequest

);

router.get(

    "/pending",

    authenticate,

    requireRole("SystemAdmin"),

    getPendingRequests

);

router.patch(

    "/:id/review",

    authenticate,

    requireRole("SystemAdmin"),

    reviewRequest

);

export default router;