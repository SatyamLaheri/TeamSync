import { PermissionType, Roles } from "../enums/role.enums";
import { UnauthorizedException } from "./appError";
import { RolePermissions } from "./role-permission";

export const roleGuard = (
    role: keyof typeof Roles,
    requiredPermissions: PermissionType[]
)=>{
    const rolePermissions = RolePermissions[role];
    // Check if the role has all the required permissions

     const hasPermission = requiredPermissions.every((permission)=>rolePermissions.includes(permission));
     if(!hasPermission){
        throw new UnauthorizedException("You are not authorized to access this resource");
     }

     
}