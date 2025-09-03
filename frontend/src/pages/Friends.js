// src/pages/Friends.jsx
import React, { useState } from "react";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";

const dummyUsers = [
  {
    id: 1,
    name: "Alice Nguyen",
    avatar: "https://i.pravatar.cc/150?img=1",
    mutualFriends: 8,
    status: "friend", // or "request", "suggestion"
  },
  {
    id: 2,
    name: "Bob Tran",
    avatar: "https://i.pravatar.cc/150?img=2",
    mutualFriends: 2,
    status: "request",
  },
  {
    id: 3,
    name: "Charlie Le",
    avatar: "https://i.pravatar.cc/150?img=3",
    mutualFriends: 0,
    status: "suggestion",
  },
  {
    id: 4,
    name: "David Pham",
    avatar: "https://i.pravatar.cc/150?img=4",
    mutualFriends: 5,
    status: "friend",
  },
  {
    id: 5,
    name: "Emma Vo",
    avatar: "https://i.pravatar.cc/150?img=5",
    mutualFriends: 1,
    status: "request",
  },
  {
    id: 6,
    name: "Alice Nguyen",
    avatar: "https://i.pravatar.cc/150?img=1",
    mutualFriends: 8,
    status: "friend", // or "request", "suggestion"
  },
  {
    id: 7,
    name: "Bob Tran",
    avatar: "https://i.pravatar.cc/150?img=2",
    mutualFriends: 2,
    status: "request",
  },
  {
    id: 8,
    name: "Charlie Le",
    avatar: "https://i.pravatar.cc/150?img=3",
    mutualFriends: 0,
    status: "suggestion",
  },
  {
    id: 9,
    name: "David Pham",
    avatar: "https://i.pravatar.cc/150?img=4",
    mutualFriends: 5,
    status: "friend",
  },
  {
    id: 10,
    name: "Emma Vo",
    avatar: "https://i.pravatar.cc/150?img=5",
    mutualFriends: 1,
    status: "request",
  },
  {
    id: 11,
    name: "Alice Nguyen",
    avatar: "https://i.pravatar.cc/150?img=1",
    mutualFriends: 8,
    status: "friend", // or "request", "suggestion"
  },
  {
    id: 12,
    name: "Bob Tran",
    avatar: "https://i.pravatar.cc/150?img=2",
    mutualFriends: 2,
    status: "request",
  },
  {
    id: 13,
    name: "Charlie Le",
    avatar: "https://i.pravatar.cc/150?img=3",
    mutualFriends: 0,
    status: "suggestion",
  },
  {
    id: 14,
    name: "David Pham",
    avatar: "https://i.pravatar.cc/150?img=4",
    mutualFriends: 5,
    status: "friend",
  },
  {
    id: 15,
    name: "Emma Vo",
    avatar: "https://i.pravatar.cc/150?img=5",
    mutualFriends: 1,
    status: "request",
  },
];

const Friends = () => {
  const [activeTab, setActiveTab] = useState("all");

  const filteredUsers = dummyUsers.filter((user) => {
    if (activeTab === "all") return user.status === "friend";
    if (activeTab === "requests") return user.status === "request";
    if (activeTab === "suggestions") return user.status === "suggestion";
    return false;
  });

  return (
    <div className="flex min-h-screen bg-[#0e0e0e] text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 ml-60">
        {/* Header */}
        <Header />

        <div className="pt-28 px-10">
          <h2 className="text-3xl font-bold text-yellow-400 mb-6">
            Friends
          </h2>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all 
              ${activeTab === "all"
                  ? "bg-yellow-400 text-black shadow"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
            >
              All Friends
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all 
              ${activeTab === "requests"
                  ? "bg-yellow-400 text-black shadow"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
            >
              Friend Requests
            </button>
            <button
              onClick={() => setActiveTab("suggestions")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all 
              ${activeTab === "suggestions"
                  ? "bg-yellow-400 text-black shadow"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
            >
              Suggestions
            </button>
          </div>

          {/* Friend Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-10">
            {filteredUsers.length === 0 ? (
              <p className="text-gray-400 col-span-full">No users found.</p>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-[#1a1a1a] w-52 border border-yellow-500/20 rounded-xl p-4 shadow hover:shadow-yellow-400/10 transition-shadow flex flex-col items-center text-center"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-yellow-400 mb-3"
                  />
                  <h4 className="text-lg font-semibold text-yellow-200 mb-1">
                    {user.name}
                  </h4>
                  {user.mutualFriends > 0 && (
                    <p className="text-sm text-gray-400 mb-3">
                      {user.mutualFriends} mutual friend
                      {user.mutualFriends > 1 && "s"}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto">
                    {user.status === "friend" && (
                      <>
                        <button className="px-3 py-1 text-sm text-black bg-yellow-400 rounded hover:bg-yellow-300">
                          Message
                        </button>
                        <button className="px-3 py-1 text-sm text-red-400 border border-red-400 rounded hover:bg-red-500/20">
                          Unfriend
                        </button>
                      </>
                    )}
                    {user.status === "request" && (
                      <>
                        <button className="px-3 py-1 text-sm text-black bg-yellow-400 rounded hover:bg-yellow-300">
                          Confirm
                        </button>
                        <button className="px-3 py-1 text-sm text-red-400 border border-red-400 rounded hover:bg-red-500/20">
                          Delete
                        </button>
                      </>
                    )}
                    {user.status === "suggestion" && (
                      <>
                        <button className="px-3 py-1 text-sm text-black bg-yellow-400 rounded hover:bg-yellow-300">
                          Add Friend
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Friends;