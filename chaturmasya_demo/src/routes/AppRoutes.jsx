import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import BookSeva from "../pages/BookSeva";
import VirtualPadaPuja from "../pages/VirtualPadaPuja";
import AdminLayout from "../admin/AdminLayout"
import Bookings from "../admin/Bookings";
import Blogs from "../admin/Blogs";
import Schedule from "../admin/Schedule";
import VirtualBookings from "../admin/VirtualBookings";
import AdminVirtualPuja from "../admin/AdminVirtualPuja";
import Accounts from "../admin/Accounts";
import Mantrakshata from "../admin/Mantrakshata";


const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminLayout />}/>
        <Route path="/admin/bookings" element={<Bookings/>}/>
        <Route path="/admin/v-bookings" element={<VirtualBookings/>}/>
        <Route path="/admin/blogs" element={<Blogs/>}/>
        <Route path="/admin/schedule" element={<Schedule/>}/>
        <Route path="/admin/book-seva" element={<AdminVirtualPuja/>}/>
        <Route path="/admin/accounts" element={<Accounts/>}/>
        <Route path="/admin/mantrakshata" element={<Mantrakshata/>}/>
        <Route path="/book-seva" element={<BookSeva />} />
        <Route path="/virtual-pada-puja" element={<VirtualPadaPuja />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;