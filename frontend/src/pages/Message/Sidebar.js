import React, { useState, useMemo } from 'react';
import { Search, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { DateTime } from 'luxon';
import { useOnlineStatus } from '../../contexts/StatusContext';

const Sidebar = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  userId,
  loading,
  variant = 'desktop'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { onlineUsers } = useOnlineStatus();
  const isMobile = variant === 'mobile';

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;

    const query = searchQuery.toLowerCase();
    return conversations.filter(conv => {
      const otherUser = conv.Type === 'single'
        ? conv.Members.find(m => m._id !== userId)
        : null;
      const conversationName = conv.Type === 'group'
        ? conv.Name
        : otherUser?.Name || 'User';
      
      return conversationName.toLowerCase().includes(query);
    });
  }, [conversations, searchQuery, userId]);

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = DateTime.fromISO(dateString);
    const now = DateTime.now();
    const diff = now.diff(date, 'days').days;

    if (diff < 1) {
      return date.toFormat('HH:mm');
    } else if (diff < 7) {
      return date.toFormat('EEE');
    } else {
      return date.toFormat('dd/MM');
    }
  };

  const containerClasses = `
    ${isMobile ? 'w-full h-full' : 'w-80'}
    bg-white/90 dark:bg-luxury-800/90 backdrop-blur-xl
    border-r border-sport-200/30 dark:border-sport-800/30 
    flex flex-col shadow-luxury
  `;

  if (loading) {
    return (
      <div className={containerClasses}>
        <div className="p-4 border-b border-sport-200/30 dark:border-sport-800/30">
          <div className="h-10 bg-luxury-200 dark:bg-luxury-700 rounded-lg animate-pulse" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-luxury-500 dark:text-luxury-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className="p-4 border-b border-sport-200/30 dark:border-sport-800/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-sport flex items-center justify-center shadow-sport">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-luxury-900 dark:text-luxury-100 font-display">Messages</h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-luxury-400 dark:text-luxury-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="input-elegant w-full pl-10 pr-4 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto 
        scrollbar-thin scrollbar-thumb-sport-400 dark:scrollbar-thumb-sport-600 
        scrollbar-track-transparent">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 rounded-full 
              bg-luxury-100 dark:bg-luxury-800 
              border border-sport-200/30 dark:border-sport-800/30
              flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-luxury-400 dark:text-luxury-500" />
            </div>
            <p className="text-luxury-500 dark:text-luxury-400">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conv, index) => {
              const isSelected = conv._id === selectedConversationId;
              const lastMessageText = conv.LastMessage?.Text || '';
              const lastMessageTime = conv.LastMessage?.createdAt;

              const otherUser = conv.Type === 'single'
                ? conv.Members.find(m => m._id !== userId)
                : null;

              const conversationName = conv.Type === 'group'
                ? conv.Name
                : otherUser?.Name || 'User';

              const avatarUrl = conv.Type === 'group'
                ? conv.Avatar
                : otherUser?.Avatar;

              const otherUserId = otherUser?._id;
              const isOnline = otherUserId ? onlineUsers.has(otherUserId) : false;

              return (
                <motion.div
                  key={conv._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 mb-1 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'dark:bg-gradient-to-r dark:from-[#f79a6f] dark:to-[#ef763e] bg-gradient-to-r from-[#FF874B] to-[#FF955C] text-white shadow-sport-lg'
                      : 'hover:bg-sport-50/50 dark:hover:bg-sport-900/10 border border-transparent hover:border-sport-200/50 dark:hover:border-sport-800/50'
                  }`}
                  onClick={() => onSelectConversation(conv._id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={conversationName}
                          className="w-14 h-14 rounded-xl object-cover border-2 border-white dark:border-luxury-800 shadow-sm"
                        />
                      ) : (
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-semibold border-2 border-white dark:border-luxury-800 shadow-sm ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-gradient-sport text-white'
                        }`}>
                          {(conversationName?.[0] || '?').toUpperCase()}
                        </div>
                      )}
                      {conv.Type === 'single' && otherUserId && (
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-800 ${
                            isOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3
                          className={`font-semibold truncate font-display ${
                            isSelected
                              ? 'text-white'
                              : 'text-luxury-900 dark:text-luxury-100'
                          }`}
                          title={conversationName}
                        >
                          {conversationName}
                        </h3>
                        {lastMessageTime && (
                          <span
                            className={`text-xs whitespace-nowrap flex-shrink-0 ${
                              isSelected
                                ? 'text-white/80'
                                : 'text-luxury-500 dark:text-luxury-400'
                            }`}
                          >
                            {formatTime(lastMessageTime)}
                          </span>
                        )}
                      </div>
                      {lastMessageText && (
                        <p
                          className={`text-sm truncate ${
                            isSelected
                              ? 'text-white/90'
                              : 'text-luxury-600 dark:text-luxury-400'
                          }`}
                        >
                          {lastMessageText}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;