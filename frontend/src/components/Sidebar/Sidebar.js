import {
  Home,
  UserPen,
  UserRoundPlus,
  Bookmark,
  Users,
  MessageCircle, CalendarDays 
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const menuItems = [
  { id: "homefeed", icon: Home, label: "Home" },
  { id: "profile", icon: UserPen, label: "Profile" },
  { id: "messages", icon: MessageCircle, label: "Messages" },
  { id: "friends", icon: UserRoundPlus, label: "Friends" },
  {
    id: "matching",
    icon: () => <i className="fa-solid fa-users w-5 h-5" />,
    label: "Matching"
  },
  { id: "favourites", icon: Bookmark, label: "Favourites" },
  { id: "groups", icon: Users, label: "Groups" },
  { id: "calendar", icon: CalendarDays, label: "Calendar" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const pathToIdMap = {
    "/": "homefeed",
    "/profile": "profile",
    "/messages": "messages",
    "/friends": "friends",
    "/matching": "matching",
    "/favourites": "favourites",
    "/groups": "groups",
    "/calendar": "calendar"
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
  } else {
    setActive(pathToIdMap[location.pathname] || "homefeed");
  }
}, [location.pathname]);

  const handleClick = (id) => {
    setActive(id);
    navigate(`/${id === "homefeed" ? "homefeed" : id}`);
  };

  return (
    <aside
      className="fixed top-[5.7rem] bottom-0 left-0 w-60
        bg-[#F2F4F7] dark:bg-[#242424] 
        
        flex flex-col justify-between py-2 px-4
        text-orange-800 dark:text-orange-200 transition-colors duration-300"
    >
      <div className="flex flex-col justify-evenly h-full">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-all relative
              hover:bg-orange-100 dark:hover:bg-orange-500/10 
              hover:text-[#FFB828] dark:hover:text-[#FFB828]
              ${active === item.id
  ? "bg-orange-100 dark:bg-orange-600/10 text-[#FFB828] dark:text-[#FFB828] font-semibold shadow-inner"
  : "text-black dark:text-[#FFDF9E]"
}`}
          >
            {active === item.id && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-500 rounded-r-md shadow-md" />
            )}
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
