import { Home, UserPen, UserRoundPlus, Bookmark, Users, Settings } from "lucide-react";
import { useState } from "react";

const menuItems = [
  { id: "home", icon: Home, label: "Home" },
  { id: "profile", icon: UserPen, label: "Profile" },
  { id: "friends", icon: UserRoundPlus, label: "Friends" },
  { id: "favourites", icon: Bookmark, label: "Favourites" },
  { id: "groups", icon: Users, label: "Groups" },
];

export default function Sidebar() {
  const [active, setActive] = useState("home");

  return (
    <aside
  className="fixed top-16 bottom-0 left-0 w-60
             bg-black/40 backdrop-blur-xl border-r border-yellow-500/20
             flex flex-col justify-between py-6 px-4 rounded-tr-2xl rounded-br-2xl shadow-lg"
>
      {/* Menu chính: giãn đều các item */}
      <div className="flex flex-col justify-evenly h-full">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
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

      {/* Settings giữ nguyên dưới */}
      <div>
        <button
          onClick={() => setActive("settings")}
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
