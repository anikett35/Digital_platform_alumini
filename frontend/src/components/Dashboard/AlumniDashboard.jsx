import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Users, 
  Briefcase, 
  Calendar,
  Heart,
  TrendingUp,
  FileText,
  MessageCircle,
  Settings,
  Bell,
  Search,
  LogOut,
  Shield,
  Menu,
  X,
  Home,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PostsPage from '../Posts/PostsPage';
import SetupProfile from '../AI/SetupProfile';
import MentorshipDashboard from '../AI/MentorshipDashboard';

// Alumni-specific Navbar Component
const AlumniNavbar = ({ activeTab, onTabChange, onLogout, user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const alumniTabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'posts', name: 'Community Posts', icon: FileText },
    { id: 'mentorship', name: 'Mentorship', icon: Users },
    { id: 'messages', name: 'Messages', icon: MessageSquare },
    { id: 'setup-profile', name: 'Mentor Profile', icon: Settings }
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Alumni Portal</h1>
              <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {alumniTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-green-100 text-green-700 border border-green-200'
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
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
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
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-medium text-gray-800">{user?.name}</p>
                <p className="text-gray-500 capitalize">Alumni</p>
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
              {alumniTabs.map((tab) => {
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
                        ? 'bg-green-100 text-green-700 border border-green-200'
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

const AlumniDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Debug logging
  useEffect(() => {
    console.log('🔧 AlumniDashboard Debug Info:', {
      user: user ? `${user.name} (${user.role})` : 'No user',
      activeTab,
      timestamp: new Date().toISOString()
    });

    // Set debug info for development
    if (process.env.NODE_ENV === 'development') {
      setDebugInfo({
        userRole: user?.role,
        userId: user?._id,
        component: 'AlumniDashboard',
        lastRender: new Date().toLocaleTimeString()
      });
    }
  }, [user, activeTab]);

  // Mock notifications (replace with actual API call)
  useEffect(() => {
    const mockNotifications = [
      { id: 1, type: 'mentorship', message: 'New mentorship request from John Doe', read: false },
      { id: 2, type: 'post', message: 'Your post got 5 new likes', read: true },
      { id: 3, type: 'system', message: 'Profile setup reminder', read: false }
    ];
    setNotifications(mockNotifications);
  }, []);

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: GraduationCap, description: 'Overview and analytics' },
    { id: 'posts', name: 'Community Posts', icon: FileText, description: 'Share and engage with community' },
    { id: 'mentorship', name: 'Mentorship', icon: Users, description: 'Manage mentorship requests' },
    { id: 'messages', name: 'Messages', icon: MessageSquare, description: 'Chat with connections' },
    { id: 'setup-profile', name: 'Mentor Profile', icon: Settings, description: 'Setup AI matching profile' }
  ];

  const handleTabChange = (tabId) => {
    setLoading(true);
    console.log(`🔄 Switching to tab: ${tabId}`);
    
    // Simulate loading for better UX
    setTimeout(() => {
      setActiveTab(tabId);
      setLoading(false);
    }, 300);
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'posts':
        return <PostsPage />;
      case 'mentorship':
        return <MentorshipDashboard />;
      case 'messages':
        // Navigate to messages page - this will use the route from App.js
        window.location.href = '/messages';
        return <div>Redirecting to messages...</div>;
      case 'setup-profile':
        return <SetupProfile />;
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
            <div className="container mx-auto px-4 py-8">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                {/* Navigation Tabs */}
                <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center space-x-3 min-w-max ${
                        activeTab === tab.id
                          ? 'bg-green-500 text-white shadow-lg transform scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-semibold">{tab.name}</div>
                        <div className={`text-xs ${
                          activeTab === tab.id ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          {tab.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Profile Completion</h3>
                        <p className="text-2xl font-bold">85%</p>
                        <p className="text-green-100 text-sm">Almost there!</p>
                      </div>
                      <Shield className="w-8 h-8 opacity-80" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Mentorship</h3>
                        <p className="text-2xl font-bold">3</p>
                        <p className="text-blue-100 text-sm">Active mentees</p>
                      </div>
                      <Users className="w-8 h-8 opacity-80" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Posts</h3>
                        <p className="text-2xl font-bold">12</p>
                        <p className="text-purple-100 text-sm">This month</p>
                      </div>
                      <FileText className="w-8 h-8 opacity-80" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Connections</h3>
                        <p className="text-2xl font-bold">47</p>
                        <p className="text-orange-100 text-sm">Alumni network</p>
                      </div>
                      <TrendingUp className="w-8 h-8 opacity-80" />
                    </div>
                  </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { 
                      title: 'Share Knowledge', 
                      description: 'Create posts and share experiences',
                      icon: MessageCircle, 
                      color: 'from-blue-400 to-blue-600',
                      action: () => handleTabChange('posts')
                    },
                    { 
                      title: 'Mentorship Hub', 
                      description: 'Manage student connections',
                      icon: Users, 
                      color: 'from-purple-400 to-purple-600',
                      action: () => handleTabChange('mentorship')
                    },
                    { 
                      title: 'Messages', 
                      description: 'Chat with your connections',
                      icon: MessageSquare, 
                      color: 'from-teal-400 to-teal-600',
                      action: () => handleTabChange('messages')
                    },
                    { 
                      title: 'AI Profile Setup', 
                      description: 'Optimize your matching profile',
                      icon: Settings, 
                      color: 'from-teal-400 to-teal-600',
                      action: () => handleTabChange('setup-profile')
                    },
                    { 
                      title: 'Job Board', 
                      description: 'Post opportunities for students',
                      icon: Briefcase, 
                      color: 'from-orange-400 to-orange-600',
                      action: () => console.log('Navigate to Job Board')
                    },
                    { 
                      title: 'Events Calendar', 
                      description: 'Organize alumni meetups',
                      icon: Calendar, 
                      color: 'from-pink-400 to-pink-600',
                      action: () => console.log('Navigate to Events')
                    }
                  ].map((item, index) => (
                    <div
                      key={index}
                      onClick={item.action}
                      className={`bg-gradient-to-r ${item.color} rounded-xl p-6 text-white cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-xl`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                          <p className="opacity-90 text-sm">{item.description}</p>
                        </div>
                        <item.icon className="w-8 h-8 opacity-80 flex-shrink-0 ml-4" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Debug Information (Development only) */}
                {process.env.NODE_ENV === 'development' && debugInfo && (
                  <div className="mt-8 p-4 bg-gray-100 rounded-lg border">
                    <h4 className="font-semibold text-gray-800 mb-2">Debug Information</h4>
                    <pre className="text-xs text-gray-600">
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Alumni-specific Navbar */}
      <AlumniNavbar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={logout}
        user={user}
      />

      {renderContent()}
    </div>
  );
};

export default AlumniDashboard;