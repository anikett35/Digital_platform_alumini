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
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PostsPage from '../Posts/PostsPage';
import SetupProfile from '../AI/SetupProfile';
import MentorshipDashboard from '../AI/MentorshipDashboard';

// Updated Alumni-specific Navbar Component with StudentNavbar styling
const AlumniNavbar = ({ activeTab, onTabChange, onLogout, user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const alumniTabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'posts', name: 'Community Posts', icon: FileText },
    { id: 'mentorship', name: 'Mentorship', icon: Users },
    { id: 'messages', name: 'Messages', icon: MessageSquare },
    { id: 'setup-profile', name: 'Mentor Profile', icon: Settings }
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleTabClick = (tabId) => {
    if (tabId === 'messages') {
      window.location.href = '/messages';
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
              <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                AlumniConnect
              </h1>
              <p className="text-xs text-gray-500">Welcome, {user?.name?.split(' ')[0]}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 bg-gray-50 rounded-xl p-1.5">
            {alumniTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-green-700 shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-white rounded-lg shadow-sm"></div>
                  )}
                  <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-green-600' : ''}`} />
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
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 lg:p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 group">
              <Bell className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>

            {/* User Menu - Fixed Alignment */}
            <div className="hidden sm:flex items-center space-x-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl px-3 lg:px-4 py-2 border border-green-100">
              <div className="w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center shadow-md mr-2">
                <span className="text-white text-sm font-semibold">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="hidden md:block text-sm text-left">
                <p className="font-semibold text-gray-800 leading-tight">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || 'Alumni'}</p>
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
              {alumniTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 shadow-sm'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/30">
      {/* Updated Alumni-specific Navbar */}
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