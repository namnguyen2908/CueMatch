// src/pages/Friends/FriendsLayout.jsx
import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import friendApi from "../../api/friendApi";

const FriendLayout = () => {
    const [receivedRequestsCount, setReceivedRequestsCount] = useState(0);
    const [sentRequestsCount, setSentRequestsCount] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const fetchCounts = async () => {
        try {
            // Fetch received requests count
            const receivedRes = await friendApi.getReceivedRequests();
            setReceivedRequestsCount(receivedRes.data?.length || 0);

            // Fetch sent requests count
            const sentRes = await friendApi.getSentRequests();
            setSentRequestsCount(sentRes.data?.length || 0);
        } catch (error) {
            console.error('Error fetching friend request counts:', error);
        }
    };

    useEffect(() => {
        fetchCounts();
        
        // Refresh counts when window gains focus (user might have accepted/rejected in another tab)
        const handleFocus = () => {
            fetchCounts();
        };
        
        window.addEventListener('focus', handleFocus);
        
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    // Refresh counts when navigating between tabs (user might have accepted/rejected requests)
    useEffect(() => {
        fetchCounts();
    }, [location.pathname]);

    return (
        <div className="relative min-h-screen overflow-hidden
            bg-gradient-to-br from-sport-50/30 via-white to-sport-100/20
            dark:from-luxury-950 dark:via-luxury-900 dark:to-luxury-800
            text-luxury-900 dark:text-luxury-100
            transition-colors duration-300
            pattern-sport dark:pattern-luxury">
            <div className="fixed inset-0 bg-mesh-light dark:bg-mesh-dark pointer-events-none opacity-50"></div>
            <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
            <Sidebar
                variant="overlay"
                isMobileOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="pt-24 md:pt-28 relative z-10 flex flex-col lg:flex-row min-h-screen">
                <div className="hidden lg:block w-[250px] flex-shrink-0">
                    <Sidebar />
                </div>

                <div className="flex-1 w-full px-4 sm:px-6 lg:px-10 pb-12">
                    {/* Navigation Tabs */}
                    <div className="relative mb-8">
                        <div className="relative p-[1px] rounded-[28px] bg-gradient-to-r from-sport-400/60 via-amber-300/50 to-pink-400/60 shadow-sport">
                            <div className="overflow-x-auto rounded-[26px] bg-white/90 dark:bg-luxury-900/70 backdrop-blur-xl">
                                <div className="flex gap-2 p-2 min-w-max">
                            {[
                                { to: "all-friends", label: "All Friends"},
                                { to: "friend-requests", label: "Requests"},
                                { to: "suggestions", label: "Suggestions"},
                                { to: "request-sent", label: "Sent"},
                            ].map(({ to, label, icon }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    className={({ isActive }) =>
                                        `relative flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                                            isActive
                                                ? "bg-gradient-to-r from-red-500 to-amber-500 text-white shadow-lg shadow-amber-500/25"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-black dark:hover:text-white"
                                        }`
                                    }
                                >
                                    <span className="text-sm font-semibold tracking-wide">{label}</span>

                                    {to === "friend-requests" && receivedRequestsCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold text-white px-1.5 shadow-lg shadow-red-500/40">
                                            {receivedRequestsCount > 99 ? '99+' : receivedRequestsCount}
                                        </span>
                                    )}
                                    {to === "request-sent" && sentRequestsCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-amber-500 rounded-full text-[10px] flex items-center justify-center font-bold text-white px-1.5 shadow-lg shadow-amber-500/40">
                                            {sentRequestsCount > 99 ? '99+' : sentRequestsCount}
                                        </span>
                                    )}
                                </NavLink>
                            ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-purple-100/20 dark:from-blue-500/5 dark:to-purple-500/5 rounded-3xl blur-3xl" />
                        <div className="relative bg-white dark:bg-white/5 dark:backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-2xl p-4 sm:p-6 lg:p-8">
                            <Outlet />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FriendLayout;