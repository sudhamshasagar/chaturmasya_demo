import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import BookSeva from "../pages/BookSeva";
import VirtualPadaPuja from "../pages/VirtualPadaPuja";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book-seva" element={<BookSeva />} />
        <Route path="/virtual-pada-puja" element={<VirtualPadaPuja />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;