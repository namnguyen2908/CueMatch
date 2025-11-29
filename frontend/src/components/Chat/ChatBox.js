// src/components/Chat/ChatBox.jsx
import React, { useState, useRef, useEffect } from "react";
import { X, Minus } from "lucide-react";
import { useChat } from '../../contexts/ChatContext';
import { useOnlineStatus } from '../../contexts/StatusContext';
import { sendMessage as apiSendMessage } from '../../api/messageApi';
import { useNavigate } from 'react-router-dom';

const ChatBox = ({ user, onClose, index, conversationId }) => {
  const navigate = useNavigate();
  const [minimized, setMinimized] = useState(false);
  const { addLocalMessage, messagesMap } = useChat();
  const messages = messagesMap[conversationId] || [];
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const boxWidth = 320;
  const spacing = 10;
  const rightOffset = index * (boxWidth + spacing);
  const { onlineUsers } = useOnlineStatus();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const formData = new FormData();
    formData.append('ConversationId', conversationId);
    formData.append('Text', input);

    try {
      const res = await apiSendMessage(formData);
      setInput('');
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  return (
    <div
      className="fixed bottom-4 w-80 text-gray-900 dark:text-gray-50 rounded-2xl border border-gray-200/70 dark:border-gray-700/70 bg-white/90 dark:bg-gray-900/80 backdrop-blur-lg flex flex-col overflow-hidden z-50"
      style={{ right: `${rightOffset}px` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200/80 dark:border-gray-700">
        <div className="flex items-center gap-2 relative">
          <div className="relative">
            <img
              src={user.Avatar}
              alt={user.Name}
              className="w-9 h-9 rounded-full cursor-pointer border border-gray-200 dark:border-gray-700"
              onClick={() => navigate(`/profile/${user._id}`)}
            />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 
    border-[#e5e5e5] dark:border-[#2a2a2d] 
    ${onlineUsers.has(user._id) ? "bg-green-400" : "bg-gray-400"}
  `}
            />
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">{user.Name}</div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400">
              {onlineUsers.has(user._id) ? "Active now" : "Offline"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <button
            onClick={() => setMinimized(!minimized)}
            className="hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-full transition-colors"
          >
            <Minus size={18} />
          </button>
          <button
            onClick={onClose}
            className="hover:text-red-500 dark:hover:text-red-400 p-1 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Chat content */}
      {!minimized && (
        <>
          <div className="px-4 py-3 space-y-3 overflow-y-auto h-[22rem] flex flex-col scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {messages.length === 0 ? (
              <div className="text-gray-400 dark:text-gray-500 text-sm italic text-center pt-10">
                No messages yet
              </div>
            ) : (
              messages.map((msg) => {
                const isSelf = msg.fromSelf;
                return (
                  <div
                    key={msg._id}
                    className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`px-4 py-2 rounded-2xl text-sm max-w-[80%] break-words ${
                        isSelf
                          ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50 border border-gray-200/60 dark:border-gray-700/60'
                      }`}
                    >
                      {msg.Text}
                    </div>
                  </div>
                );
              })
            )}
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-200/80 dark:border-gray-700">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Aa"
              className="flex-1 bg-gray-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400/40"
            />
            <button
              onClick={sendMessage}
              className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-colors"
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