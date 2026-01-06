import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, Users, Settings, User, Calendar, MessageCircle, FileText,
  AlertCircle, RefreshCw, Bell, Search, LogOut, Menu, X, Home, GraduationCap,
  MessageSquare, TrendingUp, Award, Target, Sparkles, ArrowRight, Clock, MapPin,
  Maximize2, UserCircle, Loader, Activity, BarChart3, Send, BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import MentorSuggestions from '../AI/MentorSuggestions';
import SetupProfile from '../AI/SetupProfile';
import MentorshipDashboard from '../AI/MentorshipDashboard';
import PostsPage from '../Posts/PostsPage';
import MessagingPage from '../Messaging/MessagingPage';
import EventsPage from '../Events/EventsPage';
import Chatbot from '../Common/Chatbot';
import ProfilesList from '../Profiles/ProfilesList';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Professional Purple Color Scheme (from reference image)
const COLORS = {
  primary: '#6366F1',        // Indigo/Purple
  primaryLight: '#818CF8',   // Light Purple
  primaryDark: '#4F46E5',    // Dark Purple
  accent: '#EC4899',         // Pink accent
  success: '#10B981',        // Green
  error: '#EF4444',          // Red
  background: '#F9FAFB',     // Light gray background
  cardBg: '#FFFFFF'          // White card background
};

