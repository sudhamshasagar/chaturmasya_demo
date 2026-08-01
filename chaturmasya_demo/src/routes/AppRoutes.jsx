import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import AdminLogin from "../pages/AdminLogin";
import BookSeva from "../pages/BookSeva";
import VirtualPadaPuja from "../pages/VirtualPadaPuja";
import Committee from "../pages/Committee";
import ProtectedRoute from "./ProtectedRoute";
import CulturalRequests from "../admin/CulturalRequests";
import AdminLayout from "../admin/AdminLayout";
import Bookings from "../admin/Bookings";
import Blogs from "../admin/Blogs";
import Schedule from "../admin/Schedule";
import VirtualBookings from "../admin/VirtualBookings";
import AdminVirtualPuja from "../admin/AdminVirtualPuja";
import AdminJapa from "../admin/JapaTracker";
import Mantrakshata from "../admin/Mantrakshata";
import MantrakshataRequest from "../pages/Mantrakshate";
import JapaSeva from "../pages/JapaSeva";


const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/book-seva" element={<BookSeva />} />
        <Route path="/committee" element={<Committee/>}/>
        <Route path="/virtual-pada-puja" element={<VirtualPadaPuja />} />
        <Route path="/mantrakshate" element={<MantrakshataRequest/>}/>
        <Route
          path="/counter"
          element={
              <JapaSeva/>
          }
        />
        <Route path="/admin/login" element={<AdminLogin />} />
        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blogs"
          element={
            <ProtectedRoute>
              <Blogs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/schedule"
          element={
            <ProtectedRoute>
              <Schedule />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/book-seva"
          element={
            <ProtectedRoute>
              <AdminVirtualPuja />
            </ProtectedRoute>
          }
        />
        <Route
         path="/admin/c-programs"
         element={
          <ProtectedRoute>
            <CulturalRequests/>
          </ProtectedRoute>
         }
         />
        <Route
          path="/admin/japa"
          element={
            <ProtectedRoute>
              <AdminJapa/>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/mantrakshata"
          element={
            <ProtectedRoute>
              <Mantrakshata />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;