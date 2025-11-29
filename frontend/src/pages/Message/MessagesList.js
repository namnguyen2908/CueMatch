import React, { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DateTime } from 'luxon';

const MessagesList = ({ messages, userId }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentDate = null;
    let currentGroup = [];

    messages.forEach((msg, index) => {
      const msgDate = DateTime.fromISO(msg.createdAt).toFormat('yyyy-MM-dd');
      const today = DateTime.now().toFormat('yyyy-MM-dd');
      const yesterday = DateTime.now().minus({ days: 1 }).toFormat('yyyy-MM-dd');

      let dateLabel = '';
      if (msgDate === today) {
        dateLabel = 'Today';
      } else if (msgDate === yesterday) {
        dateLabel = 'Yesterday';
      } else {
        dateLabel = DateTime.fromISO(msg.createdAt).toFormat('dd/MM/yyyy');
      }

      if (msgDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, dateLabel, messages: currentGroup });
        }
        currentDate = msgDate;
        currentGroup = [msg];
      } else {
        currentGroup.push(msg);
      }

      if (index === messages.length - 1 && currentGroup.length > 0) {
        groups.push({ date: currentDate, dateLabel, messages: currentGroup });
      }
    });

    return groups;
  }, [messages]);

  const formatTime = (dateString) => {
    return DateTime.fromISO(dateString).toFormat('HH:mm');
  };

  const getSenderInfo = (msg) => {
    if (typeof msg.Sender === 'string') {
      return { id: msg.Sender, name: 'User', avatar: null };
    }
    return {
      id: msg.Sender._id,
      name: msg.Sender.Name || 'User',
      avatar: msg.Sender.Avatar,
    };
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full 
            bg-luxury-100 dark:bg-luxury-800 
            flex items-center justify-center
            border border-sport-200/30 dark:border-sport-800/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-luxury-400 dark:text-luxury-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <p className="text-luxury-500 dark:text-luxury-400">No messages yet</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 
        bg-gradient-to-b from-sport-50/20 via-white to-white 
        dark:from-luxury-950/50 dark:via-luxury-900/50 dark:to-luxury-800/50
        scrollbar-thin scrollbar-thumb-sport-400 dark:scrollbar-thumb-sport-600 
        scrollbar-track-transparent"
    >
      {groupedMessages.map((group, groupIndex) => (
        <div key={group.date || groupIndex} className="space-y-3">
          <div className="flex items-center justify-center my-4">
            <div className="px-3 py-1 
              bg-luxury-100/80 dark:bg-luxury-800/80 
              backdrop-blur-sm
              rounded-full text-xs font-medium 
              text-luxury-600 dark:text-luxury-300
              border border-sport-200/30 dark:border-sport-800/30">
              {group.dateLabel}
            </div>
          </div>

          {group.messages.map((msg, msgIndex) => {
            const senderInfo = getSenderInfo(msg);
            const isSender = senderInfo.id === userId;
            const showAvatar = !isSender && (msgIndex === 0 || group.messages[msgIndex - 1]?.Sender?._id !== senderInfo.id);

            return (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex items-end gap-2 ${isSender ? 'justify-end' : 'justify-start'}`}
              >
                {!isSender && (
                  <div className="flex-shrink-0">
                    {showAvatar ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white dark:border-gray-800">
                        {senderInfo.avatar ? (
                          <img
                            src={senderInfo.avatar}
                            alt={senderInfo.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-sport flex items-center justify-center text-white text-xs font-semibold">
                            {senderInfo.name[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-8" />
                    )}
                  </div>
                )}

                <div className={`flex flex-col max-w-[70%] ${isSender ? 'items-end' : 'items-start'}`}>
                  {!isSender && showAvatar && (
                    <span className="text-xs text-luxury-500 dark:text-luxury-400 mb-1 px-2">
                      {senderInfo.name}
                    </span>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl ${
                      isSender
                        ? 'bg-[#ffb459] dark:bg-[#FF955C] text-white rounded-br-md shadow-sport'
                        : 'sport-card text-luxury-900 dark:text-luxury-100 rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.Text}
                    </p>
                    <span
                      className={`block text-[10px] mt-1.5 ${
                        isSender ? 'text-white/80' : 'text-luxury-500 dark:text-luxury-400'
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>

                {isSender && <div className="w-8 flex-shrink-0" />}
              </motion.div>
            );
          })}
        </div>
      ))}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesList;