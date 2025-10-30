import { Home, LogIn, Info, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: LogIn, label: "Login", path: "/signup" },
    { icon: Info, label: "About", path: "/about" },
    { icon: Download, label: "Download", path: "/download" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-4 pb-6">
      <nav className="bg-gray-900/90 backdrop-blur-xl rounded-full border border-gray-800/50 shadow-2xl px-3 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                {/* Active/Hover Background */}
                <motion.div
                  className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all ${
                    isActive ? "bg-primary/20" : ""
                  } group-hover:bg-white/5`}
                >
                  {/* Icon */}
                  <Icon
                    className={`w-6 h-6 transition-colors ${
                      isActive ? "text-primary" : "text-gray-400 group-hover:text-white"
                    }`}
                  />

                  {/* Label - Show on active or hover */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "auto", opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={`text-sm font-semibold whitespace-nowrap overflow-hidden ${
                          isActive ? "text-primary" : "text-white"
                        }`}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MobileNav;
