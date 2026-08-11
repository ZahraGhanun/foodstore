import { Router } from "express";

import {
    getRestaurants,
    getRestaurantById,
    getAdminRestaurants,
    deactivateRestaurant
} from "./restaurant.controller.js";

import authenticate
    from "../../middlewares/authenticate.middleware.js";

import requireRole
    from "../../middlewares/require-role.middleware.js";

const router = Router();

router.patch(
    "/admin/restaurants/:id/deactivate",
    authenticate,
    requireRole("SystemAdmin"),
    deactivateRestaurant
);

router.get(

    "/admin/restaurants",

    authenticate,

    requireRole("SystemAdmin"),

    getAdminRestaurants

);

router.get(
    "/restaurants",
    getRestaurants
);
router.get(
    "/restaurants/:id",
    getRestaurantById
);
export default router;