import React, { useState, useEffect } from 'react';
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
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import MentorSuggestions from '../AI/MentorSuggestions';
import SetupProfile from '../AI/SetupProfile';
import MentorshipDashboard from '../AI/MentorshipDashboard';
import PostsPage from '../Posts/PostsPage';

// Student-specific Navbar Component
const StudentNavbar = ({ activeTab, onTabChange, onLogout, user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const studentTabs = [
    { id: 'overview', name: 'Overview', icon: Home },
    { id: 'ai-matching', name: 'AI Matching', icon: Brain },
    { id: 'my-mentorships', name: 'My Mentorships', icon: Users },
    { id: 'posts', name: 'Alumni Posts', icon: FileText },
    { id: 'messages', name: 'Messages', icon: MessageSquare },
    { id: 'setup-profile', name: 'Setup Profile', icon: Settings }
  ];

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
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
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

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {studentTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onTabChange(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
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

  debug('StudentDashboard', 'Component mounted', { user: user?.name, activeTab });

  // Stats data with fallbacks
  const stats = [
    {
      id: 'connections',
      name: 'Alumni Connections',
      value: '24',
      change: '+12%',
      changeColor: 'text-green-600',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      id: 'posts',
      name: 'Alumni Posts',
      value: '15',
      change: 'New this week',
      changeColor: 'text-blue-600',
      icon: MessageCircle,
      color: 'bg-green-500'
    },
    {
      id: 'jobs',
      name: 'Job Applications',
      value: '7',
      change: '3 pending',
      changeColor: 'text-orange-600',
      icon: Briefcase,
      color: 'bg-purple-500'
    },
    {
      id: 'mentorships',
      name: 'Mentorship Sessions',
      value: '5',
      change: '1 scheduled',
      changeColor: 'text-green-600',
      icon: BookOpen,
      color: 'bg-orange-500'
    }
  ];

  // Recent activities data
  const recentActivities = [
    {
      id: 1,
      type: 'connection',
      message: 'John Doe accepted your connection request',
      time: '2 hours ago',
      icon: User,
      color: 'text-blue-600'
    },
    {
      id: 2,
      type: 'event',
      message: 'New event: Tech Career Fair 2024',
      time: '4 hours ago',
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      id: 3,
      type: 'job',
      message: 'New job posting: Frontend Developer at TechCorp',
      time: '1 day ago',
      icon: Briefcase,
      color: 'text-purple-600'
    },
    {
      id: 4,
      type: 'message',
      message: 'Sarah Wilson sent you a message',
      time: '2 days ago',
      icon: MessageCircle,
      color: 'text-orange-600'
    }
  ];

  // Upcoming events data
  const upcomingEvents = [
    {
      id: 1,
      title: 'Career Guidance Workshop',
      date: 'Dec 15, 2024',
      time: '2:00 PM',
      attendees: 45,
      type: 'Workshop'
    },
    {
      id: 2,
      title: 'Alumni Networking Meet',
      date: 'Dec 18, 2024',
      time: '6:00 PM',
      attendees: 120,
      type: 'Networking'
    },
    {
      id: 3,
      title: 'Industry Expert Talk',
      date: 'Dec 22, 2024',
      time: '11:00 AM',
      attendees: 200,
      type: 'Seminar'
    }
  ];

  const handleTabChange = (tabId) => {
    debug('StudentDashboard', 'Tab change attempted', { from: activeTab, to: tabId });
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
        case 'messages':
          // Navigate to messages page - this will use the route from App.js
          window.location.href = '/messages';
          return <div>Redirecting to messages...</div>;
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
    <div className="min-h-screen bg-gray-50">
      {/* Student-specific Navbar */}
      <StudentNavbar 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        onLogout={logout}
        user={user}
      />

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
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
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {renderContent()}
      </div>
    </div>
  );
};

// Enhanced OverviewTab component with loading states and error handling
const OverviewTab = ({ stats, recentActivities, upcomingEvents, onNavigateToPosts, loading }) => {
  const [localLoading, setLocalLoading] = useState(false);

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
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening in your alumni network today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div 
              key={stat.id}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600 truncate">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className={`text-sm mt-2 ${stat.changeColor} truncate`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center flex-shrink-0 ml-4`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
              <button 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                onClick={() => debug('OverviewTab', 'View all activities clicked')}
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div 
                    key={activity.id} 
                    className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                    onClick={() => debug('OverviewTab', 'Activity clicked', activity)}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <IconComponent className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
              <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50 rounded-r-lg transition-colors cursor-pointer"
                  onClick={() => debug('OverviewTab', 'Event clicked', event)}
                >
                  <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{event.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{event.date} • {event.time}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {event.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {event.attendees} attending
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button 
              className="w-full mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              onClick={() => debug('OverviewTab', 'View all events clicked')}
            >
              View All Events
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionButton
              icon={MessageCircle}
              label="Read Alumni Posts"
              color="blue"
              onClick={() => handleQuickAction('posts')}
              loading={localLoading}
            />
            <QuickActionButton
              icon={Calendar}
              label="Join Event"
              color="green"
              onClick={() => handleQuickAction('events')}
              loading={localLoading}
            />
            <QuickActionButton
              icon={Briefcase}
              label="Browse Jobs"
              color="purple"
              onClick={() => handleQuickAction('jobs')}
              loading={localLoading}
            />
            <QuickActionButton
              icon={BookOpen}
              label="Get Mentorship"
              color="orange"
              onClick={() => handleQuickAction('mentorship')}
              loading={localLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Quick Action Button Component
const QuickActionButton = ({ icon: Icon, label, color, onClick, loading }) => {
  const colorClasses = {
    blue: 'hover:border-blue-300 hover:bg-blue-50 group-hover:text-blue-600',
    green: 'hover:border-green-300 hover:bg-green-50 group-hover:text-green-600',
    purple: 'hover:border-purple-300 hover:bg-purple-50 group-hover:text-purple-600',
    orange: 'hover:border-orange-300 hover:bg-orange-50 group-hover:text-orange-600'
  };

  return (
    <button 
      onClick={onClick}
      disabled={loading}
      className={`flex flex-col items-center p-4 rounded-lg border border-gray-200 transition-colors group min-h-[100px] ${
        colorClasses[color]
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {loading ? (
        <RefreshCw className="w-8 h-8 text-gray-400 mb-2 animate-spin" />
      ) : (
        <Icon className={`w-8 h-8 text-gray-600 mb-2 ${colorClasses[color].split(' ').find(cls => cls.includes('group-hover:'))}`} />
      )}
      <span className="text-sm font-medium text-gray-900 text-center">{label}</span>
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