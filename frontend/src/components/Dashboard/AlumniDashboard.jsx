import React, { useState, useEffect, useCallback } from 'react';
import { 
    GraduationCap, Users, Briefcase, Calendar, TrendingUp, FileText, MessageCircle, Settings, 
    Bell, Search, LogOut, Menu, X, Home, MessageSquare, AlertCircle, RefreshCw, Shield, ArrowRight
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
const AlumniNavbar = ({ activeTab, onTabChange, onLogout, user, activeSection, onQuickActionClick }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [notifications] = useState([
        { id: 1, type: 'mentorship', message: 'New mentorship request from John Doe', read: false },
        { id: 2, type: 'system', message: 'Profile setup reminder', read: false }
    ]);

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
        { id: 'messages', name: 'Messages', icon: MessageSquare },
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
            isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg' : 'bg-white shadow-md'
        }`}>
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 lg:h-20">
                    <div className="flex items-center space-x-3 group cursor-pointer">
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

                    <div className="hidden lg:flex items-center space-x-1 bg-gray-50 rounded-xl p-1.5 shadow-inner">
                        {alumniTabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabClick(tab.id)}
                                    className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm ${
                                        isActive
                                            ? `text-${PRIMARY_TW_COLOR}-700 shadow-md bg-white ring-2 ring-${PRIMARY_TW_COLOR}-100`
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? `text-${PRIMARY_TW_COLOR}-600` : ''}`} />
                                    <span>{tab.name}</span>
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
                                className={`pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-offset-1 focus:ring-${PRIMARY_TW_COLOR}-300 focus:border-transparent w-48 lg:w-64 transition-all duration-200 text-sm`}
                            />
                        </div>

                        <button className={`relative p-2 lg:p-2.5 rounded-full hover:bg-gray-100 transition-all duration-200 group border border-transparent hover:border-gray-200`}>
                            <Bell className={`w-5 h-5 text-gray-600 group-hover:text-${PRIMARY_TW_COLOR}-600 transition-colors`} />
                            {unreadNotifications > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            )}
                        </button>

                        <div className="group relative">
                            <div className={`w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-${PRIMARY_TW_COLOR}-600 to-${ACCENT_TW_COLOR}-500 rounded-full flex items-center justify-center shadow-md cursor-pointer`}>
                                <span className="text-white text-base font-semibold">
                                    {user?.name?.charAt(0) || 'A'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={onLogout}
                            className="hidden sm:block p-2 lg:p-2.5 rounded-full hover:bg-red-50 text-red-600 transition-all duration-200 hover:shadow-md"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
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
                                                ? `bg-${PRIMARY_TW_COLOR}-50 text-${PRIMARY_TW_COLOR}-700 ring-2 ring-${PRIMARY_TW_COLOR}-200 shadow-sm`
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
                    <div className="lg:hidden border-t border-gray-100 py-4">
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
                                                ? `bg-gradient-to-r from-${PRIMARY_TW_COLOR}-50 to-${ACCENT_TW_COLOR}-50 text-${PRIMARY_TW_COLOR}-700 border border-${PRIMARY_TW_COLOR}-200 shadow-sm`
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

// --- Alumni Overview Tab Component ---
const AlumniOverviewTab = ({ onTabChange, debugInfo, onSectionChange, upcomingEvents }) => {
    const stats = [
        { title: 'Profile Completion', value: '85%', detail: 'Almost there!', icon: Shield, color: 'from-green-400 to-green-600' },
        { title: 'Mentorship', value: '3', detail: 'Active mentees', icon: Users, color: 'from-blue-400 to-blue-600' },
        { title: 'Posts', value: '12', detail: 'This month', icon: FileText, color: 'from-purple-400 to-purple-600' },
        { title: 'Connections', value: '47', detail: 'Alumni network', icon: TrendingUp, color: 'from-orange-400 to-orange-600' }
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

    return (
        <TabContentWrapper title="Alumni Dashboard Overview" icon={Home}>
            <div id="dashboard-stats" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 pt-2"> 
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className={`bg-gradient-to-r ${stat.color} rounded-xl p-6 text-white shadow-lg transform hover:scale-[1.02] transition-transform duration-200`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">{stat.title}</h3>
                                    <p className="text-3xl font-bold">{stat.value}</p>
                                    <p className="text-white/80 text-sm">{stat.detail}</p>
                                </div>
                                <Icon className="w-9 h-9 opacity-80" />
                            </div>
                        </div>
                    );
                })}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2 border-gray-100">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quickActions.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={index}
                            id={item.id}
                            onClick={item.action}
                            className={`bg-gradient-to-r ${item.color} rounded-xl p-6 text-white cursor-pointer transform hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:ring-2 ring-white/50`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 pr-4">
                                    <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                                    <p className="opacity-90 text-sm">{item.description}</p>
                                </div>
                                <Icon className="w-7 h-7 opacity-80 flex-shrink-0 mt-1" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Upcoming Events Section */}
            {upcomingEvents.length > 0 && (
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
                        <button
                            onClick={() => onTabChange('events')}
                            className="text-green-600 hover:text-green-700 font-semibold text-sm flex items-center space-x-1"
                        >
                            <span>View All</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {upcomingEvents.slice(0, 3).map((event) => (
                            <div
                                key={event._id}
                                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                                onClick={() => onTabChange('events')}
                            >
                                <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full mb-2">
                                    {event.type}
                                </span>
                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span>{formatDate(event.date)}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Users className="w-4 h-4 mr-2" />
                                        <span>{event.attendees?.filter(a => a.status === 'registered').length || 0} registered</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {process.env.NODE_ENV === 'development' && debugInfo && (
                <div className="mt-8 p-4 bg-gray-100 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">Debug Information</h4>
                    <pre className="text-xs text-gray-600 overflow-auto max-h-48">
                        {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                </div>
            )}
        </TabContentWrapper>
    );
};

// --- AlumniDashboard Main Component ---
const AlumniDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [debugInfo, setDebugInfo] = useState(null);
    const [activeSection, setActiveSection] = useState('dashboard-stats');
    const [upcomingEvents, setUpcomingEvents] = useState([]);

    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchUpcomingEvents();
        }
    }, [activeTab]);

    const fetchUpcomingEvents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/events?status=upcoming&limit=3`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUpcomingEvents(response.data.events || []);
        } catch (error) {
            console.error('Error fetching upcoming events:', error);
        }
    };

    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            setDebugInfo({
                userRole: user?.role,
                userId: user?._id,
                activeTab,
                activeSection,
                component: 'AlumniDashboard',
                lastRender: new Date().toLocaleTimeString()
            });
        }
    }, [user, activeTab, activeSection]);

    const handleTabChange = (tabId) => {
        setLoading(true);
        setTimeout(() => {
            setActiveTab(tabId);
            setLoading(false);
            setActiveSection('dashboard-stats');
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
                return <TabContentWrapper title="Community Posts" icon={FileText}><PostsPage /></TabContentWrapper>;
            case 'mentorship':
                return <TabContentWrapper title="Mentorship Hub" icon={Users}><MentorshipDashboard /></TabContentWrapper>;
            case 'events':
                return <TabContentWrapper title="Events Calendar" icon={Calendar}><EventsPage embedded={true} /></TabContentWrapper>;
            case 'messages':
                return (
                    <TabContentWrapper title="Messages" icon={MessageSquare}>
                        <MessagingPage embedded={true} />
                    </TabContentWrapper>
                );
            case 'setup-profile':
                return <TabContentWrapper title="Mentor Profile Setup" icon={Settings}><SetupProfile /></TabContentWrapper>;
            case 'dashboard':
            default:
                return (
                    <AlumniOverviewTab 
                        onTabChange={handleTabChange} 
                        debugInfo={debugInfo} 
                        onSectionChange={setActiveSection}
                        upcomingEvents={upcomingEvents}
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
        <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-${PRIMARY_TW_COLOR}-50/30 to-${ACCENT_TW_COLOR}-50/30`}>
            <AlumniNavbar 
                activeTab={activeTab} 
                onTabChange={handleTabChange} 
                onLogout={logout}
                user={user}
                activeSection={activeSection}
                onQuickActionClick={handleQuickActionClick}
            />

            <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                {renderContent()}
            </main>
        </div>
    );
};

export default AlumniDashboard;