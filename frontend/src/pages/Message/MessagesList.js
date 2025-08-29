import React, { useEffect, useRef } from 'react';

const MessagesList = ({ messages, userId }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-yellow-600 scrollbar-track-gray-800 scrollbar-hide">
      {messages.map((msg) => {
        const senderId = typeof msg.Sender === 'string' ? msg.Sender : msg.Sender._id;
        const isSender = senderId === userId;

        return (
          <div
            key={msg._id}
            className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 text-sm rounded-2xl ${
                isSender
                  ? 'bg-yellow-400 text-gray-900 rounded-br-none'
                  : 'bg-gray-700 text-white rounded-bl-none'
              }`}
            >
              <p>{msg.Text}</p>
              <span className="block text-[10px] mt-1 text-right opacity-60">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        );
      })}
      {/* Element để scroll tới */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesList;
