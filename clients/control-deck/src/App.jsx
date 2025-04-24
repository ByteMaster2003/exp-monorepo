import { BrowserRouter, Route, Routes } from "react-router-dom";
import { NotFound, RoleProtectedRoutes, Unauthorized } from "ui/components";

import { Account, Admin, Home, Login, Logs, Profile, AuthCallback } from "./pages/index.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/oauth/callback" element={<AuthCallback />} />

        <Route element={<RoleProtectedRoutes allowedRoles="Admin,User" />}>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/account" element={<Account />} />
          <Route path="/logs" element={<Logs />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
