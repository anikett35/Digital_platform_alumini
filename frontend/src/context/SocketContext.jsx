import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const { user, token } = useAuth();

  // Get API URL from environment variable
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Only connect if user is authenticated
    if (!token || !user) {
      return;
    }

    console.log('🔌 Initializing Socket.IO connection...');

    // Create socket connection with authentication
    const newSocket = io(API_URL, {
      auth: {
        token: token
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setIsConnected(false);
    });

    // User presence events
    newSocket.on('userOnline', (data) => {
      console.log('👤 User online:', data.name);
      setOnlineUsers(prev => [...prev.filter(u => u.userId !== data.userId), data]);
    });

    newSocket.on('userOffline', (data) => {
      console.log('👋 User offline:', data.name);
      setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    newSocket.on('userPresenceUpdate', (data) => {
      setOnlineUsers(prev => 
        prev.map(u => u.userId === data.userId ? { ...u, status: data.status } : u)
      );
    });

    // Typing indicators
    newSocket.on('userTyping', (data) => {
      setTypingUsers(prev => ({
        ...prev,
        [data.conversationId]: data
      }));
    });

    newSocket.on('userStoppedTyping', (data) => {
      setTypingUsers(prev => {
        const updated = { ...prev };
        delete updated[data.conversationId];
        return updated;
      });
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log('🔌 Closing socket connection...');
      newSocket.close();
    };
  }, [token, user, API_URL]);

  // Socket helper functions
  const joinConversation = useCallback((conversationId) => {
    if (socket) {
      socket.emit('joinConversation', conversationId);
      console.log('📥 Joined conversation:', conversationId);
    }
  }, [socket]);

  const leaveConversation = useCallback((conversationId) => {
    if (socket) {
      socket.emit('leaveConversation', conversationId);
      console.log('📤 Left conversation:', conversationId);
    }
  }, [socket]);

  const sendTypingIndicator = useCallback((conversationId) => {
    if (socket) {
      socket.emit('typing', { conversationId });
    }
  }, [socket]);

  const stopTypingIndicator = useCallback((conversationId) => {
    if (socket) {
      socket.emit('stopTyping', { conversationId });
    }
  }, [socket]);

  const markAsRead = useCallback((conversationId, messageId) => {
    if (socket) {
      socket.emit('markAsRead', { conversationId, messageId });
    }
  }, [socket]);

  const sendMentorshipRequest = useCallback((data) => {
    if (socket) {
      socket.emit('mentorshipRequest', data);
      console.log('📨 Mentorship request sent');
    }
  }, [socket]);

  const sendMentorshipResponse = useCallback((data) => {
    if (socket) {
      socket.emit('mentorshipResponse', data);
      console.log('✉️ Mentorship response sent');
    }
  }, [socket]);

  const updatePresence = useCallback((status) => {
    if (socket) {
      socket.emit('updatePresence', status);
    }
  }, [socket]);

  const value = {
    socket,
    isConnected,
    onlineUsers,
    typingUsers,
    joinConversation,
    leaveConversation,
    sendTypingIndicator,
    stopTypingIndicator,
    markAsRead,
    sendMentorshipRequest,
    sendMentorshipResponse,
    updatePresence
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};