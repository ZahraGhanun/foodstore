import { Router } from "express";

import authenticate
    from "../../middlewares/authenticate.middleware.js";

import {
    createReview,
    getFoodReviews,
    getMyReviews
} from "./review.controller.js";


const router = Router();


router.get(
    "/food/:foodId",
    getFoodReviews
);


router.post(
    "/:orderItemId",
    authenticate,
    createReview
);


router.get(
    "/my",
    authenticate,
    getMyReviews
);


export default router;