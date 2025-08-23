import React from "react";

const friends = [
  { id: 1, name: "John Doe", avatar: "/avatars/user1.jpg" },
  { id: 2, name: "Jane Smith", avatar: "/avatars/user2.jpg" },
  { id: 3, name: "Alex", avatar: "/avatars/user3.jpg" },
  // Add more mock data or fetch from API
];

const RightBar = ({ onFriendClick }) => {
    return (
        <aside className="fixed top-16 bottom-0 right-0 w-60
             bg-black/40 backdrop-blur-xl border-l border-yellow-500/20
             flex flex-col py-2 px-4 rounded-tl-2xl rounded-bl-2xl shadow-lg z-30">
            <h2 className="text-yellow-300 font-semibold mb-4">Friends</h2>
            <div className="space-y-3 overflow-y-auto">
                {friends.map((friend) => (
                    <button
                        key={friend.id}
                        onClick={() => onFriendClick(friend)}
                        className="flex items-center space-x-3 hover:bg-yellow-500/10 px-2 py-1 rounded-md"
                    >
                        <img
                            src={friend.avatar}
                            alt={friend.name}
                            className="w-8 h-8 rounded-full border border-yellow-400"
                        />
                        <span className="text-gray-200">{friend.name}</span>
                    </button>
                ))}
            </div>
        </aside>
    );
}

export default RightBar;