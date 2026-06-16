import { Request, Response } from "express";
import { HTTP_CONFIG } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { getCurrentUserService } from "../services/user.service";

export const getCurrentUserController =  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const {user} = await getCurrentUserService(userId);
    return res.status(HTTP_CONFIG.OK).json({
        message: "User fetched successfully",
        data: user
    })
});