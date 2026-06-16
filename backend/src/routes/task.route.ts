import { Router } from "express";
import { createTaskController, deleteTaskController, getAllTasksController, getTaskByIdController, updateTaskController } from "../controllers/task.controller";

const taskRoutes = Router();

taskRoutes.post("/:projectId/workspace/:workspaceId/create",createTaskController);
taskRoutes.put("/:taskId/project/:projectId/workspace/:workspaceId/update",updateTaskController);
taskRoutes.get("/workspace/:workspaceId/all",getAllTasksController);
taskRoutes.get("/:id/project/:projectId/workspace/:workspaceId",getTaskByIdController);
taskRoutes.delete("/:id/workspace/:workspaceId",deleteTaskController);

export default taskRoutes;