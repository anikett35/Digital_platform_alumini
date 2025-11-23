import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Users, 
  Send, 
  ArrowLeft,
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile
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
  const [searchTerm, setSearchTerm] = useState('');
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

    const optimisticMessage = {
      _id: `temp_${Date.now()}`,
      content: messageContent,
      sender: {
        _id: user?.id || user?._id || user?.userId,
        name: user?.name
      },
      senderId: user?.id || user?._id || user?.userId,
      createdAt: new Date().toISOString(),
      conversationId: selectedConversation._id,
      isOptimistic: true
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const response = await axios.post(`/api/messages/${selectedConversation._id}`, {
        content: messageContent
      });
      
      if (response.data.message) {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === optimisticMessage._id ? response.data.message : msg
          )
        );
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
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
    
    if (message.isOptimistic) {
      return true;
    }
    
    return String(currentUserId) === String(messageSenderId);
  };

  const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatConversationTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.participant?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-120px)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar - Inbox */}
        <div className={`w-full md:w-96 bg-white border-r border-gray-200 flex flex-col ${selectedConversation && !embedded ? 'hidden md:flex' : 'flex'}`}>
          {/* Inbox Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <MessageCircle className="w-7 h-7 mr-3 text-purple-600" />
              Inbox
            </h1>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : showContacts ? (
              /* Contacts List */
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Start New Conversation</h3>
                  <button
                    onClick={() => setShowContacts(false)}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    Back
                  </button>
                </div>
                {contacts.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No contacts available</p>
                ) : (
                  <div className="space-y-2">
                    {contacts.map(contact => (
                      <div
                        key={contact._id}
                        onClick={() => startNewConversation(contact)}
                        className="p-3 rounded-xl cursor-pointer hover:bg-purple-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-lg font-semibold">
                                {contact.name.charAt(0)}
                              </span>
                            </div>
                            {isUserOnline(contact._id) && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{contact.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{contact.role}</p>
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
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 font-medium mb-2">No conversations yet</p>
                    <button
                      onClick={() => setShowContacts(true)}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Start a new conversation
                    </button>
                  </div>
                ) : (
                  filteredConversations.map(conversation => {
                    const otherParticipant = conversation.participant;
                    const isSelected = selectedConversation?._id === conversation._id;
                    
                    return (
                      <div
                        key={conversation._id}
                        onClick={() => handleConversationSelect(conversation)}
                        className={`p-4 cursor-pointer border-b border-gray-100 transition-all ${
                          isSelected 
                            ? 'bg-purple-50 border-l-4 border-l-purple-600' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-lg font-semibold">
                                {otherParticipant?.name?.charAt(0) || '?'}
                              </span>
                            </div>
                            {isUserOnline(otherParticipant?._id) && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className={`font-semibold truncate ${isSelected ? 'text-purple-900' : 'text-gray-900'}`}>
                                {otherParticipant?.name}
                              </p>
                              {conversation.lastMessage && (
                                <span className="text-xs text-gray-500 ml-2">
                                  {formatConversationTime(conversation.lastMessage.createdAt)}
                                </span>
                              )}
                            </div>
                            {conversation.lastMessage ? (
                              <p className="text-sm text-gray-500 truncate">
                                {conversation.lastMessage.content}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-400 italic">No messages yet</p>
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

          {/* New Conversation Button */}
          {!showContacts && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowContacts(true)}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all font-semibold"
              >
                <Users className="w-5 h-5" />
                <span>New Conversation</span>
              </button>
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-gray-50 ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="relative">
                      <div className="w-11 h-11 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {selectedConversation.participant?.name?.charAt(0)}
                        </span>
                      </div>
                      {isUserOnline(selectedConversation.participant?._id) && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {selectedConversation.participant?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {isUserOnline(selectedConversation.participant?._id) ? (
                          <span className="text-green-500 flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                            Online
                          </span>
                        ) : (
                          'Offline'
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <Phone className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <Video className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <MessageCircle className="w-10 h-10 text-purple-600" />
                    </div>
                    <p className="text-gray-500 text-lg font-medium mb-2">No messages yet</p>
                    <p className="text-gray-400 text-sm">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isCurrentUser = isCurrentUserMessage(message);
                    const showAvatar = index === 0 || 
                      isCurrentUserMessage(messages[index - 1]) !== isCurrentUser;
                    
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-end space-x-2 max-w-md ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          {!isCurrentUser && showAvatar && (
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-semibold">
                                {selectedConversation.participant?.name?.charAt(0)}
                              </span>
                            </div>
                          )}
                          {!isCurrentUser && !showAvatar && (
                            <div className="w-8"></div>
                          )}
                          <div>
                            <div
                              className={`px-4 py-3 rounded-2xl shadow-sm ${
                                isCurrentUser
                                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-sm'
                                  : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                              }`}
                            >
                              <p className="text-sm font-medium break-words">{message.content}</p>
                            </div>
                            <p className={`text-xs mt-1 ${
                              isCurrentUser ? 'text-right text-gray-400' : 'text-left text-gray-400'
                            }`}>
                              {formatMessageTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-end space-x-3">
                  <button
                    type="button"
                    className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Paperclip className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Type a message..."
                      rows="1"
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                      style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Smile className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
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
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-12 h-12 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">
                  Welcome to Messages
                </h3>
                <p className="text-gray-500 mb-6 max-w-sm">
                  Select a conversation from the left or start a new one to begin messaging
                </p>
                <button
                  onClick={() => setShowContacts(true)}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-semibold"
                >
                  <Users className="w-5 h-5" />
                  <span>Start Conversation</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;