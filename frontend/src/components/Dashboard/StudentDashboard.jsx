import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, Users, Settings, User, Calendar, Briefcase, BookOpen, MessageCircle, FileText,
  AlertCircle, RefreshCw, Bell, Search, LogOut, Menu, X, Home, GraduationCap,
  MessageSquare, TrendingUp, Award, Target, Sparkles, ArrowRight, Clock, MapPin,
  Maximize2, Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
// Assuming these components exist in the specified paths
import MentorSuggestions from '../AI/MentorSuggestions';
import SetupProfile from '../AI/SetupProfile';
import MentorshipDashboard from '../AI/MentorshipDashboard';
import PostsPage from '../Posts/PostsPage';
import MessagingPage from '../Messaging/MessagingPage';
import Chatbot from '../Common/Chatbot';

// --- CONFIGURATION ---
const PRIMARY_COLOR_HEX = '#0A74DA'; // Deep Ocean Blue
const ACCENT_COLOR_HEX = '#00C49F'; // Vibrant Teal
const PRIMARY_TW_COLOR = 'blue'; // Tailwind equivalent for shades
const ACCENT_TW_COLOR = 'teal'; // Tailwind equivalent for shades

// Tailwind Utility for the new gradient look
const PRIMARY_GRADIENT = `from-${PRIMARY_TW_COLOR}-600 to-${PRIMARY_TW_COLOR}-700`; // New Primary Gradient
const ACCENT_GRADIENT = `from-${ACCENT_TW_COLOR}-500 to-${ACCENT_TW_COLOR}-600`; // New Accent Gradient
const WELCOME_GRADIENT = 'from-blue-600 via-indigo-600 to-purple-600'; // Richer header gradient

// Debug logger
const debug = (component, message, data = null) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${component}] ${message}`, data || '');
  }
};

// --- StudentNavbar Component (Refined) ---
const StudentNavbar = ({ activeTab, onTabChange, onLogout, user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const studentTabs = [
    { id: 'overview', name: 'Dashboard', icon: Home },
    { id: 'ai-matching', name: 'AI Match', icon: Brain },
    { id: 'my-mentorships', name: 'Mentorships', icon: Users },
    { id: 'posts', name: 'Community', icon: FileText },
    { id: 'messages', name: 'Messages', icon: MessageSquare },
    { id: 'setup-profile', name: 'Profile', icon: Settings }
  ];

  const handleTabClick = (tabId) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-xl' : 'bg-white shadow-md'
    }`}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className={`w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br ${WELCOME_GRADIENT} rounded-xl flex items-center justify-center shadow-lg`}>
              <GraduationCap className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className={`text-xl lg:text-2xl font-extrabold bg-gradient-to-r ${WELCOME_GRADIENT} bg-clip-text text-transparent`}>
                AlumniConnect
              </h1>
              <p className="text-xs text-gray-500">Welcome, **{user?.name?.split(' ')[0] || 'User'}**</p>
            </div>
          </div>

          {/* Desktop Navigation (Cleaned up, using new colors) */}
          <div className="hidden lg:flex items-center space-x-1 bg-gray-50 rounded-full p-1.5 shadow-inner border border-gray-100">
            {studentTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const activeClass = `bg-white shadow-lg text-${PRIMARY_TW_COLOR}-600 ring-2 ring-${PRIMARY_TW_COLOR}-100`;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`relative flex items-center space-x-2 px-5 py-2 rounded-full font-medium transition-all duration-200 text-sm ${
                    isActive
                      ? activeClass
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? `text-${PRIMARY_TW_COLOR}-600` : ''}`} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 lg:space-x-3">
            {/* Search (Simplified look) */}
            <div className="hidden md:block relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                className={`pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-offset-1 focus:ring-${PRIMARY_TW_COLOR}-300 focus:border-${PRIMARY_TW_COLOR}-400 w-48 lg:w-64 transition-all duration-200 text-sm`}
              />
            </div>

            {/* Notifications */}
            <button className={`relative p-2 lg:p-2.5 rounded-full hover:bg-gray-100 transition-all duration-200 group border border-transparent hover:border-gray-200`}>
              <Bell className={`w-5 h-5 text-gray-600 group-hover:text-${PRIMARY_TW_COLOR}-600 transition-colors`} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Avatar */}
            <div className="group relative">
                <div className={`w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-${PRIMARY_TW_COLOR}-600 to-${ACCENT_TW_COLOR}-500 rounded-full flex items-center justify-center shadow-md cursor-pointer`}>
                    <span className="text-white text-base font-semibold">
                        {user?.name?.charAt(0) || 'S'}
                    </span>
                </div>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="hidden sm:block p-2 lg:p-2.5 rounded-full hover:bg-red-50 text-red-600 transition-all duration-200 hover:shadow-md"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4">
            <div className="space-y-1">
              {studentTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isActive
                        ? `bg-${PRIMARY_TW_COLOR}-50 text-${PRIMARY_TW_COLOR}-700 border border-${PRIMARY_TW_COLOR}-200 shadow-sm`
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                    {isActive && <ArrowRight className="w-4 h-4 ml-auto" />}
                  </button>
                );
              })}
              <button
                onClick={onLogout}
                className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all duration-200 mt-4 border-t border-gray-100 pt-4"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// --- StudentDashboard Component (Refined) ---
