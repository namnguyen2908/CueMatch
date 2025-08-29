// src/components/Chat/ChatBox.jsx
import React, { useState } from "react";
import { X, Minus } from "lucide-react";
import clsx from "clsx";

const ChatBox = ({ user, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [minimized, setMinimized] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { text: input, fromSelf: true }]);
    setInput("");
  };

  return (
    <div className="fixed bottom-0 right-2 h-100 w-80 bg-[#1e1f22] text-white rounded-t-lg shadow-lg border border-gray-700 flex flex-col overflow-hidden z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#2a2a2d] border-b border-gray-600">
        <div className="flex items-center gap-2">
          <img
            src={user.avatar || "/default-avatar.png"}
            alt={user.name}
            className="w-8 h-8 rounded-full"
          />
          <div className="text-sm font-semibold">{user.name}</div>
          <span className="w-2 h-2 bg-green-500 rounded-full ml-1" />
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setMinimized(!minimized)} className="hover:text-yellow-400">
            <Minus size={18} />
          </button>
          <button onClick={onClose} className="hover:text-red-400">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Nội dung chat */}
      {!minimized && (
        <>
          <div className="p-3 space-y-2 overflow-y-auto h-[22rem] flex flex-col">
            {messages.length === 0 ? (
              <div className="text-gray-400 text-sm italic text-center pt-10">
                Chưa có tin nhắn nào
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={clsx(
                    "px-3 py-2 rounded-2xl max-w-[80%] text-sm",
                    msg.fromSelf
                      ? "bg-blue-500 text-white self-end ml-auto"
                      : "bg-gray-700 text-gray-100"
                  )}
                >
                  {msg.text}
                </div>
              ))
            )}
          </div>

          {/* Nhập tin nhắn */}
          <div className="flex items-center p-2 border-t border-gray-700">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Aa"
              className="flex-1 bg-[#2a2a2d] text-sm text-white px-3 py-2 rounded-full focus:outline-none"
            />
            <button
              onClick={sendMessage}
              className="ml-2 p-2 bg-blue-500 hover:bg-blue-600 rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBox;