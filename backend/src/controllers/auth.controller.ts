import { NextFunction, Request, Response } from "express";
import  {asyncHandler} from "../middlewares/asyncHandler.middleware";
import { getEnv } from "../utils/get-env";
import { registerSchema } from "../validation/auth.validation";
import { registerUserService } from "../services/auth.service";
import { HTTP_CONFIG } from "../config/http.config";
import passport from "passport";
import jwt from "jsonwebtoken";
import config from "../config/app.config";


export const googleLoginCallback = asyncHandler(async (req: Request, res: Response) => {
  const currentWorkspace = req.user?.currentWorkspace;
  if(!currentWorkspace){
    return res.redirect(`${getEnv("FRONTEND_GOOGLE_CALLBACK_URL")}?status=failure`);
}
   return res.redirect(`${getEnv("FRONTEND_ORIGIN")}/workspace/${currentWorkspace}`);
});


export const registerUserController = asyncHandler(async (req: Request, res: Response) => {
const body = registerSchema.parse(req.body);

await registerUserService(body);

return res.status(HTTP_CONFIG.CREATED).json({
    message: "User registered successfully",
})



})

export const loginUserController = asyncHandler(async (req: Request, res: Response,next: NextFunction) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: {message: string}) => {
        if(err){
            return next(err);
        }
        if(!user){
            return res.status(HTTP_CONFIG.UNAUTHORIZED).json({
                message: info.message,
            });
        }
        
        // Generate JWT token instead of using sessions
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            config.SESSION_SECRET,
            { expiresIn: '24h' }
        );
        
        console.log("Login successful - User:", user);
        console.log("JWT token generated");
        
        return res.status(HTTP_CONFIG.OK).json({
            message: "Login successful",
            user,
            token
        });
    })(req, res, next);
});


export const logoutUserController = asyncHandler(
    async (req: Request, res: Response) => {
      // JWT tokens are stateless, so we just return success
      // The frontend will remove the token from localStorage
      return res
        .status(HTTP_CONFIG.OK)
        .json({ message: "Logged out successfully" });
    }
  );





