import { Home, UserPen, UserRoundPlus, Bookmark, Users, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const menuItems = [
  { id: "home", icon: Home, label: "Home" },
  { id: "profile", icon: UserPen, label: "Profile" },
  { id: "friends", icon: UserRoundPlus, label: "Friends" },
  { id: "favourites", icon: Bookmark, label: "Favourites" },
  { id: "groups", icon: Users, label: "Groups" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Ánh xạ đường dẫn sang id
  const pathToIdMap = {
    "/": "home",
    "/profile": "profile",
    "/friends": "friends",
    "/favourites": "favourites",
    "/groups": "groups",
    "/settings": "settings",
  };

  // ✅ Lấy id từ đường dẫn hiện tại
  const [active, setActive] = useState(pathToIdMap[location.pathname] || "home");

  // ✅ Đồng bộ active khi URL thay đổi
  useEffect(() => {
    setActive(pathToIdMap[location.pathname] || "home");
  }, [location.pathname]);

  const handleClick = (id) => {
    setActive(id);

    // Điều hướng dựa trên id
    if (id === "home") navigate("/homefeed");
    else if (id === "profile") navigate("/profile");
    else if (id === "friends") navigate("/friends");
    else if (id === "favourites") navigate("/favourites");
    else if (id === "groups") navigate("/groups");
    else if (id === "settings") navigate("/settings");
  };

  return (
    <aside className="fixed top-16 bottom-0 left-0 w-60
             bg-black/40 backdrop-blur-xl border-r border-yellow-500/20
             flex flex-col justify-between py-2 px-4 rounded-tr-2xl rounded-br-2xl shadow-lg">
      <div className="flex flex-col justify-evenly h-full">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-all relative
                       hover:bg-yellow-500/10 hover:text-yellow-400
                       ${active === item.id ? "text-yellow-400 font-semibold" : "text-gray-300"}`}
          >
            {active === item.id && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-yellow-400 rounded-r-lg shadow-yellow-400/50 shadow-md" />
            )}
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Settings riêng phía dưới */}
      <div>
        <button
          onClick={() => handleClick("settings")}
          className={`flex items-center space-x-3 p-3 rounded-lg transition-all relative
                     hover:bg-yellow-500/10 hover:text-yellow-400
                     ${active === "settings" ? "text-yellow-400 font-semibold" : "text-gray-300"}`}
        >
          {active === "settings" && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-yellow-400 rounded-r-lg shadow-yellow-400/50 shadow-md" />
          )}
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}