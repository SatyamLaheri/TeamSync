import { Router } from "express";
import { createProjectController, deleteProjectController, getProjectAnalyticsController, getProjectByIdAndWorkspaceIdController, updateProjectController } from "../controllers/project.controller";
import { getAllProjectsController } from "../controllers/project.controller";

const projectRoutes = Router();

projectRoutes.post("/workspace/:workspaceId/create",createProjectController);
projectRoutes.get("/workspace/:workspaceId/getAll",getAllProjectsController);
projectRoutes.get("/:projectId/workspace/:workspaceId",getProjectByIdAndWorkspaceIdController);
projectRoutes.get("/:projectId/workspace/:workspaceId/analytics",getProjectAnalyticsController);
projectRoutes.put("/:projectId/workspace/:workspaceId/update",updateProjectController);
projectRoutes.delete("/:projectId/workspace/:workspaceId/delete",deleteProjectController);

export default projectRoutes;