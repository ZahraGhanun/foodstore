import { Router } from "express";

import authenticate
    from "../../middlewares/authenticate.middleware.js";

import {
    createReview,
    getMyReviews
} from "./review.controller.js";

const router = Router();

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