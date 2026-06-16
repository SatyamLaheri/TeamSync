import mongoose from "mongoose";
import UserModel from "../models/user.model";
import AccountModel from "../models/account.model";
import WorkspaceModel from "../models/workspace.model";
import RoleModel from "../models/roles-permission.model";
import { BadRequestException, NotFoundException } from "../utils/appError";
import MemberModel from "../models/member.model";
import { ProviderEnumType } from "../enums/account-provider.enum";

export const loginOrCreateAccountService  = async (data: {
    provider: string;
    displayName: string;
    providerId: string;
    email?: string;
    picture?: string;

}) => {
      const {provider, providerId, displayName, email, picture} = data;
      const session = await mongoose.startSession();
      try {
        session.startTransaction();
        console.log("session started");
        let user = await UserModel.findOne({providerId});
        if(!user){
            //create user
            user = new UserModel({
                email,
                name: displayName,
                profilePicture: picture || null,
            });
            await user.save({session});
            const account = new AccountModel({
                userId: user._id,
                provider: provider,
                providerId: providerId,
            });
            await account.save({session});

            const Workspace = new WorkspaceModel({
                name: `MY WORKSPACE`,
                description: ` WORKSPACE created for ${user.name}`,
                owner: user._id,
            });
            await Workspace.save({session});
            const ownerRole = await RoleModel.findOne({
                name: "OWNER"
            }).session(session);
            if(!ownerRole){
                throw new NotFoundException("Owner role not found");
            }
               const member = new MemberModel({
                userId: user._id,
                workspaceId: Workspace._id,
                role: ownerRole._id,
                joinedAt: new Date(),
            });
               await member.save({session});
        }

        await session.commitTransaction();
        return { user };

      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
      finally{
        session.endSession();
      }
}
 
export const registerUserService = async (body : {
    name: string;
    email: string;
    password: string;
}) => { 
    const {name, email, password} = body;
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const existingUser = await UserModel.findOne({email}).session(session);
        if(existingUser){
            throw new BadRequestException("User already exists");
        }

        const user = new UserModel({
            name,
            email,
            password,
        })

        await user.save({session});
        const account = new AccountModel({
            userId: user._id,
            provider: ProviderEnumType.EMAIL,
            providerId: email,
        });
        await account.save({session});

        //create workspace
        const Workspace = new WorkspaceModel({
            name: `MY WORKSPACE`,
            description: ` WORKSPACE created for ${user.name}`,
            owner: user._id,
        });
        await Workspace.save({session});
        const ownerRole = await RoleModel.findOne({
            name: "OWNER"
        }).session(session);
        if(!ownerRole){
            throw new NotFoundException("Owner role not found");
        }
        
        // Create member record for the user in the workspace
        const member = new MemberModel({
            userId: user._id,
            workspaceId: Workspace._id,
            role: ownerRole._id,
            joinedAt: new Date(),
        });
        await member.save({session});
        
        // Update user's current workspace
        user.currentWorkspace = Workspace._id as mongoose.Types.ObjectId;
        await user.save({session});
        
        await session.commitTransaction();
        return { user, workspace: Workspace };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    } finally {
        session.endSession();
    }
}


export const verifyUserService = async ({
    email,
    password,
    provider = ProviderEnumType.EMAIL
} : {
    email: string;
    password: string;
    provider?: string;
}
) => {
  const account = await AccountModel.findOne({
    provider,
    providerId: email,
  });
  if(!account){
    throw new NotFoundException("Account not found");
  }
  const user = await UserModel.findById(account.userId);
  if(!user){
    throw new NotFoundException("User not found");
  }
  const isMatch = await user.comparePassword(password);
  if(!isMatch){
    throw new BadRequestException("Invalid password");
  }
  return user;
}
