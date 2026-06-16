import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTP_CONFIG } from "../config/http.config";
import { changeWorkspaceMemberRoleService, createWorkspaceService, deleteWorkspaceByIdService, getAllWorkspacesUserIsMemberService, getWorkspaceAnalyticsService, getWorkspaceByIdService, getWorkspaceMembersService, removeWorkspaceMemberService, updateWorkspaceByIdService } from "../services/workspace.service";
import { createWorkspaceSchema, updateWorkspaceSchema, workspaceIdSchema } from "../validation/workspace.validation";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { roleGuard } from "../utils/roleGuard";
import { Permissions } from "../enums/role.enums";
import { changeWorkspaceMemberRoleSchema } from "../validation/workspace.validation";
import { NotFoundException } from "../utils/appError";

export const createWorkspaceController = asyncHandler(
    async (req:Request,res:Response)=>{
        const body = createWorkspaceSchema.parse(req.body);

        const userId = req.user?._id;
        const {workspace} = await createWorkspaceService(userId, body);

        return res.status(HTTP_CONFIG.CREATED).json({
            message : "Workspace created successfully",
            data : workspace
        });


    }
)

export const getAllWorkspacesUserIsMemberController = asyncHandler(
    async (req:Request,res:Response)=>{
        const userId = req.user?._id;
        if(!userId){
            throw new NotFoundException("User not found");
        }
        const {workspaces} = await getAllWorkspacesUserIsMemberService(userId);
        return res.status(HTTP_CONFIG.OK).json({
            message : "Workspaces fetched successfully",
            data : workspaces
        });
    }
)
export const getWorkspaceByIdController = asyncHandler(
    async (req:Request,res:Response)=>{
        const WorkspaceId = workspaceIdSchema.parse(req.params.id);
        const userId = req.user?._id;

        // Check if user is a member of this workspace
        await getMemberRoleInWorkspace(userId,WorkspaceId);
        
        // Get workspace details
        const {workspace} = await getWorkspaceByIdService(WorkspaceId);

        return res.status(HTTP_CONFIG.OK).json({
            message: "Workspace fetched successfully",
            data: workspace
        });
    }
)

export const getWorkspaceMembersController = asyncHandler(
    async (req:Request,res:Response)=>{
        const WorkspaceId = workspaceIdSchema.parse(req.params.id);
        const userId = req.user?._id;
         

        const {role} = await getMemberRoleInWorkspace(userId,WorkspaceId);
         roleGuard(role,[Permissions.VIEW_ONLY])

         const {members, roles } = await getWorkspaceMembersService(WorkspaceId);

         return res.status(HTTP_CONFIG.OK).json({
            message : "Workspace members fetched successfully",
            data : {
                members,
                roles
            }
         })


    }
)

export const getWorkspaceAnalyticsController = asyncHandler(
    async (req:Request,res:Response)=>{
        const WorkspaceId = workspaceIdSchema.parse(req.params.id);
        const userId = req.user?._id;
        const {role} = await getMemberRoleInWorkspace(userId,WorkspaceId)
        roleGuard(role,[Permissions.VIEW_ONLY])

        const {analytics} = await getWorkspaceAnalyticsService(WorkspaceId);

        return res.status(HTTP_CONFIG.OK).json({
            message : "Workspace analytics fetched successfully",
            data : {
                analytics
            }
        })
    }
)
export const changeWorkspaceMemberRoleController = async (req:Request,res:Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);

    const {memberId,roleId} = changeWorkspaceMemberRoleSchema.parse(req.body);
    const userId = req.user?._id;
 
    const {role} = await  getMemberRoleInWorkspace(userId,workspaceId)
    roleGuard(role,[Permissions.CHANGE_MEMBER_ROLE]);

    const member =  await changeWorkspaceMemberRoleService(
        workspaceId,
        memberId,
        roleId,
    );
    
    return res.status(HTTP_CONFIG.OK).json({
        message : "Member role changed successfully",
        data : member
    })
  

    
 }

export const removeWorkspaceMemberController = asyncHandler(
    async (req:Request,res:Response) => {
        const workspaceId = workspaceIdSchema.parse(req.params.id);
        const { memberId } = req.body;
        const userId = req.user?._id;

        if (!memberId) {
            return res.status(HTTP_CONFIG.BAD_REQUEST).json({
                message: "Member ID is required"
            });
        }

        const {role} = await getMemberRoleInWorkspace(userId,workspaceId);
        roleGuard(role,[Permissions.REMOVE_MEMBER]);

        const result = await removeWorkspaceMemberService(workspaceId, memberId);

        return res.status(HTTP_CONFIG.OK).json({
            message: "Member removed successfully",
            data: result
        });
    }
);

export const updateWorkspaceByIdController = asyncHandler(
    async (req:Request,res:Response)=>{
        const workspaceId = workspaceIdSchema.parse(req.params.id);
        const {name,description} = updateWorkspaceSchema.parse(req.body);

        const userId = req.user?._id;
        const {role} = await getMemberRoleInWorkspace(userId,workspaceId)
        roleGuard(role,[Permissions.EDIT_WORKSPACE]);

        const {workspace} = await updateWorkspaceByIdService(workspaceId,name,description);

        return res.status(HTTP_CONFIG.OK).json({
            message : "Workspace updated successfully",
            data : workspace
        })
        
        
    }
)

export const deleteWorkspaceByIdController = asyncHandler(
    async (req:Request,res:Response)=>{
        const workspaceId = workspaceIdSchema.parse(req.params.id);
        const userId = req.user?._id;

        const {role} = await getMemberRoleInWorkspace(userId,workspaceId)
        roleGuard(role,[Permissions.DELETE_WORKSPACE]);

        const {workspace} = await deleteWorkspaceByIdService(workspaceId,userId);

        return res.status(HTTP_CONFIG.OK).json({
            message : "Workspace deleted successfully",
            data : workspace
        })
    }
)