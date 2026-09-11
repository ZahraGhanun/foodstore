import express from "express";

import {
    getRecommendationsController,
    getRestaurantRecommendationsController
} from "./recommendation.controller.js";

import authenticate from "../../middlewares/authenticate.middleware.js";

const router = express.Router();


// =====================================================
// General Recommendations
// =====================================================

router.get(
    "/",
    authenticate,
    getRecommendationsController
);


// =====================================================
// Restaurant Recommendations
// =====================================================

router.get(
    "/restaurant/:restaurantId",
    authenticate,
    getRestaurantRecommendationsController
);


export default router;