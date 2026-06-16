
import { Router } from "express";
import passport from "passport";
import { getEnv } from "../utils/get-env";
import { googleLoginCallback, loginUserController, logoutUserController, registerUserController } from "../controllers/auth.controller";

const failedUrl = `${getEnv("FRONTEND_GOOGLE_CALLBACK_URL")}?status=failure`;

const authRoutes = Router();

authRoutes.post("/register", registerUserController);
authRoutes.post("/login", loginUserController);
authRoutes.post("/logout", logoutUserController);

authRoutes.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
);

authRoutes.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: failedUrl,
    }),
    googleLoginCallback
);

export default authRoutes;