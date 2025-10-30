import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/supabase";
import { Mail, Phone, Calendar, MapPin, Edit, Crown, ArrowLeft, Users, User, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
    if (user) {
      loadFollowers();
      loadFollowing();
    }
  }, [user, loading, navigate]);

  const loadFollowers = async () => {
    if (!user) return;
    const { data } = await authService.getFollowers(user.id);
    if (data) setFollowers(data);
  };

  const loadFollowing = async () => {
    if (!user) return;
    const { data } = await authService.getFollowing(user.id);
    if (data) setFollowing(data);
  };

  const handlePrivacyToggle = async () => {
    if (!profile) return;
    const newPrivacy = !profile.is_private;
    const { error } = await authService.updatePrivacy(newPrivacy);
    
    if (error) {
      toast.error("Failed to update privacy setting");
      return;
    }

    toast.success(newPrivacy ? "Profile is now private" : "Profile is now public");
    window.location.reload(); // Refresh to update profile
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Header onSearch={() => {}} />

      <div className="container mx-auto px-4 pt-24 pb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Profile Header Card */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-gray-800 overflow-hidden mb-6">
            <div className="h-32 bg-gradient-to-r from-primary via-purple-600 to-pink-600" />
            <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16">
                {/* Profile Picture */}
                <div className="relative">
                  {profile.profile_picture_url ? (
                    <img
                      src={profile.profile_picture_url}
                      alt={profile.full_name || "Profile"}
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-900"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center border-4 border-gray-900">
                      <span className="text-4xl font-bold">
                        {profile.full_name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                  {profile.is_premium && (
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-gray-900">
                      <Crown className="w-5 h-5 text-black" />
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-white mb-1">
                    {profile.full_name || "User"}
                  </h1>
                  {profile.username && (
                    <p className="text-gray-400 mb-2">@{profile.username}</p>
                  )}
                  {profile.is_premium && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-500 text-sm font-semibold">
                      <Crown className="w-4 h-4" />
                      Premium Member
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={handlePrivacyToggle}
                    variant="outline"
                    className="gap-2 border-gray-700"
                  >
                    {profile.is_private ? (
                      <>
                        <Lock className="w-4 h-4" />
                        Private
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4" />
                        Public
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => navigate("/profile/edit")}
                    className="bg-primary hover:bg-primary/90 gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
              <h2 className="text-xl font-bold mb-4 text-white">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white">{profile.email}</p>
                  </div>
                </div>
                {profile.phone_number && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400">Phone</p>
                      <p className="text-white">{profile.phone_number}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
              <h2 className="text-xl font-bold mb-4 text-white">Personal Information</h2>
              <div className="space-y-4">
                {profile.date_of_birth && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400">Date of Birth</p>
                      <p className="text-white">
                        {new Date(profile.date_of_birth).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                {profile.country && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400">Country</p>
                      <p className="text-white">{profile.country}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Stats */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 md:col-span-2">
              <h2 className="text-xl font-bold mb-4 text-white">Account Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setShowFollowers(true)}
                  className="text-center p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <p className="text-2xl font-bold text-primary">{followers.length}</p>
                  <p className="text-sm text-gray-400">Followers</p>
                </button>
                <button
                  onClick={() => setShowFollowing(true)}
                  className="text-center p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <p className="text-2xl font-bold text-primary">{following.length}</p>
                  <p className="text-sm text-gray-400">Following</p>
                </button>
                <div className="text-center p-4 bg-gray-800/50 rounded-xl">
                  <p className="text-2xl font-bold text-primary">0</p>
                  <p className="text-sm text-gray-400">Watchlist</p>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-xl">
                  <p className="text-2xl font-bold text-primary">
                    {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-gray-400">Member Since</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Followers Modal */}
        <AnimatePresence>
          {showFollowers && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 z-50"
                onClick={() => setShowFollowers(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gray-900 rounded-2xl border border-gray-800 p-6 z-50 max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Followers ({followers.length})</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowFollowers(false)}>
                    ×
                  </Button>
                </div>
                <div className="space-y-2">
                  {followers.map((follower: any) => (
                    <button
                      key={follower.id}
                      onClick={() => {
                        setShowFollowers(false);
                        navigate(`/user/${follower.follower.id}`);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800 transition-colors"
                    >
                      {follower.follower.profile_picture_url ? (
                        <img
                          src={follower.follower.profile_picture_url}
                          alt=""
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                      <div className="text-left">
                        <p className="font-semibold">{follower.follower.full_name}</p>
                        {follower.follower.username && (
                          <p className="text-sm text-gray-400">@{follower.follower.username}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Following Modal */}
        <AnimatePresence>
          {showFollowing && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 z-50"
                onClick={() => setShowFollowing(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gray-900 rounded-2xl border border-gray-800 p-6 z-50 max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Following ({following.length})</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowFollowing(false)}>
                    ×
                  </Button>
                </div>
                <div className="space-y-2">
                  {following.map((follow: any) => (
                    <button
                      key={follow.id}
                      onClick={() => {
                        setShowFollowing(false);
                        navigate(`/user/${follow.following.id}`);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800 transition-colors"
                    >
                      {follow.following.profile_picture_url ? (
                        <img
                          src={follow.following.profile_picture_url}
                          alt=""
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                      <div className="text-left">
                        <p className="font-semibold">{follow.following.full_name}</p>
                        {follow.following.username && (
                          <p className="text-sm text-gray-400">@{follow.following.username}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <MobileNav />
    </div>
  );
};

export default Profile;
