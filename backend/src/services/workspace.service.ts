import WorkspaceModel from "../models/workspace.model";
import RoleModel from "../models/roles-permission.model";

import { BadRequestException, NotFoundException } from "../utils/appError";
import UserModel from "../models/user.model";
import MemberModel from "../models/member.model";
import mongoose from "mongoose";
import TaskModel from "../models/task.model";
import { TaskStatusEnum } from "../enums/task.enum";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { roleGuard } from "../utils/roleGuard";
import { Roles } from "../enums/role.enums";
import ProjectModel from "../models/project.model";
import memberRouter from "../routes/member.route";

//*********************************************
//  Create Workspace Service
//*********************************************
export const createWorkspaceService = async (
    userId:string,
    body : {
        name:string,
        description?:string;
    }
) => {
    const {name,description} = body;
    const user = await UserModel.findById(userId);
    if(!user){
        throw new NotFoundException("User not found");
    }
         const ownerRole = await RoleModel.findOne({name:"OWNER"});
     if(!ownerRole){
        throw new NotFoundException("Owner role not found");
     }
     const workspace = await WorkspaceModel.create({
        name,
        description: description || undefined,
        owner:user._id,
     });
     await workspace.save();

     const member = await MemberModel.create({
        userId : user._id,
        workspaceId : workspace._id,
        role : ownerRole._id,
        joinedAt : new Date()
     });
     await member.save();

     user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
     await user.save();

     return {
        workspace,
     };

}

//*********************************************
//  Get All Workspaces User Is Member Service
//*********************************************
export const getAllWorkspacesUserIsMemberService = async (userId:string) => {
    const memberships = await MemberModel.find({userId})
    .populate("workspaceId")
    .select("-password")
    .exec();


    const workspaces = memberships.map((membership)=>membership.workspaceId);

    return {
        workspaces
    }
 
}

  
export const getWorkspaceByIdService = async (workspaceId:string) => {
 const workspace = await WorkspaceModel.findById(workspaceId);
 if(!workspace){
    throw new NotFoundException("Workspace not found");
 }

 const members = await MemberModel.find({
    workspaceId
 }).populate("role");

 const workspaceWithMembers = {
    ...workspace.toObject(),
    members,
 };

 
 return {
     workspace : workspaceWithMembers,
 }

}

export const getWorkspaceMembersService = async (workspaceId:string) => {
   //Fetch all members of the workspace
   const members = await MemberModel.find({workspaceId})
   .populate("userId","name email profilePicture -password")
   .populate("role","name");


   const roles =  await RoleModel.find({}, {name:1,_id:1})
   .select("-permission")
   .lean();

   return {
    members,
    roles
   }

   
}

export const getWorkspaceAnalyticsService = async (workspaceId:string) => {
    const currentDate = new Date();

    const totalTasks = await TaskModel.countDocuments({
       workspace: workspaceId,
    });

    const overdueTasks = await TaskModel.countDocuments({
        workspace: workspaceId,
        dueDate: {
            $lt: currentDate
        },
        status: {
            $ne: TaskStatusEnum.DONE
        }
    });

    const completedTasks = await TaskModel.countDocuments({
        workspace: workspaceId,
        status: TaskStatusEnum.DONE
    });

    const analytics = {
        totalTasks,
        overdueTasks,
        completedTasks
    }

    return {
        analytics
    }
    
    
}

export const changeWorkspaceMemberRoleService = async (workspaceId:string,memberId:string,roleId:string) => {
  const role = await RoleModel.findById(roleId);
  if(!role){
    throw new NotFoundException("Role not found");
  }

  const member = await MemberModel.findOne({
    userId:memberId,
    workspaceId:workspaceId
  });

  if(!member){
    throw new NotFoundException("Member not found");
  }

    member.role = role._id as mongoose.Types.ObjectId;
    await member.save();

    // Populate the role data before returning
    const populatedMember = await MemberModel.findById(member._id)
      .populate("userId", "name email profilePicture -password")
      .populate("role", "name");

    return {
        member: populatedMember
    }


};

export const removeWorkspaceMemberService = async (workspaceId:string,memberId:string) => {
  const member = await MemberModel.findOne({
    userId:memberId,
    workspaceId:workspaceId
  });

  if(!member){
    throw new NotFoundException("Member not found");
  }

  // Check if the member is the workspace owner
  const workspace = await WorkspaceModel.findById(workspaceId);
  if(!workspace){
    throw new NotFoundException("Workspace not found");
  }

  if(workspace.owner.equals(member.userId)){
    throw new BadRequestException("Cannot remove workspace owner");
  }

  // Delete the member
  await MemberModel.findByIdAndDelete(member._id);

  return {
    message: "Member removed successfully"
  }
};

export const updateWorkspaceByIdService = async (workspaceId:string,name:string,description?:string) => {
    const workspace = await WorkspaceModel.findById(workspaceId);
    if(!workspace){
        throw new NotFoundException("Workspace not found");
    }

    workspace.name = name || workspace.name;
    workspace.description = description || workspace.description;
    await workspace.save();

    return {
        workspace
    }
}

export const deleteWorkspaceByIdService = async (workspaceId:string,userId:string) => {
    const session = await mongoose.startSession();
    session.startTransaction();
   try{
    const workspace = await WorkspaceModel.findById(workspaceId).session(session);
    if(!workspace){
        throw new NotFoundException("Workspace not found");
    }

 
   // Check if the user owns the workspace
   if (!workspace.owner.equals(new mongoose.Types.ObjectId(userId))) { 
    throw new BadRequestException(
      "You are not authorized to delete this workspace"
    );
  }
    //find user
    const user = await UserModel.findById(userId).session(session);
    if(!user){
        throw new NotFoundException("User not found");
    }

    await ProjectModel.deleteMany({workspace:workspaceId}).session(session);
    await TaskModel.deleteMany({workspace:workspaceId}).session(session);
    await MemberModel.deleteMany({workspaceId}).session(session);

    //update user current workspace if user is a owner of the workspace
    if(user?.currentWorkspace?.equals(workspaceId)){
       const memberWorkspace = await MemberModel.findOne({userId}).session(session);
        
      //update user current workspace
       user.currentWorkspace = memberWorkspace
       ? memberWorkspace.workspaceId
       : null;

       await user.save();
    }
    await workspace.deleteOne().session(session);
    await session.commitTransaction();
    session.endSession();

    return {
     currentWorkspace : user.currentWorkspace,
     workspace
    }
   }
   catch(error){
    await session.abortTransaction();
    session.endSession();
    throw error;
   }
}