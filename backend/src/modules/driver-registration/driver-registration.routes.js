import { Router } from "express";

import authenticate
    from "../../middlewares/authenticate.middleware.js";

import requireRole
    from "../../middlewares/require-role.middleware.js";

import {

    createRequest,

    getPendingRequests,

    reviewRequest

} from "./driver-registration.controller.js";

const router = Router();

router.get(

    "/pending",

    authenticate,

    requireRole("SystemAdmin"),

    getPendingRequests

);

router.post(

    "/",

    authenticate,

    createRequest

);

router.patch(

    "/:id/review",

    authenticate,

    requireRole("SystemAdmin"),

    reviewRequest

);

export default router;