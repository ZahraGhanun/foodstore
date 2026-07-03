import { Router } from "express";

import authenticate from "../../middlewares/authenticate.middleware.js";

import {
    getCart,
    addToCart,
    removeItem,
    clearCart
} from "./cart.controller.js";

const router = Router();

router.get(
    "/cart",
    authenticate,
    getCart
);

router.post(
    "/cart/items",
    authenticate,
    addToCart
);

router.delete(
    "/cart/items/:itemId",
    authenticate,
    removeItem
);

router.delete(
    "/cart",
    authenticate,
    clearCart
);

export default router;