const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  debug('StudentDashboard', 'Component mounted', { user: user?.name, activeTab });

  const stats = [
    {
      id: 'connections', name: 'Alumni Connections', value: '24', change: '+12%', trend: 'up',
      icon: Users, gradient: PRIMARY_GRADIENT, bgGradient: `from-${PRIMARY_TW_COLOR}-50 to-${PRIMARY_TW_COLOR}-100`
    },
    {
      id: 'posts', name: 'New Community Posts', value: '15', change: '+5 new', trend: 'up',
      icon: MessageCircle, gradient: ACCENT_GRADIENT, bgGradient: `from-${ACCENT_TW_COLOR}-50 to-${ACCENT_TW_COLOR}-100`
    },
    {
      id: 'jobs', name: 'Job Applications', value: '7', change: '3 pending', trend: 'neutral',
      icon: Briefcase, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100'
    },
    {
      id: 'mentorships', name: 'Active Mentors', value: '5', change: '1 scheduled', trend: 'up',
      icon: Award, gradient: 'from-pink-500 to-red-500', bgGradient: 'from-pink-50 to-red-100'
    }
  ];

  const recentActivities = [
    { id: 1, type: 'connection', message: 'John Doe accepted your connection request', time: '2 hours ago', icon: User, color: PRIMARY_TW_COLOR, avatar: 'JD' },
    { id: 2, type: 'event', message: 'New event: Tech Career Fair 2024', time: '4 hours ago', icon: Calendar, color: ACCENT_TW_COLOR, avatar: '📅' },
    { id: 3, type: 'job', message: 'New job posting: Frontend Developer at TechCorp', time: '1 day ago', icon: Briefcase, color: 'purple', avatar: '💼' },
    { id: 4, type: 'message', message: 'Sarah Wilson sent you a message', time: '2 days ago', icon: MessageCircle, color: 'orange', avatar: 'SW' }
  ];

  const upcomingEvents = [
    { id: 1, title: 'Career Guidance Workshop', date: 'Dec 15, 2024', time: '2:00 PM', attendees: 45, type: 'Workshop', location: 'Virtual', color: PRIMARY_TW_COLOR },
    { id: 2, title: 'Alumni Networking Meet', date: 'Dec 18, 2024', time: '6:00 PM', attendees: 120, type: 'Networking', location: 'Campus Hall', color: 'purple' },
    { id: 3, title: 'Industry Expert Talk', date: 'Dec 22, 2024', time: '11:00 AM', attendees: 200, type: 'Seminar', location: 'Auditorium', color: 'green' }
  ];

  const handleTabChange = (tabId) => {
    debug('StudentDashboard', 'Tab change attempted', { from: activeTab, to: tabId });
    setActiveTab(tabId);
    setError(null);
  };

  const renderContent = () => {
    try {
      debug('StudentDashboard', 'Rendering content', { activeTab });
      
      switch (activeTab) {
        case 'overview':
          return (
            <OverviewTab 
              stats={stats}
              recentActivities={recentActivities}
              upcomingEvents={upcomingEvents}
              onNavigateToPosts={() => handleTabChange('posts')}
              onNavigateToMessages={() => handleTabChange('messages')}
              loading={loading}
              primaryColor={PRIMARY_TW_COLOR}
              accentColor={ACCENT_TW_COLOR}
            />
          );
        case 'ai-matching':
          return <TabContentWrapper title="AI Mentor Matching 🧠"><MentorSuggestions /></TabContentWrapper>;
        case 'my-mentorships':
          return <TabContentWrapper title="My Active Mentorships 🤝"><MentorshipDashboard /></TabContentWrapper>;
        case 'posts':
          return <TabContentWrapper title="Alumni Community Posts 💬"><PostsPage /></TabContentWrapper>;
        case 'messages':
          return (
            <TabContentWrapper title="Messages" icon={MessageSquare}>
              <MessagingPage embedded={true} />
            </TabContentWrapper>
          );
        case 'setup-profile':
          return <TabContentWrapper title="Profile & Settings ⚙️"><SetupProfile /></TabContentWrapper>;
        default:
          return <TabContentWrapper title="Error"><ErrorFallback error="Unknown Tab" onRetry={() => handleTabChange('overview')} /></TabContentWrapper>;
      }
    } catch (err) {
      console.error('Error rendering tab content:', err);
      setError(`Failed to load ${activeTab} content`);
      return <ErrorFallback error={error} onRetry={() => window.location.reload()} />;
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        onLogout={logout}
        user={user}
      />

      {/* Error Banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex justify-between items-center">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content: Add padding-bottom to ensure chatbot doesn't overlap important content */}
      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {renderContent()}
      </main>

      {/* AI Chatbot */}
      <Chatbot />
    </div>
  );
};

