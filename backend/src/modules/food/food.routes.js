import { Router } from "express";

import authenticate
    from "../../middlewares/authenticate.middleware.js";

import requireRole
    from "../../middlewares/require-role.middleware.js";


import {

    createFood,
    createMyRestaurantFood,
    updateMyRestaurantFood,
    deleteMyRestaurantFood,
    getFoods,
    getMyRestaurantFoods

} from "./food.controller.js";

const router = Router();

router.put(

    "/restaurant/my-foods/:foodId",

    authenticate,

    requireRole("RestaurantManager"),

    updateMyRestaurantFood

);

router.post(

    "/restaurant/my-foods",

    authenticate,

    requireRole("RestaurantManager"),

    createMyRestaurantFood

);

router.get(
    "/restaurant/my-foods",
    authenticate,
    getMyRestaurantFoods
);
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

router.delete(

    "/restaurant/my-foods/:foodId",

    authenticate,

    requireRole("RestaurantManager"),

    deleteMyRestaurantFood

);

export default router;