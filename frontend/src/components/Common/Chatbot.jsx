import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Bot,
  User,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hi! I'm your Alumni Platform Assistant 👋 How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const messageCounter = useRef(2);
  const { user } = useAuth();

  const quickActions = [
    { id: 1, label: "🎓 Find a Mentor", action: "find_mentor" },
    { id: 2, label: "📅 Upcoming Events", action: "events" },
    { id: 3, label: "💼 Job Opportunities", action: "jobs" },
    { id: 4, label: "❓ How to Use Platform", action: "help" },
  ];

  // Auto scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- BOT RESPONSES MAP ---
  const botResponseMap = useCallback(
    (message) => {
      const msg = message.toLowerCase();

      const responses = [
        {
          keywords: ["mentor", "mentorship"],
          text:
            "Great! I can help you find a mentor. 🎯\n\n" +
            "Our AI-powered matching system connects students with alumni based on:\n" +
            "• Skills & Interests\n• Industry Preferences\n• Career Goals\n\n" +
            "Would you like to see your personalized mentor suggestions?",
          suggestions: ["Show me mentors", "Setup my profile", "Learn more"],
        },
        {
          keywords: ["event", "calendar"],
          text:
            "📅 Here are the upcoming events:\n\n" +
            "🎪 Career Fair 2025 - Dec 15\n🤝 Alumni Networking - Dec 18\n💡 Industry Expert Talk - Dec 22\n\n" +
            "Would you like to register for any of these events?",
          suggestions: ["Register for event", "View all events", "Set reminder"],
        },
        {
          keywords: ["job", "career", "opportunity"],
          text:
            "💼 I can help you explore career opportunities!\n\n" +
            "We have:\n• 25+ Active Job Postings\n• Alumni connections\n• Career guidance\n\n" +
            "What type of role are you looking for?",
          suggestions: ["Browse jobs", "Get career advice", "Connect with recruiters"],
        },
        {
          keywords: ["post", "share", "community"],
          text:
            "📝 Our community is thriving!\n\n" +
            "You can:\n• Share experiences\n• Ask questions\n• Like & comment\n• Filter categories\n\n" +
            "Ready to join the conversation?",
          suggestions: ["View posts", "Create a post", "Community guidelines"],
        },
        {
          keywords: ["message", "chat", "contact"],
          text:
            "💬 Messaging lets you:\n\n" +
            "• Chat with alumni\n• Send mentorship requests\n• Get instant notifications\n• See who's online\n\n" +
            "Want to start a conversation?",
          suggestions: ["Open messages", "Find alumni"],
        },
        {
          keywords: ["profile", "setup", "account"],
          text:
            "⚙️ Let's improve your profile!\n\n" +
            `Profile completion: ${
              user?.role === "student" ? "75%" : "85%"
            }\n\n` +
            "Improve AI matching by:\n• Adding skills\n• Setting goals\n• Uploading a photo\n\n" +
            "Shall we complete your profile?",
          suggestions: ["Complete profile", "View profile", "Privacy settings"],
        },
        {
          keywords: ["help", "how", "guide"],
          text:
            "🆘 I'm here to help!\n\nPopular topics:\n" +
            "• Finding mentors\n• Connecting with alumni\n• Posting in community\n• Events\n• AI matching\n\n" +
            "What would you like to learn?",
          suggestions: ["Platform tour", "Video tutorial", "FAQs"],
        },
        {
          keywords: ["hi", "hello", "hey"],
          text:
            `Hello ${user?.name || "there"}! 👋\n\n` +
            "I can help with:\n• Mentors\n• Events\n• Careers\n• Platform usage\n\n" +
            "What would you like?",
          suggestions: ["Find mentor", "Browse events", "Get help"],
        },
        {
          keywords: ["thank", "thanks"],
          text: "You're welcome! 😊\n\nAnything else?",
          suggestions: ["Explore more", "Done for now"],
        },
      ];

      for (const res of responses) {
        if (res.keywords.some((k) => msg.includes(k))) {
          return res;
        }
      }

      // Default response
      return {
        text:
          `I understand you're asking about: "${message}"\n\n` +
          "I can help with:\n• Mentors\n• Events\n• Jobs\n• Platform navigation\n\nWhat would you like?",
        suggestions: ["Find mentor", "View events", "Browse jobs", "Get help"],
      };
    },
    [user]
  );

  // --- SEND MESSAGE ---
  const handleSendMessage = useCallback(
    async (text = inputMessage) => {
      if (!text.trim()) return;

      // Add user message
      const userMsg = {
        id: messageCounter.current++,
        type: "user",
        text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputMessage("");
      setIsTyping(true);

      setTimeout(() => {
        const bot = botResponseMap(text);

        const botMsg = {
          id: messageCounter.current++,
          type: "bot",
          text: bot.text,
          suggestions: bot.suggestions,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      }, 1200);
    },
    [inputMessage, botResponseMap]
  );

  const handleQuickAction = (action) => {
    const map = {
      find_mentor: "I want to find a mentor",
      events: "Show me upcoming events",
      jobs: "What job opportunities are available?",
      help: "How do I use this platform?",
    };
    handleSendMessage(map[action]);
  };

  return (
    <>
      {/* FLOATING BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-2xl
          flex items-center justify-center hover:scale-110 transition-all duration-300 z-50 group animate-bounce-slow"
        >
          <MessageCircle className="w-7 h-7 text-white" />
        </button>
      )}

      {/* CHAT WINDOW */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300 ${
            isMinimized ? "h-16" : "h-[600px]"
          }`}
        >
          {/* HEADER */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">AI Assistant</h3>
                <span className="text-white/80 text-xs flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Online
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsMinimized((p) => !p)}
                className="p-2 hover:bg-white/20 rounded-lg"
              >
                <Minimize2 className="text-white" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg"
              >
                <X className="text-white" />
              </button>
            </div>
          </div>

          {/* BODY */}
          {!isMinimized && (
            <>
              {/* MESSAGES */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-start space-x-2 max-w-[80%] ${
                        msg.type === "user"
                          ? "flex-row-reverse space-x-reverse"
                          : ""
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          msg.type === "user"
                            ? "bg-gradient-to-br from-blue-500 to-purple-600"
                            : "bg-gradient-to-br from-purple-500 to-pink-600"
                        }`}
                      >
                        {msg.type === "user" ? (
                          <User className="text-white" />
                        ) : (
                          <Bot className="text-white" />
                        )}
                      </div>

                      {/* Bubble */}
                      <div>
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            msg.type === "user"
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                              : "bg-white border border-gray-200"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-line">
                            {msg.text}
                          </p>
                        </div>

                        {/* Suggestions */}
                        {msg.suggestions && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {msg.suggestions.map((s, i) => (
                              <button
                                key={i}
                                onClick={() => handleSendMessage(s)}
                                className="px-3 py-1.5 bg-white border border-purple-200 text-purple-600 rounded-full text-xs hover:bg-purple-50"
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        )}

                        <span className="text-xs text-gray-400 mt-1 block">
                          {msg.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                      <Bot className="text-white" />
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

              {/* QUICK ACTIONS */}
              {messages.length === 1 && (
                <div className="p-4 bg-white border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Quick Actions:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleQuickAction(action.action)}
                        className="px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-purple-200 rounded-lg text-xs font-medium hover:from-blue-100 hover:to-purple-100"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* INPUT */}
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim()}
                    className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white disabled:opacity-50"
                  >
                    <Send />
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

      {/* Extra animations */}
      <style jsx>{`
        @keyframes bounce-slow {
          0%,
          100% {
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
