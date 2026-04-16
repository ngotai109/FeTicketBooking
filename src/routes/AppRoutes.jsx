// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import AdminDashboard from "../pages/AdminDashboard";
import AdminLayout from "../layouts/Admin/AdminLayout";
import DriverLayout from "../layouts/Driver/DriverLayout";
import RouteManagement from "../pages/Admin/RouteManagement";
import ProvinceManagement from "../pages/Admin/ProvinceManagement";
import WardManagement from "../pages/Admin/WardManagement";
import OfficeManagement from "../pages/Admin/OfficeManagement";
import BusManagement from "../pages/Admin/BusManagement";
import ScheduleManagement from "../pages/Admin/ScheduleManagement";
import TripMonitoring from "../pages/Admin/TripMonitoring";
import BusTypeManagement from "../pages/Admin/BusTypeManagement";
import PassengerManagement from "../pages/Admin/PassengerManagement";
import CancellationManagement from "../pages/Admin/CancellationManagement";
import DriverManagement from "../pages/Admin/DriverManagement";
import DriverSchedule from "../pages/Driver/DriverSchedule";
import DriverProfile from "../pages/Driver/DriverProfile";
import DriverLeaveRequest from "../pages/Driver/DriverLeaveRequest";
import ChangePassword from "../pages/Admin/ChangePassword";
import ProtectedRoute from "./ProtectedRoute";
import UserLayout from "../layouts/User/UserLayout";
import Home from "../pages/User/Home";
import Booking from "../pages/User/Booking";
import Checkout from "../pages/User/Checkout";
import VNPayMock from "../pages/User/VNPayMock";
import AboutUs from "../pages/User/AboutUs";
import OfficeSystem from "../pages/User/OfficeSystem";
import TicketLookup from "../pages/User/TicketLookup";
import TicketResult from "../pages/User/TicketResult";
import CargoTransport from "../pages/User/CargoTransport";
import PassengerTransport from "../pages/User/PassengerTransport";
import News from "../pages/User/News";
import Contact from "../pages/User/Contact";
import ScheduleLookup from "../pages/User/ScheduleLookup";
import VNPayReturn from "../pages/User/VNPayReturn";
import PayOSReturn from "../pages/User/PayOSReturn";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<UserLayout />}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="booking" element={<Booking />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="payment/vnpay" element={<VNPayMock />} />
        <Route path="payment/vnpay-return" element={<VNPayReturn />} />
        <Route path="payment/payos-return" element={<PayOSReturn />} />
        <Route path="about/our" element={<AboutUs />} />
        <Route path="about/history" element={<OfficeSystem />} />
        <Route path="lookup/ticket" element={<TicketLookup />} />
        <Route path="lookup/result" element={<TicketResult />} />
        <Route path="lookup/schedule" element={<ScheduleLookup />} />
        <Route path="services/cargo" element={<CargoTransport />} />
        <Route path="services/transport" element={<PassengerTransport />} />
        <Route path="news" element={<News />} />
        <Route path="contact" element={<Contact />} />
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
        <Route path="provinces" element={<ProvinceManagement />} />
        <Route path="wards" element={<WardManagement />} />
        <Route path="offices" element={<OfficeManagement />} />
        <Route path="vehicles" element={<BusManagement />} />
        <Route path="schedules" element={<ScheduleManagement />} />
        <Route path="trips" element={<TripMonitoring />} />
        <Route path="bus-types" element={<BusTypeManagement />} />
        <Route path="passengers" element={<PassengerManagement />} />
        <Route path="cancellation" element={<CancellationManagement />} />
        <Route path="drivers" element={<DriverManagement />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>

      <Route
        path="/driver"
        element={
          <ProtectedRoute>
            <DriverLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="schedule" replace />} />
        <Route path="schedule" element={<DriverSchedule />} />
        <Route path="leave-request" element={<DriverLeaveRequest />} />
        <Route path="profile" element={<DriverProfile />} />
        <Route path="change-password" element={<DriverProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
