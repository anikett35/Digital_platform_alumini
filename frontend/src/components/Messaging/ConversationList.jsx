import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Users, 
  Send, 
  ArrowLeft,
  Search,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  X,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import io from 'socket.io-client';

// Import your actual auth context
const useAuth = () => {
  // Replace this with your actual useAuth hook
  try {
    const { useAuth: actualUseAuth } = require('../../context/AuthContext');
    return actualUseAuth();
  } catch {
    return { user: null, token: null };
  }
};

const MessagingPage = ({ embedded = false }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [contacts, setContacts] = useState([]);
  const [showContacts, setShowContacts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const { user, token } = useAuth();

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
        console.log('New message received:', data);
        
        // Add message to current chat if it's the selected conversation
        if (data.conversationId === selectedConversation?._id) {
          setMessages(prev => [...prev, data.message]);
        }
        
        // Update conversation list
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
  }, [user, token, selectedConversation?._id]);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
    fetchContacts();
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversations from API
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/messages/conversations');
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch contacts from API
  const fetchContacts = async () => {
    try {
      const response = await axios.get('/api/messages/contacts');
      setContacts(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      setContacts([]);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId) => {
    try {
      setMessagesLoading(true);
      const response = await axios.get(`/api/messages/${conversationId}`);
      console.log('Fetched messages:', response.data.messages);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Handle conversation selection
  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    setShowContacts(false);
    fetchMessages(conversation._id);
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageContent = newMessage.trim();
    const tempId = `temp-${Date.now()}`;
    
    // Create temporary message object for immediate display
    const tempMessage = {
      _id: tempId,
      content: messageContent,
      createdAt: new Date().toISOString(),
      sender: {
        _id: user?.id || user?._id,
        name: user?.name
      },
      senderId: user?.id || user?._id,
      status: 'sending'
    };
    
    // Add message to UI immediately
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      const response = await axios.post(`/api/messages/${selectedConversation._id}`, {
        content: messageContent
      });
      
      console.log('Message sent, server response:', response.data);
      
      // Update the temporary message with the real one from server
      if (response.data && response.data.message) {
        setMessages(prev => 
          prev.map(msg => msg._id === tempId ? response.data.message : msg)
        );
        
        // Update conversation in list
        setConversations(prev => 
          prev.map(conv => 
            conv._id === selectedConversation._id 
              ? { 
                  ...conv, 
                  lastMessage: response.data.message, 
                  lastActivity: response.data.message.createdAt || new Date().toISOString() 
                }
              : conv
          ).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
        );
      }
      
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove temporary message on error
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      setNewMessage(messageContent); // Restore message on error
    }
  };

  // Start new conversation
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

  // Check if user is online
  const isUserOnline = (userId) => {
    return onlineUsers.some(u => u.userId === userId);
  };

  // Check if message is from current user
  const isCurrentUserMessage = (message) => {
    const currentUserId = user?.id || user?._id || user?.userId;
    const messageSenderId = message.sender?._id || message.sender?.id || message.senderId;
    return currentUserId === messageSenderId;
  };

  // Format time helpers
  const formatTime = (date) => {
    if (!date) return '';
    
    try {
      const now = new Date();
      const messageDate = new Date(date);
      
      // Check if date is valid
      if (isNaN(messageDate.getTime())) return '';
      
      const diffInMinutes = Math.floor((now - messageDate) / (1000 * 60));

      if (diffInMinutes < 1) return 'now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
      return messageDate.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  const formatMessageTime = (date) => {
    if (!date) return '';
    
    try {
      const messageDate = new Date(date);
      
      // Check if date is valid
      if (isNaN(messageDate.getTime())) return '';
      
      return messageDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      console.error('Error formatting message time:', error);
      return '';
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.participant?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full Screen Container */}
      <div className="h-screen flex flex-col">
        
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Sidebar - Conversations List */}
          <div className={`w-full md:w-96 bg-white border-r border-gray-200 flex flex-col ${selectedConversation && 'hidden md:flex'}`}>
            
            {/* Sidebar Header */}
            <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-white">Messages</h1>
                </div>
                <button
                  onClick={() => setShowContacts(!showContacts)}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all duration-200"
                >
                  {showContacts ? <X className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                />
              </div>
            </div>

            {/* Conversations/Contacts List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : showContacts ? (
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4 px-2">
                    Available Contacts
                  </h3>
                  {contacts.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500 text-sm">No contacts available</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {contacts.map((contact) => (
                        <div
                          key={contact._id}
                          onClick={() => startNewConversation(contact)}
                          className="p-4 rounded-2xl hover:bg-gray-50 cursor-pointer transition-all duration-200 group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-white">
                                <span className="text-white text-lg font-semibold">
                                  {contact.name?.charAt(0) || '?'}
                                </span>
                              </div>
                              {isUserOnline(contact._id) && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{contact.name}</p>
                              <p className="text-xs text-gray-500 capitalize">{contact.role}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {searchQuery ? 'Try a different search term' : 'Click the contacts button to start chatting!'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredConversations.map((conversation) => {
                    const otherParticipant = conversation.participant;
                    const isOnline = isUserOnline(otherParticipant?._id);
                    
                    return (
                      <div
                        key={conversation._id}
                        onClick={() => handleConversationSelect(conversation)}
                        className={`p-4 cursor-pointer transition-all duration-200 ${
                          selectedConversation?._id === conversation._id 
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="relative flex-shrink-0">
                            <div className={`w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center ring-2 ${
                              selectedConversation?._id === conversation._id ? 'ring-blue-300' : 'ring-white'
                            }`}>
                              <span className="text-white text-lg font-semibold">
                                {otherParticipant?.name?.charAt(0) || '?'}
                              </span>
                            </div>
                            {isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold text-gray-900 truncate">
                                {otherParticipant?.name || 'Unknown User'}
                              </p>
                              <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                {conversation.lastActivity && formatTime(conversation.lastActivity)}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full font-medium capitalize">
                                {otherParticipant?.role || 'user'}
                              </span>
                              {isOnline && (
                                <span className="text-xs text-green-500 font-medium">• Online</span>
                              )}
                            </div>
                            
                            {otherParticipant?.currentCompany && (
                              <p className="text-xs text-gray-500 mb-2">
                                {otherParticipant.currentCompany}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <p className="text-sm truncate text-gray-500">
                                {conversation.lastMessage?.content || 'No messages yet'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col bg-white ${!selectedConversation && 'hidden md:flex'}`}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className="p-2 rounded-xl hover:bg-gray-100 md:hidden transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center ring-2 ring-blue-100">
                          <span className="text-white text-lg font-semibold">
                            {selectedConversation.participant?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        {isUserOnline(selectedConversation.participant?._id) && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      
                      <div>
                        <p className="font-semibold text-gray-900">
                          {selectedConversation.participant?.name || 'Unknown User'}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full font-medium capitalize">
                            {selectedConversation.participant?.role || 'user'}
                          </span>
                          {isUserOnline(selectedConversation.participant?._id) ? (
                            <span className="text-xs text-green-500 font-medium">• Online</span>
                          ) : (
                            <span className="text-xs text-gray-400">• Offline</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                        <Phone className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                        <Video className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-400">No messages yet. Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message, idx) => {
                      console.log('Rendering message:', message);
                      const isCurrentUser = isCurrentUserMessage(message);
                      const prevMessage = idx > 0 ? messages[idx - 1] : null;
                      const showAvatar = !prevMessage || isCurrentUserMessage(prevMessage) !== isCurrentUser;
                      
                      // Get message content from different possible fields
                      const messageText = message.content || message.message || message.text || message.body || '';
                      
                      return (
                        <div
                          key={message._id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-end space-x-2 max-w-md ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            {showAvatar && !isCurrentUser && (
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-semibold">
                                  {selectedConversation.participant?.name?.charAt(0) || '?'}
                                </span>
                              </div>
                            )}
                            
                            <div
                              className={`px-4 py-3 rounded-2xl shadow-sm ${
                                isCurrentUser
                                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-sm'
                                  : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
                              }`}
                            >
                              <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                                {messageText || '[No content]'}
                              </p>
                              <div className={`flex items-center justify-end space-x-1 mt-1 ${
                                isCurrentUser ? 'text-white/80' : 'text-gray-400'
                              }`}>
                                {message.createdAt && (
                                  <span className="text-xs">
                                    {formatMessageTime(message.createdAt)}
                                  </span>
                                )}
                                {isCurrentUser && (
                                  message.status === 'sending' ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Check className="w-3 h-3" />
                                  )
                                )}
                              </div>
                            </div>
                            
                            {showAvatar && isCurrentUser && (
                              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-semibold">
                                  {user?.name?.charAt(0) || 'Y'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                  <div className="flex items-end space-x-2">
                    <button
                      type="button"
                      className="p-3 rounded-xl hover:bg-gray-100 transition-colors flex-shrink-0"
                    >
                      <Paperclip className="w-5 h-5 text-gray-600" />
                    </button>
                    
                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Type a message..."
                        rows={1}
                        className="w-full px-4 py-3 pr-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-gray-900 resize-none"
                        style={{ minHeight: '48px', maxHeight: '120px' }}
                      />
                      <button
                        type="button"
                        className="absolute right-3 bottom-3 p-1 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Smile className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                    
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg disabled:shadow-none flex-shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* No conversation selected */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <MessageCircle className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">
                    Welcome to AlumniConnect Messages
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Select a conversation from the sidebar to start chatting with alumni and students
                  </p>
                  <button
                    onClick={() => setShowContacts(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg font-medium"
                  >
                    Start New Conversation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;