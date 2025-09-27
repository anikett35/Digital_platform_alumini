import React, { createContext, useContext } from 'react';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  // Simple placeholder - we'll add real Socket.IO functionality later
  const value = {
    socket: null,
    onlineUsers: [],
    typingUsers: {},
    joinConversation: () => {},
    leaveConversation: () => {},
    sendTypingIndicator: () => {},
    stopTypingIndicator: () => {},
    sendMentorshipRequest: () => {},
    sendMentorshipResponse: () => {},
    markAsRead: () => {},
    isConnected: false
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};