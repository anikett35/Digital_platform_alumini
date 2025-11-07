import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Minimize2,
  Bot,
  User,
  Sparkles,
  Loader
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hi! I'm your Alumni Platform Assistant 👋 How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  // Quick action buttons
  const quickActions = [
    { id: 1, label: '🎓 Find a Mentor', action: 'find_mentor' },
    { id: 2, label: '📅 Upcoming Events', action: 'events' },
    { id: 3, label: '💼 Job Opportunities', action: 'jobs' },
    { id: 4, label: '❓ How to Use Platform', action: 'help' }
  ];

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // AI Response Generator
  const generateBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Intelligent responses based on keywords
    if (message.includes('mentor') || message.includes('mentorship')) {
      return {
        text: "Great! I can help you find a mentor. 🎯\n\n" +
              "Our AI-powered matching system connects students with alumni based on:\n" +
              "• Skills & Interests\n" +
              "• Industry Preferences\n" +
              "• Career Goals\n\n" +
              "Would you like to see your personalized mentor suggestions?",
        suggestions: ['Show me mentors', 'Setup my profile', 'Learn more']
      };
    }
    
    if (message.includes('event') || message.includes('calendar')) {
      return {
        text: "📅 Here are the upcoming events:\n\n" +
              "🎪 Career Fair 2025 - Dec 15\n" +
              "🤝 Alumni Networking - Dec 18\n" +
              "💡 Industry Expert Talk - Dec 22\n\n" +
              "Would you like to register for any of these events?",
        suggestions: ['Register for event', 'View all events', 'Set reminder']
      };
    }
    
    if (message.includes('job') || message.includes('career') || message.includes('opportunity')) {
      return {
        text: "💼 I can help you explore career opportunities!\n\n" +
              "We have:\n" +
              "• 25+ Active Job Postings\n" +
              "• Direct connections with alumni at top companies\n" +
              "• Career guidance resources\n\n" +
              "What type of role are you looking for?",
        suggestions: ['Browse jobs', 'Get career advice', 'Connect with recruiters']
      };
    }
    
    if (message.includes('post') || message.includes('share') || message.includes('community')) {
      return {
        text: "📝 Our community is thriving!\n\n" +
              "You can:\n" +
              "• Share your experiences\n" +
              "• Ask questions to alumni\n" +
              "• Like and comment on posts\n" +
              "• Filter by categories (Career, Advice, Opportunities)\n\n" +
              "Ready to join the conversation?",
        suggestions: ['View posts', 'Create a post', 'Community guidelines']
      };
    }
    
    if (message.includes('message') || message.includes('chat') || message.includes('contact')) {
      return {
        text: "💬 Our messaging system lets you:\n\n" +
              "• Chat with alumni in real-time\n" +
              "• Send mentorship requests\n" +
              "• Get instant notifications\n" +
              "• See who's online\n\n" +
              "Want to start a conversation?",
        suggestions: ['Open messages', 'Find alumni to connect']
      };
    }
    
    if (message.includes('profile') || message.includes('setup') || message.includes('account')) {
      return {
        text: "⚙️ Let me help you with your profile!\n\n" +
              `Your current profile completion: ${user?.role === 'student' ? '75%' : '85%'}\n\n` +
              "To improve your AI matching:\n" +
              "• Add your skills and interests\n" +
              "• Set career goals\n" +
              "• Upload a professional photo\n\n" +
              "Shall we complete your profile now?",
        suggestions: ['Complete profile', 'View profile', 'Privacy settings']
      };
    }
    
    if (message.includes('help') || message.includes('how') || message.includes('guide')) {
      return {
        text: "🆘 I'm here to help!\n\n" +
              "Popular topics:\n" +
              "• How to find a mentor\n" +
              "• Connecting with alumni\n" +
              "• Posting in community\n" +
              "• Attending events\n" +
              "• Using AI matching\n\n" +
              "What would you like to learn about?",
        suggestions: ['Platform tour', 'Video tutorial', 'FAQs']
      };
    }
    
    if (message.includes('hi') || message.includes('hello') || message.includes('hey')) {
      return {
        text: `Hello ${user?.name || 'there'}! 👋\n\n` +
              "I'm your AI assistant for the Alumni Platform. I can help you with:\n" +
              "• Finding mentors\n" +
              "• Discovering events\n" +
              "• Career opportunities\n" +
              "• Platform navigation\n\n" +
              "What can I assist you with today?",
        suggestions: ['Find mentor', 'Browse events', 'Get help']
      };
    }
    
    if (message.includes('thank') || message.includes('thanks')) {
      return {
        text: "You're very welcome! 😊\n\n" +
              "Is there anything else I can help you with?",
        suggestions: ['Explore more', 'Done for now']
      };
    }
    
    // Default response
    return {
      text: "I understand you're asking about: \"" + userMessage + "\"\n\n" +
            "Let me help you with that! Here are some things I can assist with:\n" +
            "• Finding mentors and networking\n" +
            "• Upcoming events and registration\n" +
            "• Job opportunities and career advice\n" +
            "• Platform features and navigation\n\n" +
            "What would you like to explore?",
      suggestions: ['Find mentor', 'View events', 'Browse jobs', 'Get help']
    };
  };

  // Handle sending message
  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: messageText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const botResponse = generateBotResponse(messageText);
      
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: botResponse.text,
        suggestions: botResponse.suggestions,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  // Handle quick action click
  const handleQuickAction = (action) => {
    const actionMessages = {
      find_mentor: "I want to find a mentor",
      events: "Show me upcoming events",
      jobs: "What job opportunities are available?",
      help: "How do I use this platform?"
    };
    
    handleSendMessage(actionMessages[action]);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 z-50 group animate-bounce-slow"
        >
          <MessageCircle className="w-7 h-7 text-white" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></span>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"></span>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Need help? Chat with AI Assistant
            <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300 ${
          isMinimized ? 'h-16' : 'h-[600px]'
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">AI Assistant</h3>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white/80 text-xs">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Minimize2 className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[80%] ${
                      message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === 'user' 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                          : 'bg-gradient-to-br from-purple-500 to-pink-600'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                      
                      {/* Message Bubble */}
                      <div>
                        <div className={`rounded-2xl px-4 py-3 ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-800'
                        }`}>
                          <p className="text-sm whitespace-pre-line">{message.text}</p>
                        </div>
                        
                        {/* Suggestions */}
                        {message.suggestions && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {message.suggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="px-3 py-1.5 bg-white border border-purple-200 text-purple-600 rounded-full text-xs font-medium hover:bg-purple-50 transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        <span className="text-xs text-gray-400 mt-1 block">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              {messages.length === 1 && (
                <div className="p-4 bg-white border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Quick Actions:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleQuickAction(action.action)}
                        className="px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-purple-200 text-purple-700 rounded-lg text-xs font-medium hover:from-blue-100 hover:to-purple-100 transition-all"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim()}
                    className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  <Sparkles className="w-3 h-3 inline" /> Powered by AI
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        
        .delay-100 {
          animation-delay: 0.1s;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </>
  );
};

export default Chatbot;