import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import GoogleCallback from "./pages/GoogleCallback";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import Premium from "./pages/Premium";
import Settings from "./pages/Settings";
import TwoAuth from "./pages/TwoAuth";
import MovieDetails from "./pages/MovieDetails";
import SeriesDetails from "./pages/SeriesDetails";
import Chat from "./pages/ChatFixed";
import Notifications from "./pages/Notifications";
import UserDetails from "./pages/UserDetails";
import About from "./pages/About";
import Download from "./pages/Download";
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
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/google-callback" element={<GoogleCallback />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/two-auth" element={<TwoAuth />} />
          <Route path="/movie-details/:id" element={<MovieDetails />} />
          <Route path="/series-details/:id" element={<SeriesDetails />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/user/:userId" element={<UserDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/download" element={<Download />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
