import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotFound } from "ui/components";

import { Home } from "./pages/Home.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
