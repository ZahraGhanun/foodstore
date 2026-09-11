import express from "express";

import {
    getRecommendationsController
} from "./recommendation.controller.js";

import authenticate from "../../middlewares/authenticate.middleware.js";

const router = express.Router();

router.get(
    "/",
    authenticate,
    getRecommendationsController
);

export default router;