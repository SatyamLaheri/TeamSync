import { createWorkspaceController, deleteWorkspaceByIdController, getWorkspaceAnalyticsController, getWorkspaceMembersController, removeWorkspaceMemberController, updateWorkspaceByIdController } from "../controllers/workspace.controllers";
import { getAllWorkspacesUserIsMemberController } from "../controllers/workspace.controllers";
import { getWorkspaceByIdController } from "../controllers/workspace.controllers";
import { changeWorkspaceMemberRoleController } from "../controllers/workspace.controllers";
import { Router } from "express";

const workspaceRouter = Router();

workspaceRouter.post("/create", createWorkspaceController);
workspaceRouter.get("/all", getAllWorkspacesUserIsMemberController);
workspaceRouter.get("/:id", getWorkspaceByIdController);
workspaceRouter.get('/members/:id',getWorkspaceMembersController);
workspaceRouter.get('/analytics/:id',getWorkspaceAnalyticsController);
workspaceRouter.put('/change/member/role/:id',changeWorkspaceMemberRoleController);
workspaceRouter.delete('/remove/member/:id',removeWorkspaceMemberController);
workspaceRouter.put("/:id", updateWorkspaceByIdController);
workspaceRouter.delete("/:id", deleteWorkspaceByIdController);

export default workspaceRouter;