const debug = (component, message, data = null) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${component}] ${message}`, data || '');
  }
};

// Helper function
const getTimeAgo = (date) => {
  if (!date) return 'recently';
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
};

// ==================== NAVBAR COMPONENT ====================
const StudentNavbar = ({ activeTab, onTabChange, onLogout, user, notificationCount = 0 }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const studentTabs = [
    { id: 'overview', name: 'Dashboard', icon: Home },
    { id: 'alumni', name: 'Alumni', icon: UserCircle },
    { id: 'ai-matching', name: 'AI Match', icon: Brain },
    { id: 'my-mentorships', name: 'Mentorships', icon: Users },
    { id: 'events', name: 'Events', icon: Calendar },
    { id: 'posts', name: 'Community', icon: FileText },
    { id: 'messages', name: 'Messages', icon: MessageSquare },
    { id: 'setup-profile', name: 'Profile', icon: Settings }
  ];

  const handleTabClick = (tabId) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-full mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div 
              className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md"
              style={{ 
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})` 
              }}
            >
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 
                className="text-xl font-bold"
                style={{ color: COLORS.primary }}
              >
                AlumniConnect
              </h1>
              <p className="text-xs text-gray-500">Welcome, {user?.name?.split(' ')[0] || 'User'}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {studentTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm ${
                    isActive 
                      ? 'text-white shadow-md' 
                      : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                  }`}
                  style={isActive ? { 
                    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})` 
                  } : {}}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                  {tab.id === 'messages' && notificationCount > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center"
                      style={{ backgroundColor: COLORS.error }}
                    >
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm w-40 placeholder-gray-400"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-purple-50 transition-all">
              <Bell className="w-5 h-5 text-gray-600" />
              {notificationCount > 0 && (
                <span 
                  className="absolute top-1 right-1 w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS.error }}
                ></span>
              )}
            </button>

            {/* User Avatar */}
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-md cursor-pointer ring-2 ring-purple-200"
              style={{ 
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})` 
              }}
            >
              <span className="text-white text-sm font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || 'S'}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="hidden sm:flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-all text-sm font-medium"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>

            {/* Mobile Menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <div className="space-y-1">
              {studentTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-medium transition-all ${
                      isActive ? 'bg-purple-50' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    style={isActive ? { 
                      borderLeft: `4px solid ${COLORS.primary}`,
                      color: COLORS.primary 
                    } : {}}
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

// ==================== OVERVIEW TAB COMPONENT ====================
const OverviewTab = ({ dashboardData, onTabChange, loading, onRefresh }) => {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Student';

  const statsConfig = [
    {
      id: 'connections',
      name: 'Alumni Connections',
      value: dashboardData.stats.connections,
      icon: Users,
      color: COLORS.primary,
      bgColor: '#EEF2FF'
    },
    {
      id: 'posts',
      name: 'Community Posts',
      value: dashboardData.stats.posts,
      icon: MessageCircle,
      color: COLORS.accent,
      bgColor: '#FCE7F3'
    },
    {
      id: 'mentorships',
      name: 'Active Mentors',
      value: dashboardData.stats.mentorships,
      icon: Award,
      color: '#8B5CF6',
      bgColor: '#F3E8FF'
    },
    {
      id: 'events',
      name: 'Upcoming Events',
      value: dashboardData.stats.events,
      icon: Calendar,
      color: '#3B82F6',
      bgColor: '#DBEAFE'
    }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div 
        className="relative overflow-hidden rounded-2xl shadow-lg p-10"
        style={{ 
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 50%, ${COLORS.accent} 100%)` 
        }}
      >
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="w-5 h-5 text-yellow-200 animate-pulse" />
                <span className="text-white/90 text-sm font-semibold tracking-wide uppercase">Your Dashboard</span>
              </div>
              <h1 className="text-5xl font-extrabold text-white mb-3">
                Hello, {firstName}! 👋
              </h1>
              <p className="text-white/90 text-lg max-w-2xl">
                Stay connected with your alumni network and track your progress
              </p>
            </div>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="hidden md:flex items-center space-x-2 px-5 py-3 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/30 transition-all disabled:opacity-50 font-medium shadow-lg"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat) => {
          const Icon = stat.icon;
          
          return (
            <div 
              key={stat.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl p-6 border border-gray-100 transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: stat.color }}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex items-center space-x-1 text-green-500">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-semibold">+12%</span>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-500 mb-2">{stat.name}</p>
              <p className="text-4xl font-extrabold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${COLORS.primary}15` }}
              >
                <Activity className="w-5 h-5" style={{ color: COLORS.primary }} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
            </div>
            <button 
              onClick={() => onTabChange('messages')}
              className="text-sm font-semibold flex items-center space-x-1 hover:underline transition-all"
              style={{ color: COLORS.primary }}
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {dashboardData.recentActivities.length === 0 ? (
              <div className="text-center py-16">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${COLORS.primary}10` }}
                >
                  <MessageCircle className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-500 text-lg font-medium">No recent activities</p>
                <p className="text-gray-400 text-sm mt-1">Your activities will appear here</p>
              </div>
            ) : (
              dashboardData.recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div 
                    key={activity.id} 
                    className="flex items-center space-x-4 p-4 rounded-xl transition-all cursor-pointer group hover:shadow-md"
                    style={{ backgroundColor: `${COLORS.primary}05` }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${COLORS.primary}10`}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${COLORS.primary}05`}
                  >
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center shadow-md flex-shrink-0"
                      style={{ 
                        background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})` 
                      }}
                    >
                      <span className="text-white text-base font-bold">{activity.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-gray-900 line-clamp-1 mb-1">
                        {activity.message}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{activity.time}</span>
                      </p>
                    </div>
                    <ArrowRight 
                      className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" 
                      style={{ color: COLORS.primary }}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${COLORS.primary}15` }}
              >
                <Calendar className="w-5 h-5" style={{ color: COLORS.primary }} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Events</h2>
            </div>
            <button onClick={() => onTabChange('events')}>
              <Maximize2 className="w-5 h-5 text-gray-400 hover:text-gray-700 transition-colors" />
            </button>
          </div>
          
          <div className="space-y-4">
            {dashboardData.upcomingEvents.length === 0 ? (
              <div className="text-center py-12">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: `${COLORS.primary}10` }}
                >
                  <Calendar className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 text-sm font-medium">No upcoming events</p>
              </div>
            ) : (
              dashboardData.upcomingEvents.map((event) => (
                <div 
                  key={event._id} 
                  className="border-l-4 pl-4 pr-3 py-4 rounded-r-xl cursor-pointer hover:shadow-lg transition-all group"
                  style={{ 
                    borderLeftColor: COLORS.primary,
                    backgroundColor: `${COLORS.primary}08`
                  }}
                  onClick={() => onTabChange('events')}
                >
                  <h3 className="font-bold text-gray-900 text-base mb-3 line-clamp-2 group-hover:underline">
                    {event.title}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700 flex items-center space-x-2">
                      <Calendar className="w-4 h-4" style={{ color: COLORS.primary }} />
                      <span className="font-semibold">{formatDate(event.date)}</span>
                      <span className="text-gray-500">• {event.time}</span>
                    </p>
                    <p className="text-gray-600 flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="line-clamp-1">{event.location}</span>
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                    <span 
                      className="text-xs font-bold px-3 py-1.5 rounded-full text-white"
                      style={{ backgroundColor: COLORS.primary }}
                    >
                      {event.type}
                    </span>
                    <span className="text-sm text-gray-600 flex items-center space-x-1 font-medium">
                      <Users className="w-4 h-4" />
                      <span>{event.attendees?.filter(a => a.status === 'registered').length || 0} attending</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <button 
            onClick={() => onTabChange('events')}
            className="w-full mt-6 py-3.5 text-white rounded-xl font-bold hover:shadow-xl transform hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 text-base"
            style={{ 
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})` 
            }}
          >
            <Calendar className="w-5 h-5" />
            <span>View All Events</span>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
            style={{ 
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})` 
            }}
          >
            <Target className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <QuickActionButton 
            icon={UserCircle} 
            label="Alumni Directory" 
            onClick={() => onTabChange('alumni')}
            color={COLORS.primary}
          />
          <QuickActionButton 
            icon={FileText} 
            label="Community" 
            onClick={() => onTabChange('posts')}
            color={COLORS.accent}
          />
          <QuickActionButton 
            icon={Brain} 
            label="AI Match" 
            onClick={() => onTabChange('ai-matching')}
            color="#8B5CF6"
          />
          <QuickActionButton 
            icon={Calendar} 
            label="Events" 
            onClick={() => onTabChange('events')}
            color="#3B82F6"
          />
          <QuickActionButton 
            icon={MessageSquare} 
            label="Messages" 
            onClick={() => onTabChange('messages')}
            color={COLORS.primary}
          />
          <QuickActionButton 
            icon={Settings} 
            label="Profile Setup" 
            onClick={() => onTabChange('setup-profile')}
            color="#10B981"
          />
        </div>
      </div>
    </div>
  );
};

// ==================== QUICK ACTION BUTTON ====================
const QuickActionButton = ({ icon: Icon, label, onClick, color }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex flex-col items-center space-y-3 bg-white rounded-2xl p-5 border-2 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
      style={{ 
        borderColor: isHovered ? color : '#E5E7EB',
        backgroundColor: isHovered ? `${color}05` : 'white'
      }}
    >
      <div 
        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300"
        style={{ backgroundColor: color }}
      >
        <Icon className="w-8 h-8 text-white" />
      </div>
      <span className="text-sm font-bold text-gray-900 text-center leading-tight">
        {label}
      </span>
    </button>
  );
};

// ==================== TAB CONTENT WRAPPER ====================
const TabContentWrapper = ({ title, children, icon: Icon }) => (
  <div className="min-h-[calc(100vh-5rem)] bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
    <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-gray-200">
      {Icon && (
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${COLORS.primary}15` }}
        >
          <Icon className="w-6 h-6" style={{ color: COLORS.primary }} />
        </div>
      )}
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
    </div>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

