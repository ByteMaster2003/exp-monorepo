import { BrowserRouter, Route, Routes } from "react-router-dom";
import { NotFound, RoleProtectedRoutes, Unauthorized } from "ui/components";

import { Admin } from "./pages/admin.jsx";
import { AuthCallback } from "./pages/callback.jsx";
import { Home } from "./pages/home.jsx";
import { Login } from "./pages/login.jsx";
import { Logs } from "./pages/logs.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/oauth/callback" element={<AuthCallback />} />

        <Route element={<RoleProtectedRoutes allowedRoles="Admin,User" />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/logs" element={<Logs />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
