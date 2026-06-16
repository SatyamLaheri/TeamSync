import { Plus, TrendingUp, Users, FolderOpen, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
import WorkspaceAnalytics from "@/components/workspace/workspace-analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecentProjects from "@/components/workspace/project/recent-projects";
import RecentTasks from "@/components/workspace/task/recent-tasks";
import RecentMembers from "@/components/workspace/member/recent-members";
import { useAuthContext } from "@/context/auth-provider";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useQuery } from "@tanstack/react-query";
import {
  getWorkspaceAnalyticsQueryFn,
  getProjectsInWorkspaceQueryFn,
  getMembersInWorkspaceQueryFn,
} from "@/lib/api";
import { Loader } from "lucide-react";

const WorkspaceDashboard = () => {
  const { onOpen } = useCreateProjectDialog();
  const { user, workspace } = useAuthContext();
  const navigate = useNavigate();
  const workspaceId = useWorkspaceId();

  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["workspace-analytics", workspaceId],
    queryFn: () => getWorkspaceAnalyticsQueryFn(workspaceId),
    staleTime: 0,
    enabled: !!workspaceId,
  });

  // Fetch projects data for stats
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects-stats", workspaceId],
    queryFn: () =>
      getProjectsInWorkspaceQueryFn({
        workspaceId,
        pageSize: 1000,
        pageNumber: 1,
      }),
    staleTime: 0,
    enabled: !!workspaceId,
  });

  // Fetch members data for stats
  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ["members-stats", workspaceId],
    queryFn: () => getMembersInWorkspaceQueryFn(workspaceId),
    staleTime: 0,
    enabled: !!workspaceId,
  });

  const analytics = analyticsData?.analytics;
  const projects = projectsData?.projects || [];
  const members = membersData?.members || [];

  // If user has no current workspace, show a different view
  if (!user?.currentWorkspace?._id) {
    return (
      <main className="flex flex-1 flex-col py-6 md:pt-6">
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center space-y-6 max-w-md">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
              <FolderOpen className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Welcome to SyncHub!
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                You don't have any workspaces yet. Create your first workspace
                to start collaborating with your team.
              </p>
            </div>
            <Button
              onClick={() => navigate("/workspace/create")}
              className="h-12 px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Workspace
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // If workspace doesn't exist, show error
  if (!workspace) {
    return (
      <main className="flex flex-1 flex-col py-6 md:pt-6">
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center space-y-6 max-w-md">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-destructive" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-destructive">
                Workspace Not Found
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                The workspace you're looking for doesn't exist or you don't have
                access to it.
              </p>
            </div>
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="h-12 px-8"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col py-6 md:pt-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {workspace.name}
          </h1>
          <p className="text-muted-foreground text-lg">
            Welcome back! Here's what's happening in your workspace.
          </p>
        </div>
        <Button
          onClick={onOpen}
          className="h-12 px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="mr-2 h-5 w-5" />
          New Project
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Projects
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <Loader className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{projects.length}</div>
                <p className="text-xs text-muted-foreground">
                  {projects.length > 0 ? "Active projects" : "No projects yet"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Tasks
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Loader className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {(analytics?.totalTasks || 0) -
                    (analytics?.completedTasks || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics?.overdueTasks || 0} overdue tasks
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Team Members
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {membersLoading ? (
              <Loader className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{members.length}</div>
                <p className="text-xs text-muted-foreground">
                  {members.length > 1 ? "Team members" : "Team member"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics */}
      <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Workspace Analytics
          </CardTitle>
          <CardDescription>
            Track your workspace performance and productivity metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WorkspaceAnalytics />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Stay updated with the latest projects, tasks, and team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="projects" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/30 dark:bg-muted/20 border border-border/50 dark:border-border/30">
              <TabsTrigger
                value="projects"
                className="data-[state=active]:bg-background dark:data-[state=active]:bg-muted/40 data-[state=active]:text-foreground dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all hover:bg-muted/50 dark:hover:bg-muted/30 text-muted-foreground dark:text-muted-foreground"
              >
                Recent Projects
              </TabsTrigger>
              <TabsTrigger
                value="tasks"
                className="data-[state=active]:bg-background dark:data-[state=active]:bg-muted/40 data-[state=active]:text-foreground dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all hover:bg-muted/50 dark:hover:bg-muted/30 text-muted-foreground dark:text-muted-foreground"
              >
                Recent Tasks
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className="data-[state=active]:bg-background dark:data-[state=active]:bg-muted/40 data-[state=active]:text-foreground dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all hover:bg-muted/50 dark:hover:bg-muted/30 text-muted-foreground dark:text-muted-foreground"
              >
                Recent Members
              </TabsTrigger>
            </TabsList>
            <TabsContent value="projects" className="mt-6">
              <RecentProjects />
            </TabsContent>
            <TabsContent value="tasks" className="mt-6">
              <RecentTasks />
            </TabsContent>
            <TabsContent value="members" className="mt-6">
              <RecentMembers />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
};

export default WorkspaceDashboard;
