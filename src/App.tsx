import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import PlanTrip from "./pages/PlanTrip";
import Dashboard from "./pages/Dashboard";
import Destinations from "./pages/Destinations";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Hotels from "./pages/Hotels";
import Bookings from "./pages/Bookings";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Packages from "./pages/Packages";
import PackageDetails from "./pages/PackageDetails";
import BookingConfirmation from "./pages/BookingConfirmation";
import FlightBooking from "./pages/FlightBooking";
import HotelBooking from "./pages/HotelBooking";
import BookingSummary from "./pages/BookingSummary";
import BookingDetails from "./pages/BookingDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/plan" element={<PlanTrip />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/hotels" element={<Hotels />} />
            <Route path="/flights" element={
              <ProtectedRoute>
                <FlightBooking />
              </ProtectedRoute>
            } />
            <Route path="/hotels-booking" element={
              <ProtectedRoute>
                <HotelBooking />
              </ProtectedRoute>
            } />
            <Route path="/booking-summary" element={
              <ProtectedRoute>
                <BookingSummary />
              </ProtectedRoute>
            } />
            <Route path="/about" element={<About />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/packages/:id" element={<PackageDetails />} />
            <Route path="/booking-confirmation/:id" element={
              <ProtectedRoute>
                <BookingConfirmation />
              </ProtectedRoute>
            } />
            <Route path="/bookings" element={
              <ProtectedRoute>
                <Bookings />
              </ProtectedRoute>
            } />
            <Route path="/booking-details/:id" element={
              <ProtectedRoute>
                <BookingDetails />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
