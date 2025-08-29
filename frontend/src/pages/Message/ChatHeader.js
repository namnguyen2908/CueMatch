import React from 'react';
import { Phone, Video, Search, MoreVertical } from 'lucide-react';

const ChatHeader = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-800/80 border-b border-yellow-500/20">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-lg text-gray-900">U</div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-800"></div>
        </div>
        <div>
          <h2 className="text-yellow-400 font-semibold">User Name</h2>
          <p className="text-xs text-green-400">Đang hoạt động</p>
        </div>
      </div>
      <div className="flex space-x-2 text-yellow-400">
        <Phone size={18} />
        <Video size={18} />
        <Search size={18} />
        <MoreVertical size={18} />
      </div>
    </div>
  );
};

export default ChatHeader;