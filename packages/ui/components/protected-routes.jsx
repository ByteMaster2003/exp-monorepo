import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "ui/hooks";

export const RoleProtectedRoutes = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.split(",").includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
