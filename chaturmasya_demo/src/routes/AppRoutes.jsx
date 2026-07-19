import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import AdminLogin from "../pages/AdminLogin";
import BookSeva from "../pages/BookSeva";
import VirtualPadaPuja from "../pages/VirtualPadaPuja";

import ProtectedRoute from "./ProtectedRoute";
import CulturalRequests from "../admin/CulturalRequests";
import AdminLayout from "../admin/AdminLayout";
import Bookings from "../admin/Bookings";
import Blogs from "../admin/Blogs";
import Schedule from "../admin/Schedule";
import VirtualBookings from "../admin/VirtualBookings";
import AdminVirtualPuja from "../admin/AdminVirtualPuja";
import Accounts from "../admin/Accounts";
import Mantrakshata from "../admin/Mantrakshata";
import MantrakshataRequest from "../pages/Mantrakshate";


const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/book-seva" element={<BookSeva />} />
        <Route path="/virtual-pada-puja" element={<VirtualPadaPuja />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/request-mantrakshata"
          element={<MantrakshataRequest />}
        />

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
          path="/admin/v-bookings"
          element={
            <ProtectedRoute>
              <VirtualBookings />
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
          path="/admin/accounts"
          element={
            <ProtectedRoute>
              <Accounts />
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