// New Wrapper to keep all tab contents visually consistent and contained
const TabContentWrapper = ({ title, children, icon: Icon }) => (
    <div className="min-h-[70vh] bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6 border-b pb-4 border-gray-100">
            {Icon && <Icon className={`w-7 h-7 text-${PRIMARY_TW_COLOR}-600`} />}
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        </div>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

// --- OverviewTab Component (Fully Refined) ---
const OverviewTab = ({ stats, recentActivities, upcomingEvents, onNavigateToPosts, onNavigateToMessages, loading, primaryColor, accentColor }) => {
  const [localLoading, setLocalLoading] = useState(false);
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Student';

  const handleQuickAction = async (action) => {
    setLocalLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLocalLoading(false);
    if (action === 'posts') {
      onNavigateToPosts();
    } else if (action === 'messages') {
      onNavigateToMessages();
    }
  };

  // 1. Map for Activity Icon Backgrounds (Gradients)
  // This map uses the color string from the recentActivities data
  const activityGradientMap = {
    [primaryColor]: PRIMARY_GRADIENT,
    [accentColor]: ACCENT_GRADIENT,
    'purple': 'from-purple-500 to-purple-600',
    'orange': 'from-orange-500 to-red-500', 
    'blue': PRIMARY_GRADIENT, // Redundancy for easy lookup
    'teal': ACCENT_GRADIENT, // Redundancy for easy lookup
  };

  // 2. Map for Event Card Styling (Border/BG)
  // This map uses the color string from the upcomingEvents data
  const eventColorMap = {
    [primaryColor]: `text-${primaryColor}-600 bg-${primaryColor}-50 border-${primaryColor}-500`,
    [accentColor]: `text-${accentColor}-600 bg-${accentColor}-50 border-${accentColor}-500`,
    'purple': 'border-purple-500 bg-purple-50',
    'green': 'border-green-500 bg-green-50', 
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Welcome Header (Sophisticated Background) */}
      <div className={`relative overflow-hidden bg-gradient-to-r ${WELCOME_GRADIENT} rounded-2xl shadow-2xl p-6 lg:p-10 transition-all duration-500`}>
        <div className="absolute inset-0 bg-black/20"></div> {/* Dark overlay for text contrast */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40 blur-3xl transform rotate-12"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            <span className="text-white text-sm font-semibold tracking-wider uppercase">Your Hub</span>
          </div>
          <h1 className="text-3xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">
            Hello, **{firstName}**! 👋
          </h1>
          <p className="text-blue-100 text-base lg:text-lg max-w-3xl font-light">
            You're making great progress! Check your latest stats and opportunities below.
          </p>
          <div className="mt-6">
            <button 
                onClick={() => handleQuickAction('setup-profile')}
                className={`flex items-center space-x-2 px-4 py-2 bg-white text-${primaryColor}-600 rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all`}
            >
                <span>Complete Your Profile</span>
                <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const gradient = stat.gradient;
          const textClasses = stat.trend === 'up' ? 'text-green-500' : 'text-gray-500';

          return (
            <div 
              key={stat.id}
              className={`group relative bg-white rounded-2xl shadow-lg transition-all duration-300 p-6 border border-gray-100 overflow-hidden transform hover:-translate-y-1 hover:ring-2 hover:ring-offset-1 hover:ring-${PRIMARY_TW_COLOR}-100`}
            >
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {stat.trend === 'up' && (
                    <TrendingUp className={`w-5 h-5 ${textClasses}`} />
                  )}
                </div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.name}</p>
                <p className="text-4xl font-extrabold text-gray-900 mb-2">{stat.value}</p>
                <p className={`text-sm flex items-center space-x-1 font-medium ${textClasses}`}>
                  <span>{stat.change}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid: Activities and Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Recent Activities (Main section, 2/3 width) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 h-full">
            <div className="flex items-center justify-between mb-6 border-b pb-4 border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Recent Activity Timeline</h2>
              <button className={`text-${primaryColor}-600 hover:text-${primaryColor}-700 text-sm font-semibold flex items-center space-x-1 transition-all`}>
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                // Use dedicated activityGradientMap
                const gradientClass = activityGradientMap[activity.color] || 'from-gray-400 to-gray-500';
                
                return (
                  <div 
                    key={activity.id} 
                    className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-all duration-200 cursor-pointer group border border-transparent"
                    onClick={() => debug('OverviewTab', 'Activity clicked', activity)}
                  >
                    <div className={`w-11 h-11 bg-gradient-to-br ${gradientClass} rounded-full flex items-center justify-center shadow-md flex-shrink-0`}>
                      <span className="text-white text-sm font-bold">{activity.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-medium text-gray-900 line-clamp-1">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{activity.time}</span>
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                );
              })}
            </div>
            <div className="mt-6 text-center">
                <button 
                    className={`text-${primaryColor}-600 hover:text-${primaryColor}-800 font-semibold text-sm transition-colors`}
                    onClick={() => handleQuickAction('messages')}
                >
                    See all messages and alerts
                </button>
            </div>
          </div>
        </div>

        {/* Upcoming Events (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6 border-b pb-4 border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
              <Maximize2 className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
            </div>
            <div className="space-y-4">
              {upcomingEvents.map((event) => {
                // Use dedicated eventColorMap
                const colorClasses = eventColorMap[event.color] || 'border-gray-500 bg-gray-50';
                
                return (
                  <div 
                    key={event.id} 
                    className={`border-l-4 ${colorClasses} pl-4 pr-3 py-3 rounded-r-xl transition-all duration-200 cursor-pointer hover:shadow-md group`}
                    onClick={() => debug('OverviewTab', 'Event clicked', event)}
                  >
                    <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-700 flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{event.date} • {event.time}</span>
                      </p>
                      <p className="text-gray-600 flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{event.location}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${colorClasses.split(' ').filter(c => c.startsWith('text-') || c.startsWith('bg-')).join(' ')}`}>
                        {event.type}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>**{event.attendees}** attending</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <button 
              className={`w-full mt-6 py-3 bg-gradient-to-r from-${accentColor}-500 to-${accentColor}-600 text-white rounded-xl font-semibold hover:shadow-xl transform hover:scale-[1.01] transition-all duration-200 flex items-center justify-center space-x-2`}
              onClick={() => debug('OverviewTab', 'View all events clicked')}
            >
                <Plus className="w-5 h-5" />
                <span>Register for Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions (Refined) */}
      <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100">
        <div className="flex items-center space-x-2 mb-6 border-b pb-4 border-gray-100">
          <div className={`w-8 h-8 bg-gradient-to-br from-${primaryColor}-500 to-${accentColor}-500 rounded-lg flex items-center justify-center shadow-md`}>
            <Target className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Take Action Now</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          <QuickActionButton
            icon={FileText}
            label="Community Feed"
            gradient={PRIMARY_GRADIENT}
            onClick={() => handleQuickAction('posts')}
            loading={localLoading}
          />
          <QuickActionButton
            icon={Brain}
            label="Find a Mentor"
            gradient={ACCENT_GRADIENT}
            onClick={() => handleQuickAction('ai-matching')}
            loading={localLoading}
          />
          <QuickActionButton
            icon={Briefcase}
            label="Browse Jobs"
            gradient="from-purple-500 to-indigo-600"
            onClick={() => handleQuickAction('jobs')}
            loading={localLoading}
          />
          <QuickActionButton
            icon={MessageSquare}
            label="Messages"
            gradient="from-pink-500 to-red-500"
            onClick={() => handleQuickAction('messages')}
            loading={localLoading}
          />
        </div>
      </div>
    </div>
  );
};

// Reusable Quick Action Button Component (Refined)
const QuickActionButton = ({ icon: Icon, label, gradient, onClick, loading }) => {
  return (
    <button 
      onClick={onClick}
      disabled={loading}
      className="group relative overflow-hidden bg-white rounded-xl p-4 transition-all duration-300 shadow-sm hover:shadow-xl border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-center"
    >
      <div className="relative z-10 flex flex-col items-center space-y-3">
        {loading ? (
          <RefreshCw className={`w-14 h-14 text-gray-400 mb-2 animate-spin`} />
        ) : (
          <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        )}
        <span className="text-sm lg:text-base font-semibold text-gray-900 leading-tight">
          {label}
        </span>
      </div>
    </button>
  );
};

// Error Fallback Component (No change, remains functional)
const ErrorFallback = ({ error, onRetry }) => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center max-w-md">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h3>
      <p className="text-gray-600 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className={`bg-${PRIMARY_TW_COLOR}-500 text-white px-6 py-2 rounded-lg hover:bg-${PRIMARY_TW_COLOR}-600 transition-colors`}
      >
        Try Again
      </button>
    </div>
  </div>
);

export default StudentDashboard;