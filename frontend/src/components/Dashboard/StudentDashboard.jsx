import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Users, 
  Settings, 
  User, 
  Calendar, 
  Briefcase, 
  BookOpen, 
  MessageCircle,
  FileText,
  AlertCircle,
  RefreshCw,
  Bell,
  Search,
  LogOut,
  Menu,
  X,
  Home,
  GraduationCap,
  MessageSquare,
  TrendingUp,
  Award,
  Target,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import MentorSuggestions from '../AI/MentorSuggestions';
import SetupProfile from '../AI/SetupProfile';
import MentorshipDashboard from '../AI/MentorshipDashboard';
import PostsPage from '../Posts/PostsPage';
import Chatbot from '../Common/Chatbot';

// Student-specific Navbar Component
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
    { id: 'overview', name: 'Overview', icon: Home },
    { id: 'ai-matching', name: 'AI Match', icon: Brain },
    { id: 'my-mentorships', name: 'Mentorships', icon: Users },
    { id: 'posts', name: 'Posts', icon: FileText },
    { id: 'messages', name: 'Messages', icon: MessageSquare },
    { id: 'setup-profile', name: 'Profile', icon: Settings }
  ];

  const handleTabClick = (tabId) => {
    if (tabId === 'messages') {
      navigate('/messages');
      return;
    }
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg' : 'bg-white shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AlumniConnect
              </h1>
              <p className="text-xs text-gray-500">Welcome, {user?.name?.split(' ')[0]}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 bg-gray-50 rounded-xl p-1.5">
            {studentTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-blue-700 shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-white rounded-lg shadow-sm"></div>
                  )}
                  <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-blue-600' : ''}`} />
                  <span className="relative z-10 text-sm">{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 lg:space-x-3">
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
            <button className="relative p-2 lg:p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 group">
              <Bell className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            {/* User Menu */}
            <div className="hidden sm:flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl px-3 lg:px-4 py-2 border border-blue-100">
              <div className="w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-semibold">
                  {user?.name?.charAt(0) || 'S'}
                </span>
              </div>
              <div className="hidden md:block text-sm">
                <p className="font-semibold text-gray-800 leading-tight">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role || 'Student'}</p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="hidden sm:block p-2 lg:p-2.5 rounded-xl hover:bg-red-50 text-red-600 transition-all duration-200 hover:scale-105"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4 animate-fadeIn">
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
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 shadow-sm'
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

