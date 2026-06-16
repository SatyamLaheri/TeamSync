import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "./protected.route";
import AuthRoute from "./auth.route";
import {
  authenticationRoutePaths,
  baseRoutePaths,
  protectedRoutePaths,
} from "./common/routes";
import AppLayout from "@/layout/app.layout";
import BaseLayout from "@/layout/base.layout";
import NotFound from "@/page/errors/NotFound";
import useAuth from "@/hooks/api/use-auth";

function RootRedirect() {
  const { data: authData, isLoading } = useAuth();
  const user = authData?.data;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/sign-in" replace />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        <Route element={<BaseLayout />}>
          {baseRoutePaths.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>

        {/* Auth Routes */}
        <Route element={<AuthRoute />}>
          <Route element={<BaseLayout />}>
            {authenticationRoutePaths.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Route>
        </Route>

        {/* Protected Route */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {protectedRoutePaths.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Route>
        </Route>
        {/* Catch-all for undefined routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
