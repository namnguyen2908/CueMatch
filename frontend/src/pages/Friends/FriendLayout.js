// src/pages/Friends/FriendsLayout.jsx
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";

const FriendLayout = () => {
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-700 to-slate-900 text-white">
            <Sidebar />
            <div className="flex-1 ml-60">
                <Header />

                <div className="pt-28 px-10">
                    {/* Hero Section */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-lime-600 bg-clip-text text-transparent mb-2">
                            Friends Hub
                        </h1>
                        <p className="text-gray-400 text-lg">Connect, discover, and manage your friendships</p>
                    </div>

                    {/* Modern Navigation Tabs */}
                    <div className="relative mb-8">
                        <div className="flex gap-2 p-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
                            {[
                                { to: "all-friends", label: "All Friends", icon: "👥" },
                                { to: "friend-requests", label: "Requests", icon: "📩" },
                                { to: "suggestions", label: "Suggestions", icon: "✨" },
                                { to: "request-sent", label: "Sent", icon: "📤" },
                            ].map(({ to, label, icon }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    className={({ isActive }) =>
                                        `relative flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                                            isActive
                                                ? "bg-gradient-to-r from-red-500 to-amber-500 text-white shadow-lg shadow-amber-500/25"
                                                : "text-gray-300 hover:bg-white/10 hover:text-white"
                                        }`
                                    }
                                >
                                    <span className="text-lg">{icon}</span>
                                    <span className="font-semibold">{label}</span>
                                    
                                    {/* Notification badge for requests */}
                                    {(to === "friend-requests" || to === "request-sent") && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold animate-pulse">
                                            3
                                        </span>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl blur-3xl" />
                        <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
                            <Outlet />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FriendLayout;