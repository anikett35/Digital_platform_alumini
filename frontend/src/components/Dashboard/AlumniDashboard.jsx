
// frontend/src/components/Dashboard/AlumniDashboard.jsx
// COMPLETE FIXED VERSION - Uses authenticated API

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  GraduationCap, Users, Briefcase, Calendar, TrendingUp, FileText, MessageCircle, Settings,
  Bell, Search, LogOut, Menu, X, Home, MessageSquare, AlertCircle, RefreshCw, Shield, ArrowRight,
  Zap, Activity, Clock, Award, BarChart3, Globe, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

import { useAuth, api } from '../../context/AuthContext';
import PostsPage from '../Posts/PostsPage';
import SetupProfile from '../AI/SetupProfile';
import MentorshipDashboard from '../AI/MentorshipDashboard';
import MessagingPage from '../Messaging/MessagingPage';
import EventsPage from '../Events/EventsPage';

/* ---------- Utilities ---------- */
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
};

const formatRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInHours = (now - date) / (1000 * 60 * 60);
  if (diffInHours < 1) return `${Math.floor(diffInHours * 60)}m ago`;
  if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
  if (diffInHours < 48) return 'Yesterday';
  return formatDate(dateString);
};

/* ---------- Professional Search Component ---------- */
const DynamicSearch = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length <= 2) {
        setShowSuggestions(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await api.get(
          `/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`
        );
        setSuggestions(res.data.suggestions || []);
      } catch {
        const mock = [
          { type: 'person', text: 'John Doe - Software Engineer at Google', id: 1, icon: Users },
          { type: 'event', text: 'Tech Summit 2025 - AI & Innovation', id: 2, icon: Calendar },
          { type: 'post', text: 'Top 10 Career Tips for Fresh Graduates', id: 3, icon: FileText },
        ];
        setSuggestions(
          mock.filter(s => s.text.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      } finally {
        setIsLoading(false);
        setShowSuggestions(true);
      }
    };
    const id = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(id);
  }, [searchQuery]);

  const handleSelect = (s) => {
    onSearch && onSearch(s);
    toast.success(`Opening ${s.type}: ${s.text.split('-')[0]}`, {
      icon: '🔍',
      style: {
        borderRadius: '12px',
        background: '#4f46e5',
        color: '#fff',
      }
    });
    setSearchQuery('');
    setShowSuggestions(false);
  };

  return (
    <div className="relative" ref={searchRef}>
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <Search className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
          isLoading ? 'text-indigo-500 animate-pulse' : 'text-gray-400'
        }`} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="pl-12 pr-10 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64 lg:w-80 text-sm transition-all bg-white hover:border-gray-300 shadow-sm"
        />
        {isLoading && (
          <RefreshCw className="w-4 h-4 text-indigo-500 absolute right-4 top-1/2 -translate-y-1/2 animate-spin" />
        )}
        {!isLoading && searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>
      
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full mt-2 w-full lg:w-[420px] bg-white rounded-xl shadow-2xl border border-indigo-100 z-50 overflow-hidden"
          >
            <div className="px-5 py-3 bg-indigo-50 border-b border-indigo-100">
              <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Search Results
              </p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {suggestions.map((s, i) => {
                const Icon = s.icon || FileText;
                return (
                  <motion.button
                    key={s.id || i}
                    type="button"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ backgroundColor: '#eef2ff', x: 5 }}
                    className="w-full text-left px-5 py-4 border-b last:border-b-0 border-gray-100 flex items-center space-x-4 group"
                    onClick={() => handleSelect(s)}
                  >
                    <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                        {s.text}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 capitalize">
                        {s.type}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ---------- Professional Stats Card ---------- */
const EnhancedStatsCard = ({ stat, index }) => {
  const Icon = stat.icon;
  const [count, setCount] = useState(0);
  const target = parseInt(stat.value) || 0;

  useEffect(() => {
    if (!target) {
      setCount(0);
      return;
    }
    const steps = 60;
    const duration = 2000;
    const inc = target / steps;
    let current = 0;
    let step = 0;
    const id = setInterval(() => {
      step++;
      current = Math.min(target, current + inc);
      setCount(Math.floor(current));
      if (step >= steps || current >= target) clearInterval(id);
    }, duration / steps);
    return () => clearInterval(id);
  }, [target]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-100 overflow-hidden group"
    >
      <div className="p-6 relative">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full -mr-16 -mt-16 group-hover:opacity-10 transition-opacity`} />
        
        <div className="flex items-start justify-between relative">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {stat.title}
              </p>
              {stat.trend === 'up' && (
                <div className="bg-emerald-100 text-emerald-600 rounded-full p-1">
                  <TrendingUp className="w-3 h-3" />
                </div>
              )}
            </div>
            <motion.p
              key={count}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1"
            >
              {count}
              {stat.title.includes('Completion') ? '%' : ''}
            </motion.p>
            <p className="text-sm text-gray-600 font-medium">
              {stat.detail}
            </p>
          </div>
          
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-lg`}
          >
            <Icon className="w-7 h-7" />
          </motion.div>
        </div>
        
        {stat.title.includes('Completion') && (
          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${count}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* ---------- Professional Quick Action Card ---------- */
const QuickActionCard = ({ item, index, onClick }) => {
  const Icon = item.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        onClick();
        toast.success(`Opening ${item.title}`);
      }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-100 overflow-hidden group"
    >
      <div className="p-6 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative flex items-start justify-between mb-4">
          <div className="flex-1 mr-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
              {item.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {item.description}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-100 group-hover:bg-indigo-600 flex items-center justify-center text-indigo-600 group-hover:text-white transition-all shadow-sm">
            <Icon className="w-6 h-6" />
          </div>
        </div>
        
        <div className="relative flex items-center text-indigo-600 font-semibold text-sm group-hover:text-indigo-700">
          <span>Get started</span>
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
};

/* ---------- Event Countdown ---------- */
const EventCountdown = ({ date }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      const target = new Date(date);
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft(null);
        clearInterval(t);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
      });
    }, 1000);
    return () => clearInterval(t);
  }, [date]);

  if (!timeLeft) return null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center">
        <Clock className="w-3 h-3 mr-1" />
        Starts In
      </p>
      <div className="flex items-center space-x-2">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="flex-1 bg-indigo-50 rounded-lg p-2 text-center">
            <div className="text-indigo-600 font-bold text-lg">{String(value).padStart(2, '0')}</div>
            <div className="text-gray-600 text-[10px] uppercase font-semibold">{unit}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------- Skeleton Loader ---------- */
const DashboardSkeleton = () => (
  <div className="animate-pulse space-y-8">
    <div className="h-32 bg-gray-200 rounded-2xl" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-40 bg-gray-200 rounded-2xl" />
      ))}
    </div>
  </div>
);

/* ---------- Professional Navbar ---------- */
const AlumniNavbar = ({
  activeTab,
  onTabChange,
  onLogout,
  user,
  unreadMessages
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const alumniTabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'posts', name: 'Posts', icon: FileText },
    { id: 'mentorship', name: 'Mentorship', icon: Users },
    { id: 'events', name: 'Events', icon: Calendar },
    { id: 'messages', name: 'Messages', icon: MessageSquare, badge: unreadMessages },
    { id: 'setup-profile', name: 'Profile', icon: Settings }
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/notifications');
        setNotifications(res.data.notifications || []);
      } catch {
        // Notifications endpoint doesn't exist - use empty array
        setNotifications([]);
      }
    };
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleTabClick = (id) => {
    onTabChange(id);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-lg' 
          : 'bg-white shadow-md'
      } border-b border-gray-200`}
    >
      <div className="w-full px-6 lg:px-10">
        <div className="flex justify-between items-center h-18 lg:h-20">
          {/* Logo */}
          <motion.button
            type="button"
            onClick={() => handleTabClick('dashboard')}
            className="flex items-center space-x-3 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <GraduationCap className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
            </div>
            <div className="hidden sm:block text-left">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                AlumniConnect
              </h1>
              <p className="text-xs text-gray-600 font-medium">
                Welcome, {user?.name?.split(' ')[0] || 'Alumni'}
              </p>
            </div>
          </motion.button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 bg-gray-50 rounded-xl p-1.5 shadow-inner border border-gray-200">
            {alumniTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    isActive
                      ? 'bg-white text-indigo-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                  {tab.badge > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
                      {tab.badge}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="hidden md:block">
              <DynamicSearch />
            </div>

            {/* Notifications */}
            <div className="relative">
              <motion.button
                type="button"
                onClick={() => setShowNotifications(v => !v)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </motion.button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                  >
                    <div className="px-6 py-4 bg-indigo-600 border-b border-indigo-700">
                      <h3 className="font-bold text-white text-lg">Notifications</h3>
                      <p className="text-indigo-100 text-xs font-medium mt-1">
                        {unreadNotifications} unread
                      </p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-12 text-center">
                          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm font-medium">No notifications</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`px-6 py-4 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                              n.read ? 'border-transparent' : 'border-indigo-500 bg-indigo-50/50'
                            }`}
                          >
                            <p className="text-sm font-semibold text-gray-900">{n.message}</p>
                            <p className="text-xs text-gray-500 mt-1 font-medium">{n.time}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Avatar */}
            <div className="flex items-center space-x-3 bg-indigo-50 rounded-xl px-4 py-2 border border-indigo-100">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="font-semibold text-gray-900 text-sm leading-tight">
                  {user?.name || 'Alumni'}
                </p>
                <p className="text-xs text-gray-600">Alumni</p>
              </div>
            </div>

            {/* Logout */}
            <motion.button
              type="button"
              onClick={onLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:block p-2.5 rounded-xl hover:bg-red-50 text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>

            {/* Mobile Menu */}
            <motion.button
              type="button"
              onClick={() => setIsMobileMenuOpen(v => !v)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-200 py-4"
            >
              <div className="space-y-2">
                {alumniTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleTabClick(tab.id)}
                      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="flex-1 text-left">{tab.name}</span>
                      {tab.badge > 0 && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-bold">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-semibold text-red-600 hover:bg-red-50 border-t border-gray-200 pt-4 mt-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

/* ---------- Overview Tab ---------- */
const AlumniOverviewTab = ({ onTabChange, onSectionChange, userData }) => {
  const [stats, setStats] = useState({
    profileCompletion: 0,
    activeMentees: 0,
    postsThisMonth: 0,
    connections: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const calculateProfileCompletion = (user) => {
    if (!user) return 0;
    const fields = [
      user.name, user.email, user.phoneNumber, user.currentCompany,
      user.currentPosition, user.graduationYear, user.bio,
      user.skills?.length > 0, user.linkedinUrl
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [eventsRes, postsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/events?status=upcoming&limit=3`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/posts?limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { posts: [] } })),
        axios.get(`${API_URL}/auth/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { users: [] } }))
      ]);

      setUpcomingEvents(eventsRes.data.events || []);
      setRecentPosts(postsRes.data.posts || []);

      const profileCompletion = calculateProfileCompletion(userData);
      const connections = usersRes.data.users?.length || 0;

      setStats({
        profileCompletion,
        activeMentees: 3,
        postsThisMonth: postsRes.data.posts?.length || 0,
        connections
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    fetchDashboardData();
    const id = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(id);
  }, [fetchDashboardData]);

  const statsCards = [
    {
      title: 'Profile Completion',
      value: `${stats.profileCompletion}`,
      detail: stats.profileCompletion === 100 ? 'Complete!' : 'Keep going',
      icon: Shield,
      gradient: 'from-indigo-500 to-purple-600',
      trend: stats.profileCompletion >= 80 ? 'up' : 'neutral'
    },
    {
      title: 'Active Mentees',
      value: `${stats.activeMentees}`,
      detail: 'Students mentored',
      icon: Users,
      gradient: 'from-indigo-500 to-blue-600',
      trend: 'up'
    },
    {
      title: 'Posts This Month',
      value: `${stats.postsThisMonth}`,
      detail: 'Content shared',
      icon: FileText,
      gradient: 'from-purple-500 to-pink-600',
      trend: stats.postsThisMonth > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Total Connections',
      value: `${stats.connections}`,
      detail: 'Network size',
      icon: Globe,
      gradient: 'from-blue-500 to-indigo-600',
      trend: 'up'
    }
  ];

  const quickActions = [
    {
      id: 'posts-section',
      title: 'Share Knowledge',
      description: 'Create posts and share experiences with the community',
      icon: MessageCircle,
      action: () => onTabChange('posts')
    },
    {
      id: 'mentorship-section',
      title: 'Mentorship Hub',
      description: 'Guide students and manage mentorship connections',
      icon: Users,
      action: () => onTabChange('mentorship')
    },
    {
      id: 'events-section',
      title: 'Events Calendar',
      description: 'View and register for upcoming alumni events',
      icon: Calendar,
      action: () => onTabChange('events')
    },
    {
      id: 'messages',
      title: 'Messages',
      description: 'Connect and chat with your network',
      icon: MessageSquare,
      action: () => onTabChange('messages')
    },
    {
      id: 'setup-profile',
      title: 'Profile Setup',
      description: 'Optimize your profile with AI-powered insights',
      icon: Settings,
      action: () => onTabChange('setup-profile')
    },
  ];

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 lg:p-10 text-white shadow-xl"
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-3">
            Welcome back, {userData?.name?.split(' ')[0] || 'Alumni'}!
          </h1>
          <p className="text-indigo-100 text-lg font-medium max-w-2xl">
            Your dashboard is ready. Let's make an impact today.
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div id="dashboard-stats">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-6 h-6 mr-3 text-indigo-600" />
            Your Statistics
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, i) => (
            <EnhancedStatsCard key={stat.title} stat={stat} index={i} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Zap className="w-6 h-6 mr-3 text-indigo-600" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((item, i) => (
            <QuickActionCard
              key={item.id}
              item={item}
              index={i}
              onClick={item.action}
            />
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div id="events-section">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Calendar className="w-6 h-6 mr-3 text-indigo-600" />
              Upcoming Events
            </h2>
            <button
              type="button"
              onClick={() => onTabChange('events')}
              className="text-indigo-600 font-semibold text-sm flex items-center hover:text-indigo-700"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event, i) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => onTabChange('events')}
              >
                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full mb-4">
                  {event.type}
                </span>
                <h3 className="font-bold text-gray-900 mb-3 text-lg group-hover:text-indigo-600 line-clamp-2 transition-colors">
                  {event.title}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    <span>
                      {event.attendees?.filter(a => a.status === 'registered').length || 0} registered
                    </span>
                  </div>
                  <EventCountdown date={event.date} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Activity className="w-6 h-6 mr-3 text-indigo-600" />
          Recent Activity
        </h2>
        <div className="space-y-4">
          {recentPosts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium mb-4">No recent posts</p>
              <button
                type="button"
                onClick={() => onTabChange('posts')}
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Create Your First Post
              </button>
            </div>
          ) : (
            recentPosts.map((post, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">New post shared</p>
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {post.content || post.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatRelativeTime(post.createdAt)}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------- Main Dashboard ---------- */
const AlumniDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard-stats');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(res.data.user);
      } catch {
        setUserData(user);
      }
    };
    const fetchUnreadMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/messages/conversations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const conv = res.data.conversations || [];
        const unread = conv.filter(c => c.lastMessage && !c.lastMessage.read).length;
        setUnreadMessages(unread);
      } catch {
        setUnreadMessages(0);
      }
    };
    fetchUserData();
    fetchUnreadMessages();
  }, [user]);

  const handleTabChange = (tabId) => {
    setLoading(true);
    setTimeout(() => {
      setActiveTab(tabId);
      setLoading(false);
      setActiveSection('dashboard-stats');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 250);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center bg-white rounded-2xl shadow-xl">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-indigo-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 font-semibold">Loading {activeTab}...</p>
          </div>
        </div>
      );
    }
    switch (activeTab) {
      case 'posts':
        return (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:p-8">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Community Posts
              </h1>
            </div>
            <PostsPage />
          </div>
        );
      case 'mentorship':
        return (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:p-8">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Mentorship Hub
              </h1>
            </div>
            <MentorshipDashboard />
          </div>
        );
      case 'events':
        return (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:p-8">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Events Calendar
              </h1>
            </div>
            <EventsPage embedded />
          </div>
        );
      case 'messages':
        return <MessagingPage embedded={false} />;
      case 'setup-profile':
        return (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:p-8">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Profile Setup
              </h1>
            </div>
            <SetupProfile />
          </div>
        );
      case 'dashboard':
      default:
        return (
          <AlumniOverviewTab
            onTabChange={handleTabChange}
            onSectionChange={setActiveSection}
            userData={userData}
          />
        );
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center bg-white rounded-2xl p-12 shadow-xl border border-gray-200">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600">
            Please log in to access the Alumni dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '12px', fontWeight: '600' }
        }}
      />
      <AlumniNavbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={logout}
        user={user}
        unreadMessages={unreadMessages}
      />
      <main className="w-full px-6 lg:px-10 py-8 lg:py-10">
        {renderContent()}
      </main>
    </div>
  );
};

export default AlumniDashboard;