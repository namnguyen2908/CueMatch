import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Sidebar from './Sidebar';
import ChatHeader from './ChatHeader';
import MessagesList from './MessagesList';
import socket from '../../socket';
import { getMessages, sendMessage, getConversations } from '../../api/messageApi';
import { useUser } from '../../contexts/UserContext';

const MessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const { datauser } = useUser();
  const userId = datauser.id; // thay bằng id user thực tế
  const selectedConversation = conversations.find(c => c._id === selectedConversationId);
  // Lấy danh sách conversation khi component mount
  useEffect(() => {
    getConversations().then(res => {
      setConversations(res.data);
      if (res.data.length > 0) setSelectedConversationId(res.data[0]._id);
    });
  }, []);

  // Khi conversation thay đổi, load tin nhắn
  useEffect(() => {
    if (!selectedConversationId) return;

    socket.emit('join_conversation', selectedConversationId);

    getMessages(selectedConversationId).then(res => {
      setMessages(res.data);
    });

    const handleReceiveMessage = (message) => {
      if (message.ConversationId === selectedConversationId) {
        // Kiểm tra message đã có chưa trước khi thêm
        setMessages(prev => {
          const exists = prev.some(m => m._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [selectedConversationId]);


  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedConversationId) return;

    const formData = new FormData();
    formData.append('ConversationId', selectedConversationId);
    formData.append('Text', inputText);

    try {
      await sendMessage(formData);
      setInputText('');
      // Đừng thêm tin nhắn vào messages ở đây, đợi socket nhận lại
    } catch (error) {
      console.error('Gửi tin nhắn thất bại:', error);
    }
  };


  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="pt-20">
        <div className="flex h-[calc(100vh-81px)] bg-gradient-to-br from-gray-900 via-gray-800 to-black">
          <Sidebar
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
            userId={userId} // truyền userId từ MessagesPage
          />
          <div className="flex-1 flex flex-col">
            <ChatHeader conversation={selectedConversation} userId={userId} />
            <MessagesList messages={messages} userId={userId} />
            <div className="p-4 border-t border-yellow-500/20 bg-gray-800/80">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-2 rounded-2xl font-semibold transition"
                >
                  Gửi
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;