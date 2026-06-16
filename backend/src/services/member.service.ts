import { ErrorCodeEnum } from "../enums/error-code.enum";
import { Roles, RoleType } from "../enums/role.enums";
import MemberModel from "../models/member.model";
import RoleModel from "../models/roles-permission.model";
import WorkspaceModel from "../models/workspace.model";
import { NotFoundException, UnauthorizedException } from "../utils/appError";

type PopulatedMemberRole = {
    role: {
        name: RoleType;
    };
};

export const getMemberRoleInWorkspace = async (userId:string,workspaceId:string) => {
    const workspace = await WorkspaceModel.findById(workspaceId);
    if(!workspace){
        throw new NotFoundException("Workspace not found");
    }
    console.log("[DEBUG] Checking membership for:", { userId, workspaceId });
    const member = await MemberModel.findOne({userId,workspaceId})
        .populate<PopulatedMemberRole>("role");
    if(!member){
        throw new UnauthorizedException("You are not a member of this workspace",
            ErrorCodeEnum.ACCESS_UNAUTHORIZED,
        );
    }
    const roleName = member.role?.name;
    return {role : roleName};
}

export const joinWorkspaceService = async (userId:string,inviteCode:string) => {
    const workspace = await WorkspaceModel.findOne({inviteCode}).exec();
    if(!workspace){
        throw new NotFoundException("Workspace not found");
    }

    const existingMember = await MemberModel.findOne({userId,workspaceId:workspace._id}).exec();
    if(existingMember){
        throw new UnauthorizedException("You are already a member of this workspace",
            ErrorCodeEnum.ACCESS_UNAUTHORIZED,
        );
    }
    const role = await RoleModel.findOne({name : Roles.MEMBER}).exec();
    if(!role){
        throw new NotFoundException("Role not found");
    }
   //Add member to workspace
    const newMember = await MemberModel.create({
        userId,
        workspaceId:workspace._id,
        role:role._id,
    });

    await newMember.save();

    return {
        workspaceId:workspace._id,
        role:role.name,
    }


}
