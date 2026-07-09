import { Router } from "express";
import authenticate
    from "../../middlewares/authenticate.middleware.js";

import requireRole
    from "../../middlewares/require-role.middleware.js";

import {

    getCategories,
    createCategory,
    createMyRestaurantCategory,
    getMyCategories,
    updateMyRestaurantCategory,
    deleteMyRestaurantCategory

} from "./category.controller.js";

const router = Router();

router.put(

    "/restaurant/my-categories/:categoryId",

    authenticate,

    requireRole("RestaurantManager"),

    updateMyRestaurantCategory

);

router.delete(

    "/restaurant/my-categories/:categoryId",

    authenticate,

    requireRole("RestaurantManager"),

    deleteMyRestaurantCategory

);

router.post(

    "/restaurant/my-categories",

    authenticate,

    requireRole("RestaurantManager"),

    createMyRestaurantCategory

);
router.get(
    "/categories/my",
    authenticate,
    getMyCategories
);

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