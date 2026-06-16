import { z } from "zod";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";

import { Request, Response } from "express";
import { HTTP_CONFIG } from "../config/http.config";
import { joinWorkspaceService } from "../services/member.service";

export const joinWorkspaceController = asyncHandler(
    async (req:Request,res:Response)=>{
        const inviteCode = z.string().parse(req.params.inviteCode);
      
        const userId = req.user?._id;

        const {workspaceId , role} = await joinWorkspaceService(
            userId,
            inviteCode,
        );

        return res.status(HTTP_CONFIG.OK).json({
            message : "Joined workspace successfully",
            data : {
                workspaceId,
                role
            }
        });
    }
)
