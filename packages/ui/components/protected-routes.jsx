import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/index.js";

export const RoleProtectedRoutes = ({ allowedRoles = ["User"] }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    window.location.href = "https://example.com/help";
    return;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
