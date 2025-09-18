// src/pages/Friends/FriendsLayout.jsx
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";

const MatchingLayout = () => {
    return (
        <div className="flex min-h-screen bg-[#F2F4F7] text-gray-900 dark:bg-[#242424] dark:via-slate-800  dark:text-white transition-colors duration-300">
            <Sidebar />
            <div className="flex-1 ml-60">
                <Header />

                <div className="pt-28 px-10">
                    {/* Navigation Tabs */}
                    <div className="relative mb-8">
                        <div className="flex gap-2 p-2 bg-gray-100 dark:bg-white/5 dark:backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-2xl">
                            {[
                                { to: "challenge", label: "Challenge"},
                                { to: "match-hub", label: "Match Hub"},
                                { to: "history-hub", label: "History Hub"},
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
                                    <span className="text-lg">{icon}</span>
                                    <span className="font-semibold">{label}</span>

                                    {(to === "friend-requests" || to === "request-sent") && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold animate-pulse text-white">
                                            3
                                        </span>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-purple-100/20 dark:from-blue-500/5 dark:to-purple-500/5 rounded-3xl blur-3xl" />
                        <div className="relative bg-white dark:bg-white/5 dark:backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-2xl p-8">
                            <Outlet />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchingLayout;