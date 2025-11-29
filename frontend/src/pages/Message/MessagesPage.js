import React, { useState, useEffect, useRef } from 'react';
import Header from '../../components/Header/Header';
import ConversationSidebar from './Sidebar';
import ChatHeader from './ChatHeader';
import MessagesList from './MessagesList';
import socket from '../../socket';
import { getMessages, sendMessage, getConversations } from '../../api/messageApi';
import { useUser } from '../../contexts/UserContext';
import { Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isConvoSidebarOpen, setIsConvoSidebarOpen] = useState(false);
  const { datauser } = useUser();
  const userId = datauser?.id;
  const inputRef = useRef(null);

  const selectedConversation = conversations.find(c => c._id === selectedConversationId);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const res = await getConversations();
        setConversations(res.data);
        if (res.data.length > 0 && !selectedConversationId) {
          setSelectedConversationId(res.data[0]._id);
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    socket.emit('join_conversation', selectedConversationId);

    const fetchMessages = async () => {
      try {
        const res = await getMessages(selectedConversationId);
        setMessages(res.data);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    fetchMessages();

    const handleReceiveMessage = (message) => {
      if (message.ConversationId === selectedConversationId) {
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

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedConversationId || sending) return;

    const formData = new FormData();
    formData.append('ConversationId', selectedConversationId);
    formData.append('Text', inputText.trim());

    try {
      setSending(true);
      await sendMessage(formData);
      setInputText('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsConvoSidebarOpen(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden
      bg-gradient-to-br from-sport-50/30 via-white to-sport-100/20
      dark:from-luxury-950 dark:via-luxury-900 dark:to-luxury-800
      text-luxury-900 dark:text-luxury-100
      transition-colors duration-300
      pattern-sport dark:pattern-luxury">
      <div className="fixed inset-0 bg-mesh-light dark:bg-mesh-dark pointer-events-none opacity-50"></div>

      <Header />

      <div className="pt-20 relative z-10 flex flex-col lg:flex-row min-h-screen">
        <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-5rem)]">
          <div className="hidden lg:flex w-80 flex-shrink-0">
            <ConversationSidebar
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              onSelectConversation={handleSelectConversation}
              userId={userId}
              loading={loading}
            />
          </div>

          <div className="flex-1 flex flex-col 
            glass-card
            border-l border-sport-200/30 dark:border-sport-800/30
            shadow-luxury
            relative overflow-hidden">
            {selectedConversation ? (
              <>
                <ChatHeader
                  conversation={selectedConversation}
                  userId={userId}
                  onOpenSidebar={() => setIsConvoSidebarOpen(true)}
                />
                <MessagesList messages={messages} userId={userId} />

                <div className="border-t border-sport-200/30 dark:border-sport-800/30 
                  bg-white/90 dark:bg-luxury-800/90 backdrop-blur-xl p-4">
                  <div className="flex items-end gap-3 max-w-4xl mx-auto">
                    <div className="flex-1 relative">
                      <textarea
                        ref={inputRef}
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        placeholder="Type a message..."
                        rows={1}
                        className="w-full flex items-end
    bg-luxury-50 dark:bg-luxury-900/50
    text-luxury-900 dark:text-luxury-100
    px-4 py-3 pr-12 rounded-2xl
    focus:outline-none focus:ring-2 focus:ring-sport-400 dark:focus:ring-sport-600
    border border-luxury-200/50 dark:border-luxury-700/50
    hover:border-sport-300/50 dark:hover:border-sport-700/50
    resize-none max-h-32 overflow-y-auto scrollbar-thin
    transition-all duration-200
  "
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        style={{ minHeight: '48px' }}
                      />
                    </div>
                    <motion.button
                      onClick={handleSendMessage}
                      disabled={!inputText.trim() || sending}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-3 rounded-full transition-all shadow-sport ${inputText.trim() && !sending
                          ? 'bg-gradient-sport text-white shadow-sport-lg hover:shadow-sport-xl'
                          : 'bg-luxury-200 dark:bg-luxury-700 text-luxury-400 dark:text-luxury-500 cursor-not-allowed'
                        }`}
                    >
                      <Send size={20} />
                    </motion.button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center px-4 text-center">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-luxury-800 dark:text-luxury-200 mb-2 font-display">
                    Select a conversation
                  </h3>
                  <p className="text-luxury-600 dark:text-luxury-400">
                    {conversations.length === 0
                      ? 'You have no conversations'
                      : 'Open the conversation list to start chatting'}
                  </p>
                  <button
                    type="button"
                    className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-gradient-sport rounded-xl shadow-sport hover:shadow-sport-lg transition lg:hidden"
                    onClick={() => setIsConvoSidebarOpen(true)}
                  >
                    View conversations
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isConvoSidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConvoSidebarOpen(false)}
            />
            <motion.div
              className="fixed inset-0 z-50 lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            >
              <ConversationSidebar
                variant="mobile"
                conversations={conversations}
                selectedConversationId={selectedConversationId}
                onSelectConversation={handleSelectConversation}
                userId={userId}
                loading={loading}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessagesPage;