import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Users, 
  Send, 
  ArrowLeft,
  Search
} from 'lucide-react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';

const MessagingPage = ({ embedded = false }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [contacts, setContacts] = useState([]);
  const [showContacts, setShowContacts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const { user, token } = useAuth();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket.IO connection
  useEffect(() => {
    if (user && token) {
      const newSocket = io('http://localhost:5000', {
        auth: { token }
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to server');
      });

      newSocket.on('newMessage', (data) => {
        // Check if this is our own message to avoid duplicates
        const isOwnMessage = (data.message.sender?._id || data.message.senderId) === 
                             (user?.id || user?._id || user?.userId);
        
        if (data.conversationId === selectedConversation?._id && !isOwnMessage) {
          setMessages(prev => [...prev, data.message]);
        }
        
        setConversations(prev => 
          prev.map(conv => 
            conv._id === data.conversationId 
              ? { ...conv, lastMessage: data.message, lastActivity: new Date() }
              : conv
          ).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
        );
      });

      newSocket.on('userOnline', (userData) => {
        setOnlineUsers(prev => [...prev.filter(u => u.userId !== userData.userId), userData]);
      });

      newSocket.on('userOffline', (userData) => {
        setOnlineUsers(prev => prev.filter(u => u.userId !== userData.userId));
      });

      return () => {
        newSocket.close();
      };
    }
  }, [user, token, selectedConversation]);

  useEffect(() => {
    fetchConversations();
    fetchContacts();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/messages/conversations');
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await axios.get('/api/messages/contacts');
      setContacts(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await axios.get(`/api/messages/${conversationId}`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    setShowContacts(false);
    fetchMessages(conversation._id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const messageContent = newMessage;
    setNewMessage('');

    // Create optimistic message object
    const optimisticMessage = {
      _id: `temp_${Date.now()}`, // temporary ID with prefix
      content: messageContent,
      sender: {
        _id: user?.id || user?._id || user?.userId,
        name: user?.name
      },
      senderId: user?.id || user?._id || user?.userId, // Add senderId for compatibility
      createdAt: new Date().toISOString(),
      conversationId: selectedConversation._id,
      isOptimistic: true // Flag to identify optimistic messages
    };

    // Immediately add to UI (optimistic update)
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const response = await axios.post(`/api/messages/${selectedConversation._id}`, {
        content: messageContent
      });
      
      // Replace optimistic message with actual message from server
      if (response.data.message) {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === optimisticMessage._id ? response.data.message : msg
          )
        );
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
      // Restore the message in input field
      setNewMessage(messageContent);
      alert('Failed to send message. Please try again.');
    }
  };

  const startNewConversation = async (contact) => {
    try {
      const response = await axios.post('/api/messages/conversations', {
        participantId: contact._id
      });
      
      const newConversation = response.data.conversation;
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversation(newConversation);
      setShowContacts(false);
      setMessages([]);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.some(u => u.userId === userId);
  };

  const isCurrentUserMessage = (message) => {
    const currentUserId = user?.id || user?._id || user?.userId;
    const messageSenderId = message.sender?._id || message.sender?.id || message.senderId;
    
    // Debug logging
    if (message.isOptimistic) {
      console.log('Optimistic message - always current user');
      return true;
    }
    
    console.log('Current User ID:', currentUserId, 'Message Sender ID:', messageSenderId);
    return String(currentUserId) === String(messageSenderId);
  };

  return (
    <div className={embedded ? "h-full rounded-lg" : "min-h-screen bg-gray-50"}>
      <div className={`${embedded ? "h-full" : "max-w-7xl mx-auto py-6 px-4"}`}>
        <div className={`bg-white ${embedded ? "h-full rounded-xl border border-gray-200" : "rounded-2xl shadow-xl border border-gray-100"}`}>
          
          {!embedded && (
            <div className="flex items-center space-x-3 p-6 border-b border-gray-100">
              <MessageCircle className="w-7 h-7 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            </div>
          )}

          <div className={embedded ? "h-full flex" : "p-6"}>
            <div className="flex h-full w-full">
              {/* Sidebar */}
              <div className={`w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col ${embedded ? "h-full" : ""}`}>
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold flex items-center text-gray-900">
                      <MessageCircle className="w-6 h-6 mr-2 text-blue-500" />
                      Messages
                    </h1>
                    <button
                      onClick={() => setShowContacts(!showContacts)}
                      className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    >
                      <Users className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : showContacts ? (
                    /* Contacts List */
                    <div className="p-4">
                      <h3 className="font-medium mb-4 text-gray-900">
                        Start New Conversation
                      </h3>
                      {contacts.length === 0 ? (
                        <p className="text-center py-8 text-gray-500">
                          No contacts available
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {contacts.map(contact => (
                            <div
                              key={contact._id}
                              onClick={() => startNewConversation(contact)}
                              className="p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="relative">
                                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">
                                      {contact.name.charAt(0)}
                                    </span>
                                  </div>
                                  {isUserOnline(contact._id) && (
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-sm text-gray-900">
                                    {contact.name}
                                  </p>
                                  <p className="text-xs text-gray-500 capitalize">
                                    {contact.role}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Conversations List */
                    <div>
                      {conversations.length === 0 ? (
                        <div className="p-8 text-center">
                          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                          <p className="text-gray-500">No conversations yet</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Click the contacts button to start chatting!
                          </p>
                        </div>
                      ) : (
                        conversations.map(conversation => {
                          const otherParticipant = conversation.participant;
                          return (
                            <div
                              key={conversation._id}
                              onClick={() => handleConversationSelect(conversation)}
                              className={`p-4 cursor-pointer border-b border-gray-200 ${
                                selectedConversation?._id === conversation._id 
                                  ? 'bg-blue-50 border-blue-200' 
                                  : 'hover:bg-gray-100'
                              } transition-colors`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="relative">
                                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-medium">
                                      {otherParticipant?.name?.charAt(0) || '?'}
                                    </span>
                                  </div>
                                  {isUserOnline(otherParticipant?._id) && (
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <p className="font-medium truncate text-gray-900">
                                      {otherParticipant?.name}
                                    </p>
                                    {isUserOnline(otherParticipant?._id) && (
                                      <span className="text-xs text-green-500 flex-shrink-0">online</span>
                                    )}
                                  </div>
                                  {conversation.lastMessage && (
                                    <p className="text-sm truncate text-gray-500">
                                      {conversation.lastMessage.content}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className={`flex-1 flex flex-col bg-gray-50 ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-200 bg-white">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setSelectedConversation(null)}
                          className="p-2 rounded-lg md:hidden hover:bg-gray-100"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {selectedConversation.participant?.name?.charAt(0)}
                            </span>
                          </div>
                          {isUserOnline(selectedConversation.participant?._id) && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {selectedConversation.participant?.name}
                          </p>
                          <p className="text-sm text-gray-500 capitalize">
                            {selectedConversation.participant?.role}
                            {isUserOnline(selectedConversation.participant?._id) && (
                              <span className="text-green-500"> • online</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                      {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-400 text-sm">No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        messages.map(message => {
                          const isCurrentUser = isCurrentUserMessage(message);
                          
                          return (
                            <div
                              key={message._id}
                              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                                  isCurrentUser
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-900 border border-gray-200'
                                }`}
                              >
                                <p className="text-sm font-medium">{message.content}</p>
                                <p className={`text-xs mt-1 ${
                                  isCurrentUser ? 'text-blue-100' : 'text-gray-400'
                                }`}>
                                  {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  }) : ''}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border border-gray-200"
                        />
                        <button
                          type="submit"
                          disabled={!newMessage.trim()}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  /* No conversation selected */
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                      <h3 className="text-lg font-medium mb-2 text-gray-900">
                        Welcome to Messages
                      </h3>
                      <p className="text-gray-500">
                        Select a conversation or start a new one to begin messaging
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;