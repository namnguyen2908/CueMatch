import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bell, X, Check, CheckCheck, Trash2, Heart, MessageCircle, UserPlus, Target, Calendar } from 'lucide-react';
import notificationApi from '../../api/notificationApi';
import socket from '../../socket';
import { useNavigate } from 'react-router-dom';

const formatTime = (date) => {
  try {
    const now = new Date();
    const notificationDate = new Date(date);
    const diff = Math.floor((now - notificationDate) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return `${Math.floor(diff / 604800)} weeks ago`;
  } catch {
    return 'Just now';
  }
};

const NotificationDropdown = ({
  isOpen,
  onClose = () => {},
  onUnreadCountChange,
  variant = 'popover',
}) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const isInline = variant === 'inline';

  const updateUnreadCount = (count) => {
    setUnreadCount(count);
    if (onUnreadCountChange) onUnreadCountChange(count);
  };

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await notificationApi.getNotifications(20, 0);
      const data = Array.isArray(response.data) ? response.data : [];
      setNotifications(data);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationApi.getUnreadCount();
      const count = response.data?.count || 0;
      updateUnreadCount(count);
    } catch {
      updateUnreadCount(0);
    }
  }, [onUnreadCountChange]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isOpen, fetchNotifications, fetchUnreadCount]);

  useEffect(() => {
    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      updateUnreadCount(unreadCount + 1);
    };

    socket.on('new_notification', handleNewNotification);
    return () => socket.off('new_notification', handleNewNotification);
  }, [unreadCount]);

  useEffect(() => {
    if (isInline) return undefined;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, isInline]);

  const markAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, IsRead: true } : n))
      );
      updateUnreadCount(Math.max(0, unreadCount - 1));
    } catch {}
  };

  const markAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, IsRead: true })));
      updateUnreadCount(0);
    } catch {}
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationApi.deleteNotification(id);
      const notif = notifications.find((n) => n._id === id);
      if (notif && !notif.IsRead) {
        updateUnreadCount(Math.max(0, unreadCount - 1));
      }
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch {}
  };

  const openNotification = (notif) => {
    const id = notif._id || notif.id;
    const type = notif.Type || notif.type;
    const isRead = notif.IsRead || notif.isRead;

    if (!isRead && id) {
      markAsRead(id, { stopPropagation: () => {} });
    }

    if (type === 'friend_request' || type === 'friend_accepted') {
      navigate('/friends/friend-requests');
    } else if (type === 'matching_request' || type === 'matching_accepted') {
      navigate('/matching/match-hub');
    } else if (type === 'new_booking') {
      navigate('/club-dashboard/bookings');
    }

    onClose();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'like': return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment': return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'friend_request':
      case 'friend_accepted': return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'matching_request':
      case 'matching_accepted': return <Target className="w-5 h-5 text-orange-500" />;
      case 'new_booking': return <Calendar className="w-5 h-5 text-purple-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  const containerClasses = [
    "bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden",
    isInline
      ? "w-full shadow-inner"
      : "absolute top-full right-0 mt-3 w-full max-w-sm sm:max-w-md md:w-96 max-h-[600px] shadow-xl z-50",
  ].join(" ");

  const listWrapperClasses = isInline
    ? "overflow-y-auto max-h-[280px] sm:max-h-[360px]"
    : "overflow-y-auto max-h-[500px]";

  const headerClasses = [
    "p-4 border-b border-gray-200 dark:border-gray-700 flex items-center",
    isInline ? "justify-between flex-wrap gap-3" : "justify-between",
  ].join(" ");

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={containerClasses}
    >
      <div className={headerClasses}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
              <CheckCheck className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className={listWrapperClasses}>
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((n) => (
              <motion.div
                key={n._id || n.id || Math.random()}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => openNotification(n)}
                className={`p-4 cursor-pointer transition-colors relative ${
                  !n.IsRead ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                {!n.IsRead && <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full" />}

                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    {n.FromUserID?.Avatar ? (
                      <img src={n.FromUserID.Avatar} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        {getIcon(n.Type)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {n.FromUserID?.Name || 'User'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {n.Message || 'New notification'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {formatTime(n.createdAt)}
                    </p>
                  </div>

                  <div className="flex-shrink-0">{getIcon(n.Type)}</div>
                </div>

                <div className="flex items-center gap-2 mt-2 ml-13">
                  {!n.IsRead && (
                    <button
                      onClick={(e) => markAsRead(n._id, e)}
                      className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => deleteNotification(n._id, e)}
                    className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NotificationDropdown;