// Debug logger
const debug = (component, message, data = null) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${component}] ${message}`, data || '');
  }
};

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  debug('StudentDashboard', 'Component mounted', { user: user?.name, activeTab });

  const stats = [
    {
      id: 'connections',
      name: 'Alumni Connections',
      value: '24',
      change: '+12%',
      trend: 'up',
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100'
    },
    {
      id: 'posts',
      name: 'Alumni Posts',
      value: '15',
      change: '+5 new',
      trend: 'up',
      icon: MessageCircle,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-100'
    },
    {
      id: 'jobs',
      name: 'Job Applications',
      value: '7',
      change: '3 pending',
      trend: 'neutral',
      icon: Briefcase,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100'
    },
    {
      id: 'mentorships',
      name: 'Active Mentors',
      value: '5',
      change: '1 scheduled',
      trend: 'up',
      icon: Award,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-100'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'connection',
      message: 'John Doe accepted your connection request',
      time: '2 hours ago',
      icon: User,
      color: 'blue',
      avatar: 'JD'
    },
    {
      id: 2,
      type: 'event',
      message: 'New event: Tech Career Fair 2024',
      time: '4 hours ago',
      icon: Calendar,
      color: 'green',
      avatar: '📅'
    },
    {
      id: 3,
      type: 'job',
      message: 'New job posting: Frontend Developer at TechCorp',
      time: '1 day ago',
      icon: Briefcase,
      color: 'purple',
      avatar: '💼'
    },
    {
      id: 4,
      type: 'message',
      message: 'Sarah Wilson sent you a message',
      time: '2 days ago',
      icon: MessageCircle,
      color: 'orange',
      avatar: 'SW'
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Career Guidance Workshop',
      date: 'Dec 15, 2024',
      time: '2:00 PM',
      attendees: 45,
      type: 'Workshop',
      location: 'Virtual',
      color: 'blue'
    },
    {
      id: 2,
      title: 'Alumni Networking Meet',
      date: 'Dec 18, 2024',
      time: '6:00 PM',
      attendees: 120,
      type: 'Networking',
      location: 'Campus Hall',
      color: 'purple'
    },
    {
      id: 3,
      title: 'Industry Expert Talk',
      date: 'Dec 22, 2024',
      time: '11:00 AM',
      attendees: 200,
      type: 'Seminar',
      location: 'Auditorium',
      color: 'green'
    }
  ];

  const handleTabChange = (tabId) => {
    debug('StudentDashboard', 'Tab change attempted', { from: activeTab, to: tabId });
    
    // Don't set activeTab for messages since we navigate away
    if (tabId === 'messages') {
      navigate('/messages');
      return;
    }
    
    setActiveTab(tabId);
    setError(null); // Clear errors on tab change
  };

  // Render content based on active tab with error boundary
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
              loading={loading}
            />
          );
        case 'ai-matching':
          return <MentorSuggestions />;
        case 'my-mentorships':
          return <MentorshipDashboard />;
        case 'posts':
          return <PostsPage />;
        case 'setup-profile':
          return <SetupProfile />;
        default:
          console.warn(`Unknown tab: ${activeTab}, falling back to overview`);
          return (
            <OverviewTab 
              stats={stats}
              recentActivities={recentActivities}
              upcomingEvents={upcomingEvents}
              onNavigateToPosts={() => handleTabChange('posts')}
              loading={loading}
            />
          );
      }
    } catch (err) {
      console.error('Error rendering tab content:', err);
      setError(`Failed to load ${activeTab} content`);
      return <ErrorFallback error={error} onRetry={() => window.location.reload()} />;
    }
  };

  // Clear error after 5 seconds
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Student-specific Navbar */}
      <StudentNavbar 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        onLogout={logout}
        user={user}
      />

      {/* Error Banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {renderContent()}
      </div>

      {/* AI Chatbot */}
      <Chatbot />
    </div>
  );
};

// Enhanced OverviewTab component with loading states and error handling
const OverviewTab = ({ stats, recentActivities, upcomingEvents, onNavigateToPosts, loading }) => {
  const [localLoading, setLocalLoading] = useState(false);
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Student';

  const handleQuickAction = async (action) => {
    setLocalLoading(true);
    debug('OverviewTab', 'Quick action triggered', { action });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLocalLoading(false);
    
    if (action === 'posts') {
      onNavigateToPosts();
    }
    // Other actions would be handled here
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-2xl lg:rounded-3xl shadow-2xl p-6 lg:p-8">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            <span className="text-white/90 text-sm font-medium">Welcome back!</span>
          </div>
          <h1 className="text-2xl lg:text-4xl font-bold text-white mb-2">
            Hey there, {firstName}! 👋
          </h1>
          <p className="text-blue-100 text-sm lg:text-base max-w-2xl">
            You're making great progress! Here's what's happening in your alumni network today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.id}
              className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 overflow-hidden transform hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {stat.trend === 'up' && (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                <p className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <p className="text-sm text-gray-500 flex items-center space-x-1">
                  <span>{stat.change}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center space-x-1 hover:space-x-2 transition-all">
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {recentActivities.map((activity) => {
                const colorClasses = {
                  blue: 'from-blue-500 to-blue-600',
                  green: 'from-green-500 to-emerald-600',
                  purple: 'from-purple-500 to-purple-600',
                  orange: 'from-orange-500 to-red-500'
                };
                
                return (
                  <div 
                    key={activity.id} 
                    className="flex items-start space-x-4 p-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 rounded-xl transition-all duration-200 cursor-pointer group border border-transparent hover:border-gray-200"
                    onClick={() => debug('OverviewTab', 'Activity clicked', activity)}
                  >
                    <div className={`w-11 h-11 bg-gradient-to-br ${colorClasses[activity.color]} rounded-xl flex items-center justify-center shadow-md flex-shrink-0 transform group-hover:scale-110 transition-transform`}>
                      <span className="text-white text-sm font-bold">{activity.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{activity.time}</span>
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Events</h2>
              </div>
            </div>
            <div className="space-y-4">
              {upcomingEvents.map((event) => {
                const colorClasses = {
                  blue: 'border-blue-500 bg-blue-50',
                  purple: 'border-purple-500 bg-purple-50',
                  green: 'border-green-500 bg-green-50'
                };
                
                return (
                  <div 
                    key={event.id} 
                    className={`border-l-4 ${colorClasses[event.color]} pl-4 pr-3 py-3 rounded-r-xl transition-all duration-200 cursor-pointer hover:shadow-md group`}
                    onClick={() => debug('OverviewTab', 'Event clicked', event)}
                  >
                    <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </h3>
                    <div className="space-y-1.5">
                      <p className="text-xs text-gray-600 flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{event.date} • {event.time}</span>
                      </p>
                      <p className="text-xs text-gray-600 flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{event.location}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${colorClasses[event.color]}`}>
                        {event.type}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{event.attendees}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <button 
              className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              onClick={() => debug('OverviewTab', 'View all events clicked')}
            >
              View All Events
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <QuickActionButton
            icon={MessageCircle}
            label="Alumni Posts"
            gradient="from-blue-500 to-blue-600"
            onClick={() => handleQuickAction('posts')}
            loading={localLoading}
          />
          <QuickActionButton
            icon={Calendar}
            label="Join Event"
            gradient="from-green-500 to-emerald-600"
            onClick={() => handleQuickAction('events')}
            loading={localLoading}
          />
          <QuickActionButton
            icon={Briefcase}
            label="Browse Jobs"
            gradient="from-purple-500 to-purple-600"
            onClick={() => handleQuickAction('jobs')}
            loading={localLoading}
          />
          <QuickActionButton
            icon={BookOpen}
            label="Get Mentorship"
            gradient="from-orange-500 to-red-500"
            onClick={() => handleQuickAction('mentorship')}
            loading={localLoading}
          />
        </div>
      </div>
    </div>
  );
};

// Reusable Quick Action Button Component
const QuickActionButton = ({ icon: Icon, label, gradient, onClick, loading }) => {
  return (
    <button 
      onClick={onClick}
      disabled={loading}
      className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 lg:p-6 transition-all duration-300 hover:shadow-xl border border-gray-200 hover:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      <div className="relative z-10 flex flex-col items-center space-y-2 lg:space-y-3">
        {loading ? (
          <RefreshCw className="w-12 h-12 lg:w-14 lg:h-14 text-gray-400 mb-2 animate-spin" />
        ) : (
          <div className={`w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
            <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
          </div>
        )}
        <span className="text-sm lg:text-base font-semibold text-gray-900 group-hover:text-white transition-colors text-center leading-tight">
          {label}
        </span>
      </div>
    </button>
  );
};

// Error Fallback Component
const ErrorFallback = ({ error, onRetry }) => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center max-w-md">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h3>
      <p className="text-gray-600 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

export default StudentDashboard;