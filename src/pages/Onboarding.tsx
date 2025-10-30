import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Phone, Calendar, MapPin, Upload, Loader2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  // Form data
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [country, setCountry] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const user = await authService.getCurrentUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setUserId(user.id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!userId) return;
    setIsLoading(true);

    try {
      let profilePictureUrl = null;

      // Upload profile picture if provided
      if (profilePicture) {
        console.log("Uploading profile picture...");
        const { data, error } = await authService.uploadProfilePicture(userId, profilePicture);
        if (error) {
          console.error("Upload error:", error);
          toast.error("Failed to upload profile picture: " + error.message);
          setIsLoading(false);
          return;
        } else {
          profilePictureUrl = data;
          console.log("Profile picture uploaded:", profilePictureUrl);
        }
      }

      // Update user profile
      console.log("Updating profile with data:", {
        full_name: fullName,
        username: username || undefined,
        phone_number: phoneNumber,
        date_of_birth: dateOfBirth,
        country,
        profile_picture_url: profilePictureUrl || undefined,
        onboarding_completed: true,
      });

      const { data, error } = await authService.updateUserProfile(userId, {
        full_name: fullName,
        username: username || undefined,
        phone_number: phoneNumber,
        date_of_birth: dateOfBirth || undefined,
        country: country || undefined,
        profile_picture_url: profilePictureUrl || undefined,
        onboarding_completed: true,
      });

      if (error) {
        console.error("Profile update error:", error);
        toast.error("Failed to update profile: " + error.message);
        setIsLoading(false);
        return;
      }

      console.log("Profile updated successfully:", data);
      toast.success("Profile completed! Welcome to QuickShow!");
      await refreshProfile();
      setTimeout(() => {
        navigate("/");
      }, 500);
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast.error("An error occurred: " + (error.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !fullName) {
      toast.error("Please enter your full name");
      return;
    }
    if (currentStep === 2 && !phoneNumber) {
      toast.error("Please enter your phone number");
      return;
    }
    if (currentStep === 3 && (!dateOfBirth || !country)) {
      toast.error("Please fill all fields");
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => setCurrentStep(currentStep - 1);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-900/10 to-pink-900/10" />

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="container mx-auto">
          <div className="text-3xl font-bold">
            <span className="text-primary">Q</span>
            <span className="text-white">uickShow</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-100px)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-800">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">Step {currentStep} of 4</span>
                <span className="text-sm text-primary">{Math.round((currentStep / 4) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-purple-600"
                  initial={{ width: "0%" }}
                  animate={{ width: `${(currentStep / 4) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-2 text-white text-center">Complete Your Profile</h2>
            <p className="text-gray-400 text-center mb-8">Let's get to know you better</p>

            <AnimatePresence mode="wait">
              {/* Step 1: Name & Username */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className="pl-12 h-14 bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Username (Optional)</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose a username"
                        className="pl-12 h-14 bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Phone Number */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="pl-12 h-14 bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Date of Birth & Country */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Date of Birth *</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="pl-12 h-14 bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Country *</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Enter your country"
                        className="pl-12 h-14 bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Profile Picture */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Profile Picture (Optional)</label>
                    <div className="flex flex-col items-center gap-4">
                      {previewUrl ? (
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center border-2 border-dashed border-gray-600">
                          <Upload className="w-8 h-8 text-gray-400" />
                        </div>
                      )}

                      <label className="cursor-pointer">
                        <div className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-white font-medium transition-colors">
                          Choose Photo
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              {currentStep > 1 && (
                <Button
                  onClick={prevStep}
                  variant="outline"
                  className="flex-1 h-14 border-gray-700 hover:bg-gray-800"
                  disabled={isLoading}
                >
                  Previous
                </Button>
              )}

              {currentStep < 4 ? (
                <Button
                  onClick={nextStep}
                  className="flex-1 h-14 bg-primary hover:bg-primary/90"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 h-14 bg-gradient-to-r from-primary to-purple-600"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Complete Profile
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Onboarding;
