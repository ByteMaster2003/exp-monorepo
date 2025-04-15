import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RoleProtectedRoutes, Unauthorized, NotFound } from "ui/components/index.jsx";

import { Admin } from "./pages/admin.jsx";
import { Home } from "./pages/home.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<RoleProtectedRoutes allowedRoles={["Admin"]} />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
