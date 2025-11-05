import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  Users, 
  Send, 
  ArrowLeft, 
  Moon, 
  Sun,
  Home,
  Brain,
  FileText,
  Settings,
  LogOut,
  Bell,
  Search,
  GraduationCap
} from 'lucide-react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';

// Student Navbar Component (copied from StudentDashboard)
const StudentNavbar = ({ activeTab, onTabChange, onLogout, user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const studentTabs = [
    { id: 'overview', name: 'Overview', icon: Home },
    { id: 'ai-matching', name: 'AI Matching', icon: Brain },
    { id: 'my-mentorships', name: 'My Mentorships', icon: Users },
    { id: 'posts', name: 'Alumni Posts', icon: FileText },
    { id: 'messages', name: 'Messages', icon: MessageCircle },
    { id: 'setup-profile', name: 'Setup Profile', icon: Settings }
  ];

  const handleTabClick = (tabId) => {
    if (tabId === 'messages') {
      // Already on messages page, do nothing or refresh
      return;
    }
    
    // For other tabs, navigate to dashboard with the tab
    navigate('/dashboard');
    // You might want to pass the tab state to dashboard or use context
    setTimeout(() => {
      onTabChange(tabId);
    }, 100);
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Student Portal</h1>
              <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {studentTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === 'messages'; // Always active for messages page
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:block relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3 bg-gray-50 rounded-lg px-3 py-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0) || 'S'}
                </span>
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-medium text-gray-800">{user?.name}</p>
                <p className="text-gray-500 capitalize">Student</p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const MessagingPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [contacts, setContacts] = useState([]);
  const [showContacts, setShowContacts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [darkMode, setDarkMode] = useState(false); // Changed to light mode by default for consistency
  const messagesEndRef = useRef(null);
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket.IO connection and other effects remain the same...
  useEffect(() => {
    if (user && token) {
      const newSocket = io('http://localhost:5000', {
        auth: { token }
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to server');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      newSocket.on('newMessage', (data) => {
        console.log('New message received:', data);
        
        if (data.conversationId === selectedConversation?._id) {
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

      newSocket.on('userTyping', (data) => {
        if (data.conversationId === selectedConversation?._id) {
          setTypingUsers(prev => ({
            ...prev,
            [data.userId]: { name: data.name, isTyping: true }
          }));
        }
      });

      newSocket.on('userStoppedTyping', (data) => {
        setTypingUsers(prev => {
          const updated = { ...prev };
          delete updated[data.userId];
          return updated;
        });
      });

      return () => {
        newSocket.close();
        setSocket(null);
        setOnlineUsers([]);
        setTypingUsers({});
      };
    }
  }, [user, token, selectedConversation]);

  useEffect(() => {
    if (socket && selectedConversation) {
      socket.emit('joinConversation', selectedConversation._id);
      
      return () => {
        socket.emit('leaveConversation', selectedConversation._id);
      };
    }
  }, [socket, selectedConversation]);

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

    try {
      await axios.post(`/api/messages/${selectedConversation._id}`, {
        content: messageContent
      });
      
      console.log('Message sent successfully');
      
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
      setNewMessage(messageContent);
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
      if (error.response?.data?.conversationId) {
        const existingConv = conversations.find(c => c._id === error.response.data.conversationId);
        if (existingConv) {
          handleConversationSelect(existingConv);
        }
      } else {
        alert('Failed to start conversation');
      }
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    if (socket && selectedConversation) {
      socket.emit('typing', { conversationId: selectedConversation._id });
      
      clearTimeout(window.typingTimeout);
      window.typingTimeout = setTimeout(() => {
        socket.emit('stopTyping', { conversationId: selectedConversation._id });
      }, 1000);
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.some(u => u.userId === userId);
  };

  const isCurrentUserMessage = (message) => {
    const currentUserId = user?.id || user?._id || user?.userId;
    const messageSenderId = message.sender?._id || message.sender?.id || message.senderId;
    
    return currentUserId === messageSenderId;
  };

  // Mock function for navbar tab change
  const handleTabChange = (tabId) => {
    console.log('Tab changed to:', tabId);
    // This would be handled by the dashboard context
  };

  // Use light theme to match the dashboard
  const themeClasses = {
    bg: {
      primary: 'bg-gray-50',
      secondary: 'bg-white',
      tertiary: 'bg-gray-100',
      input: 'bg-white',
    },
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-700',
      muted: 'text-gray-500',
    },
    border: 'border-gray-200',
    hover: {
      bg: 'hover:bg-gray-100',
      text: 'hover:text-gray-900',
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add Student Navbar */}
      <StudentNavbar 
        activeTab="messages" 
        onTabChange={handleTabChange} 
        onLogout={logout}
        user={user}
      />

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-200px)]">
          <div className="flex h-full">
            {/* Sidebar */}
            <div className={`w-full md:w-1/3 ${themeClasses.bg.secondary} ${themeClasses.border} flex flex-col border-r`}>
              {/* Header */}
              <div className={`p-4 ${themeClasses.border} border-b`}>
                <div className="flex items-center justify-between">
                  <h1 className={`text-xl font-semibold flex items-center ${themeClasses.text.primary}`}>
                    <MessageCircle className="w-6 h-6 mr-2 text-blue-500" />
                    Messages
                    {socket?.connected && (
                      <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
                    )}
                  </h1>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowContacts(!showContacts)}
                      className={`p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors`}
                    >
                      <Users className="w-5 h-5" />
                    </button>
                  </div>
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
                    <h3 className={`font-medium mb-4 ${themeClasses.text.primary}`}>
                      Start New Conversation
                    </h3>
                    {contacts.length === 0 ? (
                      <p className={`text-center py-8 ${themeClasses.text.muted}`}>
                        No contacts available
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {contacts.map(contact => (
                          <div
                            key={contact._id}
                            onClick={() => startNewConversation(contact)}
                            className={`p-3 rounded-lg cursor-pointer ${themeClasses.hover.bg} transition-colors`}
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
                                <p className={`font-medium text-sm ${themeClasses.text.primary}`}>
                                  {contact.name}
                                </p>
                                <p className={`text-xs ${themeClasses.text.muted} capitalize`}>
                                  {contact.role} • {contact.department}
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
                        <p className={themeClasses.text.muted}>No conversations yet</p>
                        <p className={`text-sm ${themeClasses.text.muted} mt-1`}>
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
                            className={`p-4 cursor-pointer border-b ${themeClasses.border} ${
                              selectedConversation?._id === conversation._id 
                                ? 'bg-blue-50 border-blue-200' 
                                : themeClasses.hover.bg
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
                                  <p className={`font-medium truncate ${themeClasses.text.primary}`}>
                                    {otherParticipant?.name}
                                  </p>
                                  {isUserOnline(otherParticipant?._id) && (
                                    <span className="text-xs text-green-500 flex-shrink-0">online</span>
                                  )}
                                </div>
                                <p className={`text-sm truncate ${themeClasses.text.muted} capitalize`}>
                                  {otherParticipant?.role}
                                </p>
                                {conversation.lastMessage && (
                                  <p className={`text-sm truncate ${themeClasses.text.muted}`}>
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
            <div className={`flex-1 flex flex-col ${themeClasses.bg.primary} ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className={`p-4 border-b ${themeClasses.border} ${themeClasses.bg.secondary}`}>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className={`p-2 rounded-lg md:hidden ${themeClasses.hover.bg}`}
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
                        <p className={`font-medium ${themeClasses.text.primary}`}>
                          {selectedConversation.participant?.name}
                        </p>
                        <p className={`text-sm ${themeClasses.text.muted} capitalize`}>
                          {selectedConversation.participant?.role}
                          {isUserOnline(selectedConversation.participant?._id) && (
                            <span className="text-green-500"> • online</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map(message => {
                      const isCurrentUser = isCurrentUserMessage(message);
                      
                      return (
                        <div
                          key={message._id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isCurrentUser
                                ? 'bg-blue-500 text-white'
                                : `bg-gray-100 ${themeClasses.text.primary}`
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              isCurrentUser ? 'text-blue-100' : themeClasses.text.muted
                            }`}>
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Typing indicator */}
                    {Object.keys(typingUsers).length > 0 && (
                      <div className="flex justify-start">
                        <div className={`px-4 py-2 rounded-lg bg-gray-100 ${themeClasses.text.primary}`}>
                          <div className="flex items-center space-x-1">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 rounded-full animate-bounce bg-gray-500"></div>
                              <div className="w-2 h-2 rounded-full animate-bounce bg-gray-500" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 rounded-full animate-bounce bg-gray-500" style={{animationDelay: '0.2s'}}></div>
                            </div>
                            <span className={`text-xs ml-2 ${themeClasses.text.muted}`}>
                              {Object.values(typingUsers)[0]?.name} is typing...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className={`p-4 border-t ${themeClasses.border} ${themeClasses.bg.secondary}`}>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={handleInputChange}
                        placeholder="Type a message..."
                        className={`flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeClasses.bg.input} ${themeClasses.text.primary} ${themeClasses.border} border`}
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
                    <h3 className={`text-lg font-medium mb-2 ${themeClasses.text.primary}`}>
                      Welcome to Messages
                    </h3>
                    <p className={themeClasses.text.muted}>
                      Select a conversation or start a new one to begin messaging
                    </p>
                    {socket?.connected ? (
                      <p className="text-green-500 text-sm mt-2">Connected - Real-time messaging active</p>
                    ) : (
                      <p className="text-red-500 text-sm mt-2">Disconnected - Messages may be delayed</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;