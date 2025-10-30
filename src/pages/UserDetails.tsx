import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/supabase";
import { Mail, Phone, Calendar, MapPin, ArrowLeft, MessageCircle, UserPlus, UserMinus, Crown, Lock } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";

const UserDetails = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStatus, setFollowStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (!currentUser || !userId) {
      navigate("/login");
      return;
    }
    loadUserProfile();
    checkFollowStatus();
    loadCounts();
  }, [userId, currentUser]);

  const loadUserProfile = async () => {
    if (!userId) return;
    const profile = await authService.getUserProfile(userId);
    setUserProfile(profile);
    setLoading(false);
  };

  const checkFollowStatus = async () => {
    if (!userId || !currentUser) return;
    
    const { data: following } = await authService.getFollowing(currentUser.id);
    if (following) {
      const followRecord = following.find((f: any) => f.following_id === userId);
      if (followRecord) {
        setIsFollowing(true);
        setFollowStatus(followRecord.status);
      }
    }
  };

  const loadCounts = async () => {
    if (!userId) return;
    
    const { data: followers } = await authService.getFollowers(userId);
    const { data: following } = await authService.getFollowing(userId);
    
    setFollowersCount(followers?.length || 0);
    setFollowingCount(following?.length || 0);
  };

  const handleFollow = async () => {
    if (!userId) return;
    
    const { error } = await authService.followUser(userId);
    if (error) {
      toast.error("Failed to follow user");
      return;
    }

    if (userProfile?.is_private) {
      toast.success("Follow request sent!");
      setFollowStatus("pending");
    } else {
      toast.success("Now following!");
      setIsFollowing(true);
      setFollowStatus("accepted");
    }
    loadCounts();
  };

  const handleUnfollow = async () => {
    if (!userId) return;
    
    const { error } = await authService.unfollowUser(userId);
    if (error) {
      toast.error("Failed to unfollow user");
      return;
    }

    toast.success("Unfollowed");
    setIsFollowing(false);
    setFollowStatus(null);
    loadCounts();
  };

  const handleMessage = async () => {
    if (!userId) return;
    navigate(`/chat?user=${userId}`);
  };

  const canMessage = () => {
    if (!userProfile) return false;
    return !userProfile.is_private || (isFollowing && followStatus === "accepted");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-gray-400">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Header onSearch={() => {}} />

      <div className="container mx-auto px-4 pt-24 pb-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
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
                  {userProfile.profile_picture_url ? (
                    <img
                      src={userProfile.profile_picture_url}
                      alt={userProfile.full_name || "Profile"}
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-900"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center border-4 border-gray-900">
                      <span className="text-4xl font-bold">
                        {userProfile.full_name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                  {userProfile.is_premium && (
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-gray-900">
                      <Crown className="w-5 h-5 text-black" />
                    </div>
                  )}
                  {userProfile.is_private && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-900">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-white mb-1">
                    {userProfile.full_name || "User"}
                  </h1>
                  {userProfile.username && (
                    <p className="text-gray-400 mb-2">@{userProfile.username}</p>
                  )}
                  <div className="flex gap-4 justify-center md:justify-start text-sm">
                    <div>
                      <span className="font-bold text-white">{followersCount}</span>
                      <span className="text-gray-400 ml-1">Followers</span>
                    </div>
                    <div>
                      <span className="font-bold text-white">{followingCount}</span>
                      <span className="text-gray-400 ml-1">Following</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {isFollowing && followStatus === "accepted" ? (
                    <Button
                      onClick={handleUnfollow}
                      variant="outline"
                      className="gap-2 border-gray-700"
                    >
                      <UserMinus className="w-4 h-4" />
                      Unfollow
                    </Button>
                  ) : followStatus === "pending" ? (
                    <Button disabled variant="outline" className="gap-2">
                      <UserPlus className="w-4 h-4" />
                      Pending
                    </Button>
                  ) : (
                    <Button onClick={handleFollow} className="gap-2 bg-primary">
                      <UserPlus className="w-4 h-4" />
                      Follow
                    </Button>
                  )}

                  {canMessage() && (
                    <Button
                      onClick={handleMessage}
                      variant="outline"
                      className="gap-2 border-primary text-primary hover:bg-primary/10"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details Grid */}
          {(isFollowing && followStatus === "accepted") || !userProfile.is_private ? (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
                <h2 className="text-xl font-bold mb-4 text-white">Contact Information</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white">{userProfile.email}</p>
                    </div>
                  </div>
                  {userProfile.phone_number && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-400">Phone</p>
                        <p className="text-white">{userProfile.phone_number}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
                <h2 className="text-xl font-bold mb-4 text-white">Personal Information</h2>
                <div className="space-y-4">
                  {userProfile.date_of_birth && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-400">Date of Birth</p>
                        <p className="text-white">
                          {new Date(userProfile.date_of_birth).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {userProfile.country && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-400">Country</p>
                        <p className="text-white">{userProfile.country}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-12 text-center">
              <Lock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">This Account is Private</h3>
              <p className="text-gray-400">Follow this account to see their details</p>
            </div>
          )}
        </motion.div>
      </div>

      <MobileNav />
    </div>
  );
};

export default UserDetails;
