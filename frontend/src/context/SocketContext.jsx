import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../services/api';

const SocketContext = createContext({
  socket: null,
  notifications: [],
  unreadCount: 0,
  fetchNotifications: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {}
});

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch all persistent notifications from backend
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
      const unreads = res.data.data.filter(n => !n.isRead).length;
      setUnreadCount(unreads);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // Connect socket on login
  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Connect to Backend Socket.io
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Join room on connection
    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      newSocket.emit('join_room', user._id);
    });

    // Listen for new notifications
    newSocket.on('new_notification', (notification) => {
      console.log('Real-time notification received:', notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Simple browser notification if supported and allowed
      if (Notification.permission === 'granted') {
        new Notification('College Lost & Found', {
          body: notification.message
        });
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read/all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
