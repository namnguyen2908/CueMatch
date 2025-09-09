// src/components/Chat/ChatBox.jsx
import React, { useState, useRef, useEffect } from "react";
import { X, Minus } from "lucide-react";
import clsx from "clsx";
import socket from '../../socket';
import { useChat } from '../../contexts/ChatContext';
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
      console.error("Gửi tin nhắn thất bại", err);
    }
  };

  return (
    <div
      className="fixed bottom-0 h-100 w-80 bg-[#f9f9f9] text-black dark:bg-[#1e1f22] dark:text-white rounded-t-lg shadow-lg border border-gray-300 dark:border-gray-700 flex flex-col overflow-hidden z-50 transition-all duration-300"
      style={{ right: `${rightOffset}px` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-3 py-2 bg-[#e5e5e5] dark:bg-[#2a2a2d] border-b border-gray-300 dark:border-gray-600">
        <div className="flex items-center gap-2 relative">
          <div className="relative">
            <img
              src={user.Avatar}
              alt={user.Name}
              className="w-8 h-8 rounded-full cursor-pointer"
              onClick={() => navigate(`/profile/${user._id}`)}
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#e5e5e5] dark:border-[#2a2a2d] rounded-full" />
          </div>
          <div className="text-sm font-semibold">{user.Name}</div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setMinimized(!minimized)} className="hover:text-yellow-500 dark:hover:text-yellow-400">
            <Minus size={18} />
          </button>
          <button onClick={onClose} className="hover:text-red-500 dark:hover:text-red-400">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Nội dung chat */}
      {!minimized && (
        <>
          <div className="p-3 space-y-2 overflow-y-auto h-[22rem] flex flex-col scrollbar-hide">
            {messages.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-400 text-sm italic text-center pt-10">
                Chưa có tin nhắn nào
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
                      className={`mt-[-2.5px] mb-[-2.5px] px-4 py-2 rounded-[20px] text-sm max-w-[75%] break-words ${
                        isSelf
                          ? 'bg-orange-500 text-black'
                          : 'bg-gray-300 text-black dark:bg-gray-500 dark:text-white'
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

          {/* Nhập tin nhắn */}
          <div className="flex items-center p-2 border-t border-gray-300 dark:border-gray-700">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Aa"
              className="flex-1 bg-[#e5e5e5] dark:bg-[#2a2a2d] text-sm text-black dark:text-white px-3 py-2 rounded-full focus:outline-none"
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