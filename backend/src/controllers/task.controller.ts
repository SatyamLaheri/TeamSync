import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { createTaskSchema, taskIdSchema, updateTaskSchema } from "../validation/task.validation";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { projectIdSchema } from "../validation/project.validarion";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { roleGuard } from "../utils/roleGuard";
import { HTTP_CONFIG } from "../config/http.config";
import { Permissions } from "../enums/role.enums";
import { createTaskService, deleteTaskService, getAllTasksService, getTaskByIdService, updateTaskService } from "../services/task.service";

export const createTaskController = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
 const body = createTaskSchema.parse(req.body);

    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const userId = req.user?._id;

    const {role} = await getMemberRoleInWorkspace(userId,workspaceId)
    roleGuard(role,[Permissions.CREATE_TASK]);

    const {task} = await createTaskService(workspaceId, projectId, userId, body);

    return res.status(HTTP_CONFIG.OK).json({
        message:"Task created successfully",
        task
    })

})

export const updateTaskController = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
 const userId = req.user?._id;
 const body = updateTaskSchema.parse(req.body);
 const projectId = projectIdSchema.parse(req.params.projectId);
 const taskId = taskIdSchema.parse(req.params.taskId);
 const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

 const {role} = await getMemberRoleInWorkspace(userId,workspaceId)
 roleGuard(role,[Permissions.EDIT_TASK]);

 const {updatedTask} = await updateTaskService(workspaceId,projectId,taskId,body);

 return res.status(HTTP_CONFIG.OK).json({
    message:"Task updated successfully",
    updatedTask
 })

})


export const getAllTasksController = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const filters = {
        projectId: req.query.projectId as string | undefined,
        status: req.query.status
          ? (req.query.status as string)?.split(",")
          : undefined,
        priority: req.query.priority
          ? (req.query.priority as string)?.split(",")
          : undefined,
        assignedTo: req.query.assignedTo
          ? (req.query.assignedTo as string)?.split(",")
          : undefined,
        keyword: req.query.keyword as string | undefined,
        dueDate: req.query.dueDate as string | undefined,
      };

      const pagination = {
        pageSize: parseInt(req.query.pageSize as string) || 10,
        pageNumber: parseInt(req.query.pageNumber as string) || 1,
      };

      const {role} = await getMemberRoleInWorkspace(userId,workspaceId);
      roleGuard(role,[Permissions.VIEW_ONLY]);

      const {tasks,pagination: paginationResult} = await getAllTasksService(workspaceId,filters,pagination);

      return res.status(HTTP_CONFIG.OK).json({
        message:"Tasks fetched successfully",
        tasks,
        pagination: paginationResult
      })

})



export const getTaskByIdController = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.user?._id;
  
      const taskId = taskIdSchema.parse(req.params.id);
      const projectId = projectIdSchema.parse(req.params.projectId);
      const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
  
      const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
      roleGuard(role, [Permissions.VIEW_ONLY]);
  
      const task = await getTaskByIdService(workspaceId, projectId, taskId);
  
      return res.status(HTTP_CONFIG.OK).json({
        message: "Task fetched successfully",
        task,
      });
    }
  );

export const deleteTaskController = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.user?._id;
  
      const taskId = taskIdSchema.parse(req.params.id);
      const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
  
      const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
      roleGuard(role, [Permissions.DELETE_TASK]);
  
      await deleteTaskService(workspaceId, taskId);
  
      return res.status(HTTP_CONFIG.OK).json({
        message: "Task deleted successfully",
      });
    }
  );