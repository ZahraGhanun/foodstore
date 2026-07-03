import { Router } from "express";

import authenticate
    from "../../middlewares/authenticate.middleware.js";

import requireRole
    from "../../middlewares/require-role.middleware.js";

import {

    createRequest,

    reviewRequest

} from "./driver-registration.controller.js";

const router = Router();

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