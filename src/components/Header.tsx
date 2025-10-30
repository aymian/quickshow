import { Search, X, TrendingUp, User, LogOut, Settings, Crown, ChevronDown, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/supabase";

interface HeaderProps {
  onSearch: (query: string) => void;
}

const Header = ({ onSearch }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    if (user) {
      loadUnreadCount();
    }
  }, [user]);

  const loadUnreadCount = async () => {
    const { data } = await authService.getNotifications();
    if (data) {
      const unread = data.filter((n: any) => !n.read).length;
      setUnreadCount(unread);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setIsSearchOpen(false);
    }
  };

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/")} className="flex items-center">
              <span className="text-2xl md:text-3xl font-bold">
                <span className="text-primary">Q</span>
                <span className="text-foreground">uickShow</span>
              </span>
            </button>
          </div>

          {/* Center Navigation with Glass Effect - Hidden on Mobile */}
          <nav className="hidden lg:block glass-nav rounded-full px-8 py-3">
            <div className="flex items-center gap-8">
              <a 
                href="#home" 
                className="text-foreground hover:text-primary transition-smooth font-medium"
              >
                Home
              </a>
              <a 
                href="#movies" 
                className="text-foreground/80 hover:text-foreground transition-smooth font-medium"
              >
                Movies
              </a>
              <a 
                href="#theaters" 
                className="text-foreground/80 hover:text-foreground transition-smooth font-medium"
              >
                Theaters
              </a>
              <a 
                href="#releases" 
                className="text-foreground/80 hover:text-foreground transition-smooth font-medium"
              >
                Releases
              </a>
            </div>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search Icon */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button 
                size="icon" 
                variant="ghost" 
                className="hover:bg-white/10 h-10 w-10 md:h-12 md:w-12 rounded-full"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="w-5 h-5 md:w-6 md:h-6" />
              </Button>
            </motion.div>

            {/* Notification Icon - Only show when logged in */}
            {user && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative"
              >
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="hover:bg-white/10 h-10 w-10 md:h-12 md:w-12 rounded-full"
                  onClick={() => navigate("/notifications")}
                >
                  <Bell className="w-5 h-5 md:w-6 md:h-6" />
                </Button>
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Mobile Profile Button - Show on mobile when logged in */}
            {user && (
              <div className="md:hidden">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="relative"
                >
                  {profile?.profile_picture_url ? (
                    <img
                      src={profile.profile_picture_url}
                      alt={profile.full_name || "Profile"}
                      className="w-10 h-10 rounded-full object-cover border-2 border-primary"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  {profile?.is_premium && (
                    <Crown className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500 bg-gray-900 rounded-full p-0.5" />
                  )}
                </motion.button>
              </div>
            )}
            
            {/* Mobile Sign Up Button - Show when not logged in */}
            {!user && (
              <div className="md:hidden">
                <Button 
                  onClick={() => navigate("/signup")}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white px-4 rounded-full font-semibold text-sm"
                >
                  Sign Up
                </Button>
              </div>
            )}
            
            {/* Profile Dropdown or Sign Up Button - Hidden on Mobile */}
            <div className="hidden md:block">
              {user && profile ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 hover:bg-gray-800 border border-gray-700 transition-all"
                  >
                    {profile.profile_picture_url ? (
                      <img
                        src={profile.profile_picture_url}
                        alt={profile.full_name || "Profile"}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    <ChevronDown className={`w-4 h-4 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
                  </motion.button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-40"
                          onClick={() => setIsProfileOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className="absolute right-0 top-full mt-2 w-72 bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50 hidden md:block"
                        >
                          {/* Profile Header */}
                          <div className="p-4 bg-gradient-to-r from-primary/20 to-purple-600/20 border-b border-gray-800">
                            <div className="flex items-center gap-3">
                              {profile.profile_picture_url ? (
                                <img
                                  src={profile.profile_picture_url}
                                  alt={profile.full_name || "Profile"}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                                  <User className="w-6 h-6" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white truncate">{profile.full_name || "User"}</p>
                                <p className="text-sm text-gray-400 truncate">{profile.email}</p>
                              </div>
                              {profile.is_premium && (
                                <Crown className="w-5 h-5 text-yellow-500" />
                              )}
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="p-2">
                            <button
                              onClick={() => {
                                setIsProfileOpen(false);
                                navigate("/profile");
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors text-left"
                            >
                              <User className="w-5 h-5 text-gray-400" />
                              <span>My Profile</span>
                            </button>
                            <button
                              onClick={() => {
                                setIsProfileOpen(false);
                                navigate("/settings");
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors text-left"
                            >
                              <Settings className="w-5 h-5 text-gray-400" />
                              <span>Settings</span>
                            </button>
                            {!profile.is_premium && (
                              <button
                                onClick={() => {
                                  setIsProfileOpen(false);
                                  navigate("/premium");
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary/20 to-purple-600/20 hover:from-primary/30 hover:to-purple-600/30 transition-colors text-left"
                              >
                                <Crown className="w-5 h-5 text-yellow-500" />
                                <span className="font-semibold">Upgrade to Premium</span>
                              </button>
                            )}
                            <div className="h-px bg-gray-800 my-2" />
                            <button
                              onClick={async () => {
                                setIsProfileOpen(false);
                                await signOut();
                                navigate("/login");
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors text-left"
                            >
                              <LogOut className="w-5 h-5" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={() => navigate("/signup")}
                    className="bg-primary hover:bg-primary/90 text-white px-6 rounded-full font-semibold shadow-lg"
                  >
                    Sign Up
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>

    {/* Mobile Profile Bottom Sheet */}
    <AnimatePresence>
      {isProfileOpen && user && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm md:hidden"
            onClick={() => setIsProfileOpen(false)}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.y > 100 || velocity.y > 500) {
                setIsProfileOpen(false);
              }
            }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 rounded-t-3xl shadow-2xl md:hidden max-h-[80vh] overflow-y-auto"
          >
            {/* Handle Bar */}
            <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1 bg-gray-700 rounded-full" />
            </div>

            {/* Profile Header */}
            <div className="p-6 bg-gradient-to-r from-primary/20 to-purple-600/20 border-b border-gray-800">
              <div className="flex items-center gap-4">
                {profile?.profile_picture_url ? (
                  <img
                    src={profile.profile_picture_url}
                    alt={profile?.full_name || "Profile"}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-8 h-8" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg text-white truncate">{profile?.full_name || user?.email || "User"}</p>
                  <p className="text-sm text-gray-400 truncate">{profile?.email || user?.email}</p>
                </div>
                {profile?.is_premium && (
                  <Crown className="w-6 h-6 text-yellow-500" />
                )}
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-2">
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate("/profile");
                }}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-gray-800 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <span className="text-base font-medium">My Profile</span>
              </button>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate("/settings");
                }}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-gray-800 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <span className="text-base font-medium">Settings</span>
              </button>
              {!profile?.is_premium && (
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate("/premium");
                  }}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-xl bg-gradient-to-r from-primary/20 to-purple-600/20 hover:from-primary/30 hover:to-purple-600/30 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-yellow-500" />
                  </div>
                  <span className="text-base font-semibold">Upgrade to Premium</span>
                </button>
              )}
              <div className="h-px bg-gray-800 my-2" />
              <button
                onClick={async () => {
                  setIsProfileOpen(false);
                  await signOut();
                  navigate("/login");
                }}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-base font-medium">Sign Out</span>
              </button>
            </div>

            {/* Safe Area Bottom Padding */}
            <div className="h-8" />
          </motion.div>
        </>
      )}
    </AnimatePresence>

    {/* Stunning Full-Screen Search Overlay */}
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl"
          onClick={() => setIsSearchOpen(false)}
        >
          <div className="container mx-auto px-4 h-full flex flex-col items-center justify-center">
            {/* Close Button */}
            <motion.button
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-8 right-8 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all group"
            >
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            </motion.button>

            {/* Search Content */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated Title */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8 md:mb-12 px-4"
              >
                <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Discover Movies
                </h2>
                <p className="text-sm md:text-lg text-white/60">Search from thousands of movies and TV shows</p>
              </motion.div>

              {/* Search Bar */}
              <motion.form
                onSubmit={handleSearch}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="relative group"
              >
                {/* Animated Border Glow */}
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                
                <div className="relative flex items-center bg-white/5 backdrop-blur-2xl border-2 border-white/10 rounded-3xl overflow-hidden shadow-2xl mx-4 md:mx-0">
                  <Search className="w-5 h-5 md:w-8 md:h-8 text-primary ml-4 md:ml-8 flex-shrink-0" />
                  
                  <Input
                    type="text"
                    placeholder="Search movies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-0 text-base md:text-2xl px-3 md:px-6 py-4 md:py-8 text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                    autoFocus
                  />
                  
                  {searchQuery && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="mr-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="mr-2 md:mr-3 px-4 md:px-8 py-3 md:py-4 bg-gradient-to-r from-primary to-purple-600 rounded-xl md:rounded-2xl font-bold text-sm md:text-lg shadow-lg hover:shadow-primary/50 transition-all"
                  >
                    Search
                  </motion.button>
                </div>
              </motion.form>

              {/* Quick Suggestions */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 flex flex-wrap gap-3 justify-center"
              >
                <span className="text-white/60 text-sm">Popular searches:</span>
                {['Action', 'Comedy', 'Thriller', 'Sci-Fi', 'Romance'].map((genre, i) => (
                  <motion.button
                    key={genre}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSearchQuery(genre);
                      handleSearch(new Event('submit') as any);
                    }}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-sm font-medium transition-all"
                  >
                    {genre}
                  </motion.button>
                ))}
              </motion.div>

              {/* Trending Searches */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-primary/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                        <TrendingUp className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-white/60">Trending #{i}</p>
                        <p className="font-semibold">Popular Movie</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

export default Header;
