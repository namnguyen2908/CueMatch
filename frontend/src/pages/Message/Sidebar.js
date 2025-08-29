import React from 'react';

const Sidebar = ({ conversations, selectedConversationId, onSelectConversation, userId }) => {
  // Xử lý toàn bộ danh sách trước
  const renderedConversations = conversations.map(conv => {
    const isSelected = conv._id === selectedConversationId;
    const lastMessageText = conv.LastMessage?.Text || 'Không có tin nhắn';

    const otherUser = conv.Type === 'single'
      ? conv.Members.find(m => m._id !== userId)
      : null;

    const conversationName = conv.Type === 'group'
      ? conv.Name
      : otherUser?.Name || 'Người dùng';

    const avatarUrl = conv.Type === 'group'
      ? null
      : otherUser?.Avatar;

    return (
      <div
        key={conv._id}
        className={`p-4 border-b border-gray-700/30 cursor-pointer hover:bg-gray-700/50 ${
          isSelected ? 'bg-yellow-600/40' : ''
        }`}
        onClick={() => onSelectConversation(conv._id)}
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={conversationName}
                className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400"
              />
            ) : (
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-lg font-semibold text-gray-900">
                {conversationName[0]}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <h3 className="text-white font-semibold truncate">{conversationName}</h3>
              <span className="text-xs text-gray-400">
                {conv.LastMessage ? new Date(conv.LastMessage.createdAt).toLocaleTimeString() : ''}
              </span>
            </div>
            <p className="text-sm text-gray-400 truncate">{lastMessageText}</p>
          </div>
        </div>
      </div>
    );
  });

  // 👉 Trả về toàn bộ giao diện với 1 return duy nhất
  return (
    <div className="w-80 bg-gray-800/80 backdrop-blur-md border-r border-yellow-500/20 flex flex-col">
      <div className="p-4 border-b border-gray-700/50">
        <h1 className="text-xl font-bold text-yellow-400">Messages</h1>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-600 scrollbar-track-gray-800">
        {renderedConversations}
      </div>
    </div>
  );
};

export default Sidebar;