import React, { useState, useEffect, useCallback } from 'react';
import { 
    GraduationCap, Users, Briefcase, Calendar, TrendingUp, FileText, MessageCircle, Settings, 
    Bell, Search, LogOut, Menu, X, Home, MessageSquare, AlertCircle, RefreshCw, Shield, ArrowRight,
    CheckCircle, Award, Target, Zap, Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PostsPage from '../Posts/PostsPage';
import SetupProfile from '../AI/SetupProfile';
import MentorshipDashboard from '../AI/MentorshipDashboard';
import MessagingPage from '../Messaging/MessagingPage';
import EventsPage from '../Events/EventsPage';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// --- CONFIGURATION ---
const PRIMARY_TW_COLOR = 'green';
const ACCENT_TW_COLOR = 'emerald';
const HEADER_GRADIENT = 'from-green-600 to-emerald-600';
const NAVBAR_HEIGHT = 80;

const quickActionsMenu = [
    { id: 'dashboard-stats', name: 'Overview', icon: Home, color: 'green' },
    { id: 'posts-section', name: 'Share Knowledge', icon: MessageCircle, color: 'blue' },
    { id: 'mentorship-section', name: 'Mentorship Hub', icon: Users, color: 'purple' },
    { id: 'events-section', name: 'Events', icon: Calendar, color: 'indigo' },
    { id: 'messages', name: 'Messages', icon: MessageSquare, color: 'teal' },
    { id: 'job-board-section', name: 'Job Board', icon: Briefcase, color: 'orange' }
];

// --- Alumni Navbar Component ---
const AlumniNavbar = ({ activeTab, onTabChange, onLogout, user, activeSection, onQuickActionClick, unreadMessages }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data.notifications || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            // Mock notifications for demo
            setNotifications([
                { id: 1, type: 'mentorship', message: 'New mentorship request received', read: false, time: '2 hours ago' },
                { id: 2, type: 'event', message: 'Event reminder: Tech Talk tomorrow', read: false, time: '5 hours ago' },
                { id: 3, type: 'post', message: 'Someone commented on your post', read: true, time: '1 day ago' }
            ]);
        }
    };

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const [isQuickActionsSticky, setIsQuickActionsSticky] = useState(false);

    useEffect(() => {
        const handleScrollForSticky = () => {
            setIsQuickActionsSticky(window.scrollY > 300 && activeTab === 'dashboard');
        };
        
        window.addEventListener('scroll', handleScrollForSticky);
        return () => window.removeEventListener('scroll', handleScrollForSticky);
    }, [activeTab]);

    const alumniTabs = [
        { id: 'dashboard', name: 'Dashboard', icon: Home },
        { id: 'posts', name: 'Community Posts', icon: FileText },
        { id: 'mentorship', name: 'Mentorship', icon: Users },
        { id: 'events', name: 'Events', icon: Calendar },
        { id: 'messages', name: 'Messages', icon: MessageSquare, badge: unreadMessages },
        { id: 'setup-profile', name: 'Mentor Profile', icon: Settings }
    ];

    const unreadNotifications = notifications.filter(n => !n.read).length;

    const handleTabClick = (tabId) => {
        onTabChange(tabId);
        setIsMobileMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <nav className={`sticky top-0 z-50 transition-all duration-300 ${
            isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200' : 'bg-white shadow-md'
        }`}>
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 lg:h-20">
                    <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => handleTabClick('dashboard')}>
                        <div className="relative">
                            <div className={`absolute inset-0 bg-gradient-to-br ${HEADER_GRADIENT} rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity`}></div>
                            <div className={`relative w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br ${HEADER_GRADIENT} rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform`}>
                                <GraduationCap className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                            </div>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className={`text-lg lg:text-xl font-bold bg-gradient-to-r ${HEADER_GRADIENT} bg-clip-text text-transparent`}>
                                AlumniConnect
                            </h1>
                            <p className="text-xs text-gray-500">Welcome, {user?.name?.split(' ')[0]}</p>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center space-x-1 bg-gray-50 rounded-xl p-1.5 shadow-inner border border-gray-200">
                        {alumniTabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabClick(tab.id)}
                                    className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm ${
                                        isActive
                                            ? 'text-green-700 shadow-md bg-white ring-2 ring-green-100'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-green-600' : ''}`} />
                                    <span>{tab.name}</span>
                                    {tab.badge > 0 && (
                                        <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full font-semibold">
                                            {tab.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center space-x-2 lg:space-x-3">
                        <div className="hidden md:block relative">
                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-full focus:ring-2 focus:ring-offset-1 focus:ring-green-300 focus:border-transparent w-48 lg:w-64 transition-all duration-200 text-sm bg-white"
                            />
                        </div>

                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2.5 rounded-full hover:bg-gray-100 transition-all duration-200 group border border-transparent hover:border-gray-200"
                            >
                                <Bell className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors" />
                                {unreadNotifications > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
                                    <div className="px-4 py-3 border-b border-gray-200">
                                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                                        <p className="text-xs text-gray-500">{unreadNotifications} unread</p>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center">
                                                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                                <p className="text-gray-500 text-sm">No notifications</p>
                                            </div>
                                        ) : (
                                            notifications.map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-2 ${
                                                        notif.read ? 'border-transparent' : 'border-green-500 bg-green-50/50'
                                                    }`}
                                                >
                                                    <p className="text-sm text-gray-900 font-medium">{notif.message}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="px-4 py-2 border-t border-gray-200">
                                        <button className="text-sm text-green-600 hover:text-green-700 font-semibold">
                                            View all notifications
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl px-4 py-2 border border-green-100">
                            <div className="w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-green-600 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                                <span className="text-white text-sm font-semibold">
                                    {user?.name?.charAt(0) || 'A'}
                                </span>
                            </div>
                            <div className="hidden lg:block text-sm">
                                <p className="font-semibold text-gray-800 leading-tight">{user?.name}</p>
                                <p className="text-xs text-gray-500">Alumni</p>
                            </div>
                        </div>

                        <button
                            onClick={onLogout}
                            className="hidden sm:block p-2.5 rounded-full hover:bg-red-50 text-red-600 transition-all duration-200 hover:shadow-md border border-transparent hover:border-red-200"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200"
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
                        </button>
                    </div>
                </div>

                {activeTab === 'dashboard' && (
                    <div className={`hidden lg:block border-t border-gray-100 transition-all duration-300 ${
                        isQuickActionsSticky ? 'py-2 opacity-100 h-auto' : 'py-0 h-0 opacity-0 overflow-hidden'
                    }`}>
                        <div className="flex space-x-4 overflow-x-auto pb-1">
                            {quickActionsMenu.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeSection === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => onQuickActionClick(item.id)}
                                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-full font-medium text-sm transition-all duration-200 min-w-max ${
                                            isActive
                                                ? 'bg-green-50 text-green-700 ring-2 ring-green-200 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{item.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
                
                {isMobileMenuOpen && (
                    <div className="lg:hidden border-t border-gray-100 py-4 bg-white/95 backdrop-blur-sm">
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
                                        {tab.badge > 0 && (
                                            <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-semibold">
                                                {tab.badge}
                                            </span>
                                        )}
                                        {isActive && <ArrowRight className="w-4 h-4 ml-auto text-green-600" />}
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

// --- Alumni Overview Tab Component ---
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

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Fetch all data in parallel
            const [eventsRes, postsRes, usersRes] = await Promise.all([
                axios.get(`${API_URL}/events?status=upcoming&limit=3`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_URL}/posts?limit=3`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(() => ({ data: { posts: [] } })),
                axios.get(`${API_URL}/auth/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(() => ({ data: { users: [] } }))
            ]);

            setUpcomingEvents(eventsRes.data.events || []);
            setRecentPosts(postsRes.data.posts || []);

            // Calculate stats
            const profileCompletion = calculateProfileCompletion(userData);
            const connections = usersRes.data.users?.length || 0;

            setStats({
                profileCompletion,
                activeMentees: 3, // TODO: Get from mentorship API
                postsThisMonth: postsRes.data.posts?.length || 0,
                connections
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateProfileCompletion = (user) => {
        if (!user) return 0;
        const fields = [
            user.name,
            user.email,
            user.phoneNumber,
            user.currentCompany,
            user.currentPosition,
            user.graduationYear,
            user.bio,
            user.skills?.length > 0,
            user.linkedinUrl
        ];
        const completed = fields.filter(Boolean).length;
        return Math.round((completed / fields.length) * 100);
    };

    const statsCards = [
        { 
            title: 'Profile Completion', 
            value: `${stats.profileCompletion}%`, 
            detail: stats.profileCompletion === 100 ? 'Complete!' : 'Keep going!', 
            icon: Shield, 
            color: 'from-green-400 to-green-600',
            trend: stats.profileCompletion >= 80 ? 'up' : 'neutral'
        },
        { 
            title: 'Mentorship', 
            value: stats.activeMentees.toString(), 
            detail: 'Active mentees', 
            icon: Users, 
            color: 'from-blue-400 to-blue-600',
            trend: 'up'
        },
        { 
            title: 'Posts', 
            value: stats.postsThisMonth.toString(), 
            detail: 'This month', 
            icon: FileText, 
            color: 'from-purple-400 to-purple-600',
            trend: stats.postsThisMonth > 0 ? 'up' : 'neutral'
        },
        { 
            title: 'Connections', 
            value: stats.connections.toString(), 
            detail: 'Alumni network', 
            icon: TrendingUp, 
            color: 'from-orange-400 to-orange-600',
            trend: 'up'
        }
    ];

    const quickActions = [
        { id: 'posts-section', title: 'Share Knowledge', description: 'Create posts and share experiences', icon: MessageCircle, color: 'from-blue-400 to-blue-600', action: () => onTabChange('posts') },
        { id: 'mentorship-section', title: 'Mentorship Hub', description: 'Manage student connections', icon: Users, color: 'from-purple-400 to-purple-600', action: () => onTabChange('mentorship') },
        { id: 'events-section', title: 'Events Calendar', description: 'View and register for events', icon: Calendar, color: 'from-indigo-400 to-indigo-600', action: () => onTabChange('events') },
        { id: 'messages', title: 'Messages', description: 'Chat with your connections', icon: MessageSquare, color: 'from-teal-400 to-teal-600', action: () => onTabChange('messages') },
        { id: 'setup-profile', title: 'AI Profile Setup', description: 'Optimize your matching profile', icon: Settings, color: 'from-teal-400 to-teal-600', action: () => onTabChange('setup-profile') },
        { id: 'job-board-section', title: 'Job Board', description: 'Post opportunities for students', icon: Briefcase, color: 'from-orange-400 to-orange-600', action: () => console.log('Navigate to Job Board') }
    ];

    const observeScroll = useCallback(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        onSectionChange(entry.target.id);
                    }
                });
            },
            {
                rootMargin: `-${NAVBAR_HEIGHT + 20}px 0px -50% 0px`, 
                threshold: 0
            }
        );

        const idsToObserve = ['dashboard-stats', ...quickActions.map(a => a.id)];
        
        idsToObserve.forEach(id => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => {
             idsToObserve.forEach(id => {
                const el = document.getElementById(id);
                if (el) observer.unobserve(el);
            });
        };
    }, [onSectionChange]);

    useEffect(() => {
        const cleanup = observeScroll();
        return cleanup;
    }, [observeScroll]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatRelativeTime = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
        if (diffInHours < 48) return 'Yesterday';
        return formatDate(dateString);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-12 h-12 text-green-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-8 text-white shadow-2xl">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl lg:text-4xl font-bold mb-3">
                        Welcome back, {userData?.name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-green-100 text-lg">
                        Your alumni dashboard is ready. Let's make an impact today!
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div id="dashboard-stats" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className={`bg-gradient-to-r ${stat.color} rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-200`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">{stat.title}</h3>
                                    <p className="text-4xl font-bold mb-1">{stat.value}</p>
                                    <p className="text-white/80 text-sm flex items-center">
                                        {stat.trend === 'up' && <TrendingUp className="w-4 h-4 mr-1" />}
                                        {stat.detail}
                                    </p>
                                </div>
                                <Icon className="w-12 h-12 opacity-80" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Zap className="w-6 h-6 mr-2 text-green-600" />
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quickActions.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={index}
                                id={item.id}
                                onClick={item.action}
                                className={`bg-gradient-to-r ${item.color} rounded-xl p-6 text-white cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 pr-4">
                                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                        <p className="opacity-90 text-sm">{item.description}</p>
                                    </div>
                                    <Icon className="w-8 h-8 opacity-80 flex-shrink-0" />
                                </div>
                                <ArrowRight className="w-5 h-5 mt-4 opacity-75" />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                            <Calendar className="w-6 h-6 mr-2 text-green-600" />
                            Upcoming Events
                        </h2>
                        <button
                            onClick={() => onTabChange('events')}
                            className="text-green-600 hover:text-green-700 font-semibold text-sm flex items-center space-x-1"
                        >
                            <span>View All</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {upcomingEvents.map((event) => (
                            <div
                                key={event._id}
                                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer group"
                                onClick={() => onTabChange('events')}
                            >
                                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full mb-3">
                                    {event.type}
                                </span>
                                <h3 className="font-bold text-gray-900 mb-3 text-lg group-hover:text-green-600 transition-colors line-clamp-2">
                                    {event.title}
                                </h3>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                        <span>{formatDate(event.date)}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                                        <span>{event.attendees?.filter(a => a.status === 'registered').length || 0} registered</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Activity className="w-6 h-6 mr-2 text-green-600" />
                    Recent Activity
                </h2>
                <div className="space-y-4">
                    {recentPosts.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No recent posts</p>
                            <button
                                onClick={() => onTabChange('posts')}
                                className="mt-4 text-green-600 hover:text-green-700 font-semibold text-sm"
                            >
                                Create your first post
                            </button>
                        </div>
                    ) : (
                        recentPosts.map((post, index) => (
                            <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900">New post shared</p>
                                    <p className="text-sm text-gray-600 truncate">{post.content || post.title}</p>
                                    <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(post.createdAt)}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// Main AlumniDashboard Component
const AlumniDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState('dashboard-stats');
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        if (user) {
            fetchUserData();
            fetchUnreadMessages();
        }
    }, [user]);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserData(response.data.user);
        } catch (error) {
            console.error('Error fetching user data:', error);
            setUserData(user);
        }
    };

    const fetchUnreadMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/messages/conversations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Count conversations with unread messages
            const conversations = response.data.conversations || [];
            const unread = conversations.filter(conv => 
                conv.lastMessage && !conv.lastMessage.read
            ).length;
            setUnreadMessages(unread);
        } catch (error) {
            console.error('Error fetching unread messages:', error);
            setUnreadMessages(0);
        }
    };

    const handleTabChange = (tabId) => {
        setLoading(true);
        setTimeout(() => {
            setActiveTab(tabId);
            setLoading(false);
            setActiveSection('dashboard-stats');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300);
    };

    const handleQuickActionClick = (sectionId) => {
        if (sectionId === 'messages') {
            handleTabChange('messages');
            return;
        }
        if (sectionId === 'events-section') {
            handleTabChange('events');
            return;
        }
        if (sectionId === 'posts-section') {
            handleTabChange('posts');
            return;
        }
        if (sectionId === 'mentorship-section') {
            handleTabChange('mentorship');
            return;
        }
        
        const element = document.getElementById(sectionId);
        if (element) {
            const topPosition = element.offsetTop - NAVBAR_HEIGHT - 10; 
            window.scrollTo({ top: topPosition, behavior: 'smooth' });
        }
        setActiveSection(sectionId);
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="min-h-[70vh] flex items-center justify-center bg-white rounded-2xl shadow-xl">
                    <div className="text-center">
                        <RefreshCw className="w-12 h-12 text-green-500 mx-auto mb-4 animate-spin" />
                        <p className="text-gray-600 font-medium">Loading {activeTab}...</p>
                    </div>
                </div>
            );
        }

        switch (activeTab) {
            case 'posts':
                return (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
                        <div className="flex items-center space-x-3 mb-6 border-b pb-4 border-gray-100">
                            <FileText className="w-7 h-7 text-green-600" />
                            <h1 className="text-3xl font-bold text-gray-900">Community Posts</h1>
                        </div>
                        <PostsPage />
                    </div>
                );
            case 'mentorship':
                return (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
                        <div className="flex items-center space-x-3 mb-6 border-b pb-4 border-gray-100">
                            <Users className="w-7 h-7 text-green-600" />
                            <h1 className="text-3xl font-bold text-gray-900">Mentorship Hub</h1>
                        </div>
                        <MentorshipDashboard />
                    </div>
                );
            case 'events':
                return (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
                        <div className="flex items-center space-x-3 mb-6 border-b pb-4 border-gray-100">
                            <Calendar className="w-7 h-7 text-green-600" />
                            <h1 className="text-3xl font-bold text-gray-900">Events Calendar</h1>
                        </div>
                        <EventsPage embedded={true} />
                    </div>
                );
            case 'messages':
                return <MessagingPage embedded={false} />;
            case 'setup-profile':
                return (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
                        <div className="flex items-center space-x-3 mb-6 border-b pb-4 border-gray-100">
                            <Settings className="w-7 h-7 text-green-600" />
                            <h1 className="text-3xl font-bold text-gray-900">Mentor Profile Setup</h1>
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
                    <p className="text-gray-600">Please log in to access the Alumni dashboard</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/30">
            <AlumniNavbar 
                activeTab={activeTab} 
                onTabChange={handleTabChange} 
                onLogout={logout}
                user={user}
                activeSection={activeSection}
                onQuickActionClick={handleQuickActionClick}
                unreadMessages={unreadMessages}
            />

            <main className="px-4 sm:px-6 lg:px-8 py-6">
                {renderContent()}
            </main>
        </div>
    );
};

export default AlumniDashboard;