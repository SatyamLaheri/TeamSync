import { DashboardSkeleton } from "@/components/skeleton-loaders/dashboard-skeleton";
import useAuth from "@/hooks/api/use-auth";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthRoute } from "./common/routePaths";

const AuthRoute = () => {
  const location = useLocation();
  const { data: authData, isLoading, error } = useAuth();
  const user = authData?.data;

  const _isAuthRoute = isAuthRoute(location.pathname);

  console.log("AuthRoute - location:", location.pathname);
  console.log("AuthRoute - authData:", authData);
  console.log("AuthRoute - user:", user);
  console.log("AuthRoute - user.currentWorkspace:", user?.currentWorkspace);
  console.log("AuthRoute - _isAuthRoute:", _isAuthRoute);
  console.log("AuthRoute - error:", error);

  // Show loading skeleton while loading
  if (isLoading && !_isAuthRoute) return <DashboardSkeleton />;

  // If no user, show auth pages
  if (!user) return <Outlet />;

  // If user has no current workspace, redirect to dashboard
  if (!user.currentWorkspace?._id) {
    console.log("AuthRoute - No current workspace, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // If user has a current workspace, redirect to it
  console.log(
    "AuthRoute - Redirecting to workspace:",
    user.currentWorkspace._id
  );
  return <Navigate to={`workspace/${user.currentWorkspace._id}`} replace />;
};

export default AuthRoute;
