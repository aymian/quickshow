import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, X, Bell, ArrowLeft, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/supabase";
import { toast } from "sonner";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    const { data, error } = await authService.getNotifications();
    if (!error && data) {
      setNotifications(data);
    }
    setLoading(false);
  };

  const handleAcceptFollow = async (notificationId: string, followerId: string) => {
    const { error } = await authService.acceptFollowRequest(followerId);
    if (error) {
      toast.error("Failed to accept follow request");
      return;
    }

    await authService.markNotificationRead(notificationId);
    toast.success("Follow request accepted!");
    loadNotifications();
  };

  const handleRejectFollow = async (notificationId: string, followerId: string) => {
    const { error } = await authService.unfollowUser(followerId);
    if (error) {
      toast.error("Failed to reject follow request");
      return;
    }

    await authService.markNotificationRead(notificationId);
    toast.success("Follow request rejected");
    loadNotifications();
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await authService.markNotificationRead(notificationId);
    loadNotifications();
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Header onSearch={() => {}} />

      <div className="container mx-auto px-4 pt-24 pb-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Notifications</h1>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-12 text-center">
              <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification: any) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`bg-gray-900/50 backdrop-blur-xl rounded-2xl border ${
                    notification.read ? "border-gray-800" : "border-primary/50"
                  } p-4 transition-all hover:border-primary/70`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      {notification.type === "follow_request" ? (
                        <User className="w-6 h-6 text-primary" />
                      ) : notification.type === "follow_accepted" ? (
                        <Check className="w-6 h-6 text-green-500" />
                      ) : (
                        <Bell className="w-6 h-6 text-primary" />
                      )}
                    </div>

                    <div className="flex-1">
                      {/* Clickable notification content for follow requests */}
                      {notification.type === "follow_request" && notification.data?.follower_id ? (
                        <button
                          onClick={() => navigate(`/user/${notification.data.follower_id}`)}
                          className="text-left w-full hover:opacity-80 transition-opacity"
                        >
                          <h3 className="font-bold mb-1 hover:text-primary transition-colors">
                            {notification.title}
                          </h3>
                          <p className="text-gray-400 text-sm mb-2">{notification.message}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                          <p className="text-xs text-primary mt-1">Click to view profile</p>
                        </button>
                      ) : (
                        <>
                          <h3 className="font-bold mb-1">{notification.title}</h3>
                          <p className="text-gray-400 text-sm mb-2">{notification.message}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </>
                      )}

                      {/* Follow Request Actions */}
                      {notification.type === "follow_request" && !notification.read && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleAcceptFollow(
                                notification.id,
                                notification.data?.follower_id
                              )
                            }
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleRejectFollow(
                                notification.id,
                                notification.data?.follower_id
                              )
                            }
                            className="border-red-600 text-red-600 hover:bg-red-600/10"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}

                      {/* Mark as Read */}
                      {!notification.read && notification.type !== "follow_request" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="mt-2"
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>

                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <MobileNav />
    </div>
  );
};

export default Notifications;
