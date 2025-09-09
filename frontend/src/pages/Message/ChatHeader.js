import React from 'react';
import { Phone, MoreVertical } from 'lucide-react';

const ChatHeader = ({ conversation, userId }) => {
  if (!conversation) return null;

  const isGroup = conversation.Type === 'group';
  const otherUser = !isGroup
    ? conversation.Members.find(m => m._id !== userId)
    : null;

  const displayName = isGroup
    ? conversation.Name
    : otherUser?.Name || 'Người dùng';

    const avatarUrl = isGroup
    ? conversation.Avatar
    : otherUser?.Avatar;

  return (
    <div className="flex items-center justify-between p-4 bg-[#F2F2F2]  dark:bg-[#242424] border-b border-gray-300 dark:border-yellow-500/20">
      <div className="flex items-center space-x-3">
        {/* Avatar Circle */}
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-lg text-white dark:text-gray-900 font-semibold">
              {displayName?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></div>
        </div>

        {/* Name + Status */}
        <div>
          <h2 className="text-gray-900 dark:text-yellow-400 font-semibold truncate">{displayName}</h2>
          <p className="text-xs text-green-600 dark:text-green-400">Đang hoạt động</p>
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex space-x-2 text-gray-700 dark:text-yellow-400">
        <Phone size={18} />
        <MoreVertical size={18} />
      </div>
    </div>
  );
};

export default ChatHeader;