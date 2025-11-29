import {
  Home,
  UserPen,
  UserRoundPlus,
  Bookmark,
  Users,
  MessageCircle,
  CalendarDays,
  Zap,
  LayoutDashboard, // thêm icon cho Club Dashboard
  MapPin,
  X,
  Receipt, // icon cho Transactions
  Wallet, // icon cho Withdrawal
  Calendar, // icon cho My Bookings
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../contexts/UserContext"; // 👉 import useUser

export default function Sidebar({
  variant = "inline",
  isMobileOpen = false,
  onClose = () => {},
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { datauser } = useUser(); // 👉 lấy user hiện tại
  const isOverlay = variant === "overlay";

  // Debug: Log datauser để kiểm tra
  useEffect(() => {
    if (datauser) {
      console.log('🔍 Sidebar: datauser loaded:', datauser);
      console.log('🔍 Sidebar: role =', datauser.role || datauser.Role);
    } else {
      console.log('⚠️ Sidebar: datauser is null/undefined');
    }
  }, [datauser]);

  // menu mặc định
  const baseMenuItems = [
    { id: "homefeed", icon: Home, label: "Home" },
    { id: "profile", icon: UserPen, label: "Profile" },
    { id: "messages", icon: MessageCircle, label: "Messages" },
    { id: "friends", icon: UserRoundPlus, label: "Friends" },
    {
      id: "matching",
      icon: () => <i className="fa-solid fa-users w-5 h-5" />,
      label: "Matching",
    },
    { id: "favourites", icon: Bookmark, label: "Favourites" },
    { id: "calendar", icon: CalendarDays, label: "Calendar" },
    { id: "transactions", icon: Receipt, label: "Transactions" },
    { id: "withdrawal", icon: Wallet, label: "Withdrawal" },
    { id: "my-bookings", icon: Calendar, label: "My Bookings" },
    { id: "pricing", icon: Zap, label: "Upgrade" },
  ];

  const userMenuItem = {
    id: "billiards-club",
    icon: MapPin,
    label: "Reserve a table",
  };

  const partnerMenuItem = {
    id: "club-dashboard",
    icon: LayoutDashboard,
    label: "Club Dashboard",
  };

  // tùy role sẽ thêm menu tương ứng
  // Kiểm tra cả role và Role (case-insensitive) để đảm bảo tương thích
  const userRole = datauser?.role || datauser?.Role;
  
  // Debug log để kiểm tra
  useEffect(() => {
    console.log('🔍 Sidebar: datauser =', datauser);
    console.log('🔍 Sidebar: userRole =', userRole);
    console.log('🔍 Sidebar: Will show billiards-club menu?', userRole === "user");
  }, [datauser, userRole]);
  
  const menuItems =
    userRole === "partner"
      ? [...baseMenuItems, partnerMenuItem]
      : userRole === "user"
      ? [...baseMenuItems, userMenuItem]
      : baseMenuItems;

  const pathToIdMap = {
    "/": "homefeed",
    "/profile": "profile",
    "/messages": "messages",
    "/friends": "friends",
    "/matching": "matching",
    "/favourites": "favourites",
    "/calendar": "calendar",
    "/transactions": "transactions",
    "/withdrawal": "withdrawal",
    "/my-bookings": "my-bookings",
    "/pricing": "pricing",
    "/club-dashboard": "club-dashboard", // thêm map cho route mới
    "/billiards-club": "billiards-club",
  };

  const initialActive = location.pathname.startsWith("/friends")
    ? "friends"
    : pathToIdMap[location.pathname] || "homefeed";

  const [active, setActive] = useState(initialActive);

  useEffect(() => {
    if (location.pathname.startsWith("/friends")) {
      setActive("friends");
    } else if (location.pathname.startsWith("/matching")) {
      setActive("matching");
    } else if (location.pathname.startsWith("/club-dashboard")) {
      setActive("club-dashboard");
    } else if (location.pathname.startsWith("/billiards-club")) {
      setActive("billiards-club");
    } else if (location.pathname.startsWith("/transactions")) {
      setActive("transactions");
    } else if (location.pathname.startsWith("/withdrawal")) {
      setActive("withdrawal");
    } else if (location.pathname.startsWith("/my-bookings")) {
      setActive("my-bookings");
    } else {
      setActive(pathToIdMap[location.pathname] || "homefeed");
    }
  }, [location.pathname]);

  const handleClick = (id) => {
    setActive(id);
    navigate(`/${id === "homefeed" ? "homefeed" : id}`);
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {isOverlay && (
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity duration-300 lg:hidden ${
            isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-[4.5rem] bottom-0 left-0 w-[250px]
        bg-white/90 dark:bg-luxury-800/90
        backdrop-blur-xl
        border-r border-sport-200/30 dark:border-sport-800/30
        flex flex-col py-6 px-4
        transition-colors duration-300 overflow-y-auto
        shadow-luxury z-40
        ${isOverlay ? "transform transition-transform duration-300 lg:hidden" : ""}
        ${isOverlay ? (isMobileOpen ? "translate-x-0" : "-translate-x-full") : ""}`}
      >
        {isOverlay && (
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-luxury-800 dark:text-luxury-200">Menu</span>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-luxury-100 dark:bg-luxury-800 text-luxury-600 dark:text-luxury-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex flex-col gap-2 h-full">
        {menuItems.map((item, index) => {
          const isActive = active === item.id;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ x: 4, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleClick(item.id)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all relative group
                ${
                  isActive
                    ? "bg-gradient-to-r from-sport-50 to-sport-100/50 dark:from-sport-900/30 dark:to-sport-800/20 text-sport-600 dark:text-sport-400 font-semibold shadow-sport border border-sport-200/50 dark:border-sport-800/50"
                    : "text-luxury-700 dark:text-luxury-300 hover:bg-luxury-50/50 dark:hover:bg-luxury-800/30 border border-transparent hover:border-sport-200/30 dark:hover:border-sport-800/30"
                }`}
            >

              <div className={`relative transition-all ${isActive ? "text-sport-600 dark:text-sport-400 scale-110" : "text-luxury-600 dark:text-luxury-400 group-hover:text-sport-500 dark:group-hover:text-sport-400 group-hover:scale-110"} transition-colors`}>
                {typeof item.icon === 'function' ? (
                  <item.icon />
                ) : (
                  <item.icon className="w-5 h-5" />
                )}
              </div>
              <span className={`text-sm font-medium ${isActive ? "text-sport-700 dark:text-sport-300" : "group-hover:text-luxury-900 dark:group-hover:text-luxury-100"} transition-colors`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-sport-400/10 to-transparent rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          );
        })}
        </div>
      </aside>
    </>
  );
}
