import { Router } from "express";
import * as authController from "./auth.controller.js";
import authenticate from "../../middlewares/authenticate.middleware.js";
import {
    register,
    login,
    me
} from "./auth.controller.js";

const router = Router();

router.post("/register", authController.register);

router.post("/login", authController.login);

router.get("/me", authenticate, me);

export default router;