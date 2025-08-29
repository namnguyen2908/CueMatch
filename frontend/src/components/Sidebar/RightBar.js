import React from "react";

const dummyFriends = [
  { id: 1, name: "Alice", avatar: "https://i.pravatar.cc/40?img=1" },
  { id: 2, name: "Bob", avatar: "https://i.pravatar.cc/40?img=2" },
  { id: 3, name: "Charlie", avatar: "https://i.pravatar.cc/40?img=3" },
];

const RightBar = ({ onFriendClick }) => {
  return (
    <aside className="fixed top-16 bottom-0 right-0 w-60
                      bg-black/40 backdrop-blur-xl border-l border-yellow-500/20
                      flex flex-col justify-between py-2 px-4 rounded-tl-2xl rounded-bl-2xl shadow-lg z-20">
      <div className="flex flex-col justify-start h-full">
        <h3 className="text-yellow-400 text-sm font-semibold mb-3 ml-1">Online Friends</h3>
        <div className="space-y-2 overflow-y-auto pr-1">
          {dummyFriends.map((friend) => (
            <button
              key={friend.id}
              onClick={() => onFriendClick(friend)}
              className="flex items-center gap-3 w-full hover:bg-yellow-500/10 p-2 rounded-lg transition"
            >
              <img
                src={friend.avatar}
                alt={friend.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm text-white">{friend.name}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default RightBar;
