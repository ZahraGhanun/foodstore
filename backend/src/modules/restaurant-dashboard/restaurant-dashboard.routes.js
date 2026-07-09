import { Router } from "express";

import authenticate from "../../middlewares/authenticate.middleware.js";

import {
    getDashboard
} from "./restaurant-dashboard.controller.js";

const router = Router();

router.get(
    "/",
    authenticate,
    getDashboard
);

export default router;