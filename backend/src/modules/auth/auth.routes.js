import { Router } from "express";

import authenticate from "../../middlewares/authenticate.middleware.js";

import {

    register,
    login,
    me,
    updateProfile

} from "./auth.controller.js";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", authenticate, me);

router.patch("/me", authenticate, updateProfile);

export default router;