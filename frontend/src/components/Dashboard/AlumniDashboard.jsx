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
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PostsPage from '../Posts/PostsPage';
import SetupProfile from '../AI/SetupProfile';
import MentorshipDashboard from '../AI/MentorshipDashboard';

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
      case 'setup-profile':
        return <SetupProfile />;
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-800">Alumni Dashboard</h1>
                      <p className="text-gray-600">Welcome back, {user?.name || 'Alumni'}!</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
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
                    <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user?.name?.charAt(0) || 'A'}
                        </span>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-gray-800">{user?.name}</p>
                        <p className="text-gray-500 capitalize">{user?.role}</p>
                      </div>
                    </div>
                    
                    {/* Logout Button */}
                    <button
                      onClick={logout}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

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
                    },
                    { 
                      title: 'Support Institution', 
                      description: 'Make donations and contributions',
                      icon: Heart, 
                      color: 'from-indigo-400 to-indigo-600',
                      action: () => console.log('Navigate to Donations')
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

  return renderContent();
};

export default AlumniDashboard;