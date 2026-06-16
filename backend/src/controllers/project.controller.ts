
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { Request,Response } from "express";
import { createProjectSchema, projectIdSchema, updateProjectSchema } from "../validation/project.validarion";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { roleGuard } from "../utils/roleGuard";
import { Permissions } from "../enums/role.enums";
import { createProjectService, deleteProjectService, getProjectAnalyticsService, getProjectByIdAndWorkspaceIdService, getProjectsInWorkspaceService, updateProjectService } from "../services/project.service";
import { HTTP_CONFIG } from "../config/http.config";

export const createProjectController = asyncHandler(async(req:Request,res:Response)=>{
    const body = createProjectSchema.parse(req.body);
     const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

     const userId = req.user?._id;
     const {role} = await getMemberRoleInWorkspace(userId, workspaceId)
        roleGuard(role,[Permissions.CREATE_PROJECT]);

        const {project} =  await createProjectService(userId,workspaceId,{
            emoji:body.emoji || "",
            name:body.name,
            description:body.description || ""
        });

        res.status(201).json({
            success:true,
            message:"Project created successfully",
            project
        })
})

export const getAllProjectsController = asyncHandler(async(req:Request,res:Response)=>{
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
  const userId = req.user?._id;
  const {role} = await getMemberRoleInWorkspace(userId,workspaceId)
  roleGuard(role,[Permissions.VIEW_ONLY]);
   
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  const pageNumber = parseInt(req.query.pageNumber as string) || 1;
  const {projects,totalPages,totalCount,skip,limit} = await getProjectsInWorkspaceService(
    workspaceId,
    pageSize,
    pageNumber,

  );

  return res.status(HTTP_CONFIG.OK).json({
    message:"Projects fetched successfully",
    projects,
    pagination:{
      totalPages,
      pageNumber,
      pageSize,
      totalCount,
      skip,
    }
  })

})

export const getProjectByIdAndWorkspaceIdController = asyncHandler(async(req:Request,res:Response)=>{
  const projectId = projectIdSchema.parse(req.params.projectId);
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
  
  const userId = req.user?._id;
  const {role} = await getMemberRoleInWorkspace(userId,workspaceId)
  roleGuard(role,[Permissions.VIEW_ONLY]);

  const {project} = await getProjectByIdAndWorkspaceIdService(projectId,workspaceId);
    return res.status(HTTP_CONFIG.OK).json({
     message:"Project fetched successfully",
     project
    })

})

export const getProjectAnalyticsController = asyncHandler(async(req:Request,res:Response)=>{

    
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const userId = req.user?._id;
    
    
    const {role} = await getMemberRoleInWorkspace(userId,workspaceId)
    roleGuard(role,[Permissions.VIEW_ONLY]);

    const {analytics} = await getProjectAnalyticsService(projectId,workspaceId);

    return res.status(HTTP_CONFIG.OK).json({
        message:"Project analytics fetched successfully",
        analytics
    })
})

export const updateProjectController = asyncHandler(async(req:Request,res:Response)=>{
    const userId = req.user?._id;

    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const body = updateProjectSchema.parse(req.body);
    const {role} = await getMemberRoleInWorkspace(userId,workspaceId)
    roleGuard(role,[Permissions.EDIT_PROJECT]);

    const {project} = await updateProjectService(projectId,workspaceId,{
        emoji:body.emoji || "",
        name:body.name,
        description:body.description || ""
    });

    return res.status(HTTP_CONFIG.OK).json({
        message:"Project updated successfully",
        project
    })

})

export const deleteProjectController = asyncHandler(async(req:Request,res:Response)=>{
   const userId = req.user?._id;
   const projectId = projectIdSchema.parse(req.params.projectId);
   const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

   const {role} = await getMemberRoleInWorkspace(userId,workspaceId)
   roleGuard(role,[Permissions.DELETE_PROJECT]);

   await deleteProjectService(projectId,workspaceId);

   return res.status(HTTP_CONFIG.OK).json({
    message:"Project deleted successfully"
   })

})





