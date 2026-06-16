import {
  ChevronDown,
  Loader,
  MoreHorizontal,
  Trash2,
  UserX,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { useAuthContext } from "@/context/auth-provider";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  changeWorkspaceMemberRoleMutationFn,
  removeWorkspaceMemberMutationFn,
} from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Permissions } from "@/constant";
import { useState } from "react";

const AllMembers = () => {
  const { user, hasPermission } = useAuthContext();

  const canChangeMemberRole = hasPermission(Permissions.CHANGE_MEMBER_ROLE);
  const canRemoveMember = hasPermission(Permissions.REMOVE_MEMBER);

  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const { data, isPending } = useGetWorkspaceMembers(workspaceId);
  const members = data?.members || [];
  const roles = data?.roles || [];

  const { mutate: changeRole, isPending: isChangingRole } = useMutation({
    mutationFn: changeWorkspaceMemberRoleMutationFn,
  });

  const { mutate: removeMember, isPending: isRemovingMember } = useMutation({
    mutationFn: removeWorkspaceMemberMutationFn,
  });

  const handleSelect = (roleId: string, memberId: string) => {
    if (!roleId || !memberId) return;
    const payload = {
      workspaceId,
      data: {
        roleId,
        memberId,
      },
    };
    changeRole(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["members", workspaceId],
        });
        toast({
          title: "Success",
          description: "Member's role changed successfully",
          variant: "success",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    removeMember(
      { workspaceId, memberId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["members", workspaceId],
          });
          toast({
            title: "Success",
            description: `${memberName} has been removed from the workspace`,
            variant: "success",
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="grid gap-6 pt-2">
      {isPending ? (
        <Loader className="w-8 h-8 animate-spin place-self-center flex" />
      ) : null}

      {members?.map((member) => {
        const name = member.userId?.name || "";
        const initials = getAvatarFallbackText(name);
        const avatarColor = getAvatarColor(name);
        const roleName = member.role?.name || "Unknown";
        const isCurrentUser = member.userId?._id === user?._id;
        const canManageThisMember =
          !isCurrentUser && (canChangeMemberRole || canRemoveMember);

        return (
          <div
            key={member._id}
            className="flex items-center justify-between space-x-4"
          >
            <div className="flex items-center space-x-4">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={member.userId?.profilePicture || ""}
                  alt="Image"
                />
                <AvatarFallback className={avatarColor}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">{name}</p>
                <p className="text-sm text-muted-foreground">
                  {member.userId?.email || ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Role Display */}
              <div className="text-sm text-muted-foreground capitalize">
                {roleName.toLowerCase()}
              </div>

              {/* Actions Menu */}
              {canManageThisMember && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={isChangingRole || isRemovingMember}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* Change Role Option */}
                    {canChangeMemberRole && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Change Role
                          </DropdownMenuItem>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" align="end">
                          <Command>
                            <CommandInput
                              placeholder="Select new role..."
                              disabled={isChangingRole}
                              className="disabled:pointer-events-none"
                            />
                            <CommandList>
                              {isChangingRole ? (
                                <Loader className="w-8 h-8 animate-spin place-self-center flex my-4" />
                              ) : (
                                <>
                                  <CommandEmpty>No roles found.</CommandEmpty>
                                  <CommandGroup>
                                    {roles?.map(
                                      (role) =>
                                        role.name !== "OWNER" && (
                                          <CommandItem
                                            key={role._id}
                                            disabled={isChangingRole}
                                            className="disabled:pointer-events-none gap-1 mb-1 flex flex-col items-start px-4 py-2 cursor-pointer"
                                            onSelect={() => {
                                              handleSelect(
                                                role._id,
                                                member.userId?._id || ""
                                              );
                                            }}
                                          >
                                            <p className="capitalize">
                                              {role.name?.toLowerCase()}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                              {role.name === "ADMIN" &&
                                                `Can view, create, edit tasks, project and manage settings.`}
                                              {role.name === "MEMBER" &&
                                                `Can view, edit only task created by.`}
                                            </p>
                                          </CommandItem>
                                        )
                                    )}
                                  </CommandGroup>
                                </>
                              )}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    )}

                    {/* Remove Member Option */}
                    {canRemoveMember && (
                      <>
                        <DropdownMenuSeparator />
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove Member
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Remove Member</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to remove{" "}
                                <span className="font-semibold">{name}</span>{" "}
                                from this workspace? This action cannot be
                                undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline">Cancel</Button>
                              <Button
                                onClick={() =>
                                  handleRemoveMember(
                                    member.userId?._id || "",
                                    name
                                  )
                                }
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                disabled={isRemovingMember}
                              >
                                {isRemovingMember ? (
                                  <Loader className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Remove"
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AllMembers;
