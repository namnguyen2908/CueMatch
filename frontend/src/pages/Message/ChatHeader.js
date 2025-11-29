import React, { useState } from 'react';
import { MoreVertical, User, MessageCircle } from 'lucide-react';
import { useOnlineStatus } from '../../contexts/StatusContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ChatHeader = ({ conversation, userId, onOpenSidebar }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { onlineUsers } = useOnlineStatus();
  const navigate = useNavigate();

  if (!conversation) return null;

  const isGroup = conversation.Type === 'group';
  const otherUser = !isGroup
    ? conversation.Members.find(m => m._id !== userId)
    : null;

  const displayName = isGroup
    ? conversation.Name
    : otherUser?.Name || 'User';

  const avatarUrl = isGroup
    ? conversation.Avatar
    : otherUser?.Avatar;

  const otherUserId = otherUser?._id;
  const isOnline = otherUserId ? onlineUsers.has(otherUserId) : false;

  const handleViewProfile = () => {
    if (otherUserId) {
      navigate(`/profile/${otherUserId}`);
      setShowMenu(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 
      bg-white/90 dark:bg-luxury-800/90 backdrop-blur-xl
      border-b border-sport-200/30 dark:border-sport-800/30 
      shadow-sm">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {onOpenSidebar && (
          <button
            type="button"
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-xl bg-luxury-100 dark:bg-luxury-900 text-luxury-600 dark:text-luxury-200 border border-transparent hover:border-sport-200/40 dark:hover:border-sport-700/40 transition"
            aria-label="Open conversations"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        )}
        <div className="relative flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-12 h-12 rounded-xl object-cover border-2 border-sport-200 dark:border-sport-700 shadow-sm"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-sport rounded-xl flex items-center justify-center text-lg text-white font-semibold border-2 border-sport-200 dark:border-sport-700 shadow-sport">
              {displayName?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          {!isGroup && (
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-luxury-800 shadow-lg ${
                isOnline ? 'bg-green-500 ring-2 ring-green-400/50' : 'bg-gray-400'
              }`}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-luxury-900 dark:text-luxury-100 font-semibold truncate text-base font-display">
            {displayName}
          </h2>
          <p
            className={`text-xs truncate ${
              isOnline
                ? 'text-green-600 dark:text-green-400'
                : 'text-luxury-500 dark:text-luxury-400'
            }`}
          >
            {isGroup
              ? `${conversation.Members?.length || 0} members`
              : isOnline
              ? 'Online'
              : 'Offline'}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 flex-shrink-0">
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-luxury-600 dark:text-luxury-400 
              hover:bg-sport-50/50 dark:hover:bg-sport-900/10 
              rounded-xl transition-all duration-200"
            title="More"
          >
            <MoreVertical size={18} />
          </button>

          <AnimatePresence>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-48 
                    glass-card rounded-lg shadow-luxury 
                    border border-sport-200/30 dark:border-sport-800/30 py-2 z-20"
                >
                  {!isGroup && otherUserId && (
                    <button
                      onClick={handleViewProfile}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-left text-sm 
                        text-luxury-700 dark:text-luxury-300 
                        hover:bg-sport-50/50 dark:hover:bg-sport-900/10 
                        transition-colors rounded-lg"
                    >
                      <User size={16} />
                      <span>View Profile</span>
                    </button>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;