import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/lib/supabase";
import { toast } from "sonner";

const GoogleCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const user = await authService.getCurrentUser();
        
        if (!user) {
          toast.error("Authentication failed");
          navigate("/login");
          return;
        }

        // Check if user has completed onboarding
        const profile = await authService.getUserProfile(user.id);
        
        if (!profile || !profile.onboarding_completed) {
          // New Google user - redirect to onboarding
          navigate("/onboarding");
        } else {
          // Existing user - redirect to home
          toast.success("Welcome back!");
          navigate("/");
        }
      } catch (error) {
        console.error("Callback error:", error);
        toast.error("Something went wrong");
        navigate("/login");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-white text-lg">Completing sign in...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
