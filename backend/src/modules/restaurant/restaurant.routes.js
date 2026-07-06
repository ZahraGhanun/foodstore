import { Router } from "express";
import {
    getRestaurants,
    getRestaurantById
} from "./restaurant.controller.js";
const router = Router();

router.get(
    "/restaurants",
    getRestaurants
);
router.get(
    "/restaurants/:id",
    getRestaurantById
);
export default router;