// ==================== ERROR FALLBACK ====================
const ErrorFallback = ({ error, onRetry }) => (
  <div className="flex items-center justify-center py-20">
    <div className="text-center max-w-md">
      <div 
        className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ backgroundColor: `${COLORS.error}15` }}
      >
        <AlertCircle className="w-12 h-12" style={{ color: COLORS.error }} />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">Something went wrong</h3>
      <p className="text-gray-600 mb-8 text-lg">{error}</p>
      <button
        onClick={onRetry}
        className="px-8 py-4 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        style={{ 
          background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})` 
        }}
      >
        Try Again
      </button>
    </div>
  </div>
);

// ==================== MAIN DASHBOARD COMPONENT ====================
const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      connections: 0,
      posts: 0,
      mentorships: 0,
      events: 0
    },
    upcomingEvents: [],
    recentActivities: [],
    unreadMessages: 0
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  debug('StudentDashboard', 'Component mounted', { user: user?.name, activeTab });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const headers = { Authorization: `Bearer ${token}` };

      const [eventsRes, postsRes, mentorshipsRes, profilesRes, conversationsRes] = await Promise.all([
        axios.get(`${API_URL}/events?status=upcoming&limit=4`, { headers }).catch(() => ({ data: { events: [] } })),
        axios.get(`${API_URL}/posts?limit=10`, { headers }).catch(() => ({ data: { posts: [] } })),
        axios.get(`${API_URL}/mentorships/student`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/profiles?limit=50`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/conversations`, { headers }).catch(() => ({ data: [] }))
      ]);

      const stats = {
        connections: Array.isArray(profilesRes.data) ? profilesRes.data.length : 0,
        posts: postsRes.data?.posts?.length || 0,
        mentorships: Array.isArray(mentorshipsRes.data) 
          ? mentorshipsRes.data.filter(m => m.status === 'active').length 
          : 0,
        events: eventsRes.data?.events?.length || 0
      };

      const upcomingEvents = eventsRes.data?.events || [];
      const recentActivities = [];
      
      (postsRes.data?.posts || []).slice(0, 2).forEach(post => {
        recentActivities.push({
          id: `post-${post._id}`,
          type: 'post',
          message: `New post: ${post.title || post.content?.substring(0, 50)}...`,
          time: getTimeAgo(post.createdAt),
          icon: FileText,
          avatar: post.author?.name?.charAt(0) || 'P'
        });
      });

      (eventsRes.data?.events || []).slice(0, 2).forEach(event => {
        recentActivities.push({
          id: `event-${event._id}`,
          type: 'event',
          message: `Upcoming: ${event.title}`,
          time: getTimeAgo(event.createdAt),
          icon: Calendar,
          avatar: '📅'
        });
      });

      const unreadMessages = Array.isArray(conversationsRes.data)
        ? conversationsRes.data.filter(c => c.unreadCount > 0).length
        : 0;

      setDashboardData({
        stats,
        upcomingEvents,
        recentActivities: recentActivities.slice(0, 4),
        unreadMessages
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'overview' && user) {
      fetchDashboardData();
    }
  }, [activeTab, user, fetchDashboardData]);

  const handleTabChange = (tabId) => {
    debug('StudentDashboard', 'Tab change', { from: activeTab, to: tabId });
    setActiveTab(tabId);
    setError(null);
  };

  const renderContent = () => {
    if (loading && activeTab === 'overview') {
      return (
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${COLORS.primary}15` }}
            >
              <Loader className="w-10 h-10 animate-spin" style={{ color: COLORS.primary }} />
            </div>
            <p className="text-gray-600 text-xl font-semibold">Loading your dashboard...</p>
            <p className="text-gray-400 text-sm mt-2">Please wait a moment</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab 
            dashboardData={dashboardData}
            onTabChange={handleTabChange}
            loading={loading}
            onRefresh={fetchDashboardData}
          />
        );
      case 'alumni':
        return <TabContentWrapper title="Alumni Directory" icon={UserCircle}><ProfilesList /></TabContentWrapper>;
      case 'ai-matching':
        return <TabContentWrapper title="AI Mentor Matching" icon={Brain}><MentorSuggestions /></TabContentWrapper>;
      case 'my-mentorships':
        return <TabContentWrapper title="My Mentorships" icon={Users}><MentorshipDashboard /></TabContentWrapper>;
      case 'events':
        return <TabContentWrapper title="Events Calendar" icon={Calendar}><EventsPage embedded={true} /></TabContentWrapper>;
      case 'posts':
        return <TabContentWrapper title="Community Posts" icon={FileText}><PostsPage /></TabContentWrapper>;
      case 'messages':
        return <TabContentWrapper title="Messages" icon={MessageSquare}><MessagingPage embedded={true} /></TabContentWrapper>;
      case 'setup-profile':
        return <TabContentWrapper title="Profile & Settings" icon={Settings}><SetupProfile /></TabContentWrapper>;
      default:
        return <ErrorFallback error="Unknown Tab" onRetry={() => handleTabChange('overview')} />;
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
          <AlertCircle className="w-24 h-24 mx-auto mb-6" style={{ color: COLORS.error }} />
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Authentication Required</h2>
          <p className="text-gray-600 text-xl">Please log in to access the dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
      <StudentNavbar 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        onLogout={logout}
        user={user}
        notificationCount={dashboardData.unreadMessages}
      />

      {error && (
        <div className="max-w-full mx-auto px-6 pt-4">
          <div 
            className="border-l-4 p-5 rounded-xl flex justify-between items-center shadow-lg"
            style={{ 
              borderLeftColor: COLORS.error,
              backgroundColor: `${COLORS.error}10`
            }}
          >
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 mr-3" style={{ color: COLORS.error }} />
              <p className="font-semibold text-lg" style={{ color: COLORS.error }}>{error}</p>
            </div>
            <button onClick={() => setError(null)} className="hover:opacity-70">
              <X className="w-5 h-5" style={{ color: COLORS.error }} />
            </button>
          </div>
        </div>
      )}

      <main className="max-w-full mx-auto px-6 py-6">
        {renderContent()}
      </main>

      <Chatbot />
    </div>
  );
};

export default StudentDashboard;
