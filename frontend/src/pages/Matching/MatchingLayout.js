import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";

const tabItems = [
    { to: "challenge", label: "Challenge" },
    { to: "match-hub", label: "Match Hub" },
    { to: "history-hub", label: "History Hub" },
];

const MatchingLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

                <div className="flex-1 w-full px-4 sm:px-6 lg:px-10 pb-12 space-y-8">
                    <div className="relative">
                        <div className="relative p-[1px] rounded-[28px] bg-gradient-to-r from-sport-400/60 via-amber-300/50 to-pink-400/60 shadow-sport">
                            <div className="overflow-x-auto rounded-[26px] bg-white/90 dark:bg-luxury-900/70 backdrop-blur-xl">
                                <div className="flex gap-2 p-2 min-w-max">
                                    {tabItems.map(({ to, label }) => (
                                        <NavLink
                                            key={to}
                                            to={to}
                                            className={({ isActive }) =>
                                                `relative flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                                                    isActive
                                                        ? "bg-gradient-to-r from-sport-500 via-amber-400 to-pink-500 text-white shadow-lg shadow-sport-500/40"
                                                        : "text-luxury-700 dark:text-luxury-300 hover:bg-luxury-100/70 dark:hover:bg-luxury-800/40 hover:text-luxury-900 dark:hover:text-white"
                                                }`
                                            }
                                        >
                                            <span className="text-sm tracking-wide uppercase">{label}</span>
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-purple-100/20 dark:from-blue-500/5 dark:to-purple-500/5 rounded-3xl blur-3xl" />
                        <div className="relative bg-white dark:bg-white/5 dark:backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-2xl p-4 sm:p-6 lg:p-8 min-h-[50vh]">
                            <Outlet />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchingLayout;