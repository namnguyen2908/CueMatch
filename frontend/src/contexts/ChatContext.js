import React, { createContext, useContext, useEffect, useState } from 'react';
import socket from '../socket';
import { getMessages } from '../api/messageApi';
import { useUser } from './UserContext';

const ChatContext = createContext();
export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { datauser } = useUser();

  const [openChats, setOpenChats] = useState([]);
  const [messagesMap, setMessagesMap] = useState({}); // { conversationId: [messages] }

  // 🟢 Khi người dùng đăng nhập, gửi socket init
  useEffect(() => {
    if (datauser?.id) {
      socket.emit('init_user', datauser.id);
    }
  }, [datauser]);

  // 🔁 Lắng nghe tin nhắn mới
  useEffect(() => {
    const handleReceiveMessage = (message) => {
      const { ConversationId } = message;

      setMessagesMap(prev => ({
        ...prev,
        [ConversationId]: [...(prev[ConversationId] || []), {
          ...message,
          fromSelf: (message?.Sender?._id || message?.Sender) === datauser.id
        }]
      }));
    };

    socket.on('receive_message', handleReceiveMessage);
    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [datauser]);

  // 🧩 Mở khung chat (nếu chưa có)
  const openChatWith = async (user, conversationId) => {
    const alreadyOpen = openChats.some(chat => chat.conversationId === conversationId);
    if (alreadyOpen) return;

    try {
      const res = await getMessages(conversationId);
      const messages = res.data;

      socket.emit('join_conversation', conversationId);

      setMessagesMap(prev => ({
        ...prev,
        [conversationId]: messages.map(msg => ({
          ...msg,
          fromSelf: (msg?.Sender?._id || msg?.Sender) === datauser.id
        }))
      }));

      setOpenChats(prev => {
        const updated = [...prev, { ...user, conversationId }];
        if (updated.length > 3) updated.shift();
        return updated;
      });
    } catch (err) {
      console.error("Lỗi khi lấy tin nhắn:", err);
    }
  };

  const closeChat = (userId) => {
    setOpenChats(prev => prev.filter(c => c._id !== userId));
  };

  const addLocalMessage = (conversationId, message) => {
    setMessagesMap(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), {
        ...message,
        fromSelf: true,
      }]
    }));
  };

  return (
    <ChatContext.Provider
      value={{
        openChats,
        messagesMap,
        openChatWith,
        closeChat,
        addLocalMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
