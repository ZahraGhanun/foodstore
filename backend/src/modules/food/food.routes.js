import { Router } from "express";

import authenticate
    from "../../middlewares/authenticate.middleware.js";

import requireRole
    from "../../middlewares/require-role.middleware.js";

import {

    createFood,

    getFoods

} from "./food.controller.js";

const router = Router();

router.post(

    "/restaurants/:restaurantId/foods",

    authenticate,

    requireRole("RestaurantManager"),

    createFood

);

router.get(

    "/restaurants/:restaurantId/foods",

    getFoods

);

export default router;