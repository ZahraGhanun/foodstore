import { Router } from "express";

import authenticate
    from "../../middlewares/authenticate.middleware.js";

import requireRole
    from "../../middlewares/require-role.middleware.js";

import {

    createCategory,

    getCategories

} from "./category.controller.js";

const router = Router();

router.post(

    "/restaurants/:restaurantId/categories",

    authenticate,

    requireRole("RestaurantManager"),

    createCategory

);

router.get(

    "/restaurants/:restaurantId/categories",

    getCategories

);

export default router;