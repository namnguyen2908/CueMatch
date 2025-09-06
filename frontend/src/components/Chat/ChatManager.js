import React from 'react';
import ChatBox from './ChatBox';
import { useChat } from '../../contexts/ChatContext';

const ChatManager = () => {
  const { openChats, closeChat } = useChat();

  return (
    <>
      {openChats.map((user, index) => (
        <ChatBox
          key={user._id}
          user={user}
          index={index}
          onClose={() => closeChat(user._id)}
          conversationId={user.conversationId}
        />
      ))}
    </>
  );
};

export default ChatManager;