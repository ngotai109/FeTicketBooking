// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import AdminDashboard from "../pages/AdminDashboard";
import AdminLayout from "../layouts/Admin/AdminLayout";
import RouteManagement from "../pages/Admin/RouteManagement";
import LocationManagement from "../pages/Admin/LocationManagement";
import ProtectedRoute from "./ProtectedRoute";
import UserLayout from "../layouts/User/UserLayout";
import Home from "../pages/User/Home";
import Booking from "../pages/User/Booking";
import AboutUs from "../pages/User/AboutUs";
import OfficeSystem from "../pages/User/OfficeSystem";
import TicketLookup from "../pages/User/TicketLookup";
import CargoTransport from "../pages/User/CargoTransport";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<UserLayout />}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="booking" element={<Booking />} />
        <Route path="about/our" element={<AboutUs />} />
        <Route path="about/history" element={<OfficeSystem />} />
        <Route path="lookup/ticket" element={<TicketLookup />} />
        <Route path="services/cargo" element={<CargoTransport />} />
      </Route>
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="routes" element={<RouteManagement />} />
        <Route path="locations" element={<LocationManagement />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
