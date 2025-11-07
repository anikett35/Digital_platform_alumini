import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Users, 
  Calendar, 
  BarChart3,
  Bell,
  Search,
  LogOut,
  Menu,
  X,
  Home,
  Shield,
  MessageSquare,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Plus,
  Edit,
  Trash2,
  Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Chatbot from '../Common/Chatbot';

// Admin-specific Navbar Component
const AdminNavbar = ({ activeTab, onTabChange, onLogout, user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const adminTabs = [
    { id: 'events', name: 'Events', icon: Calendar },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'messages', name: 'Messages', icon: MessageSquare },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

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
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                AdminPortal
              </h1>
              <p className="text-xs text-gray-500">Welcome, {user?.name?.split(' ')[0]}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 bg-gray-50 rounded-xl p-1.5">
            {adminTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-purple-700 shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-white rounded-lg shadow-sm"></div>
                  )}
                  <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-purple-600' : ''}`} />
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
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 lg:p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 group">
              <Bell className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            {/* User Menu */}
            <div className="hidden sm:flex items-center space-x-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl px-3 lg:px-4 py-2 border border-purple-100">
              <div className="w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-semibold">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="hidden md:block text-sm">
                <p className="font-semibold text-gray-800 leading-tight">{user?.name}</p>
                <p className="text-xs text-gray-500">Administrator</p>
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
              {adminTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border border-purple-200 shadow-sm'
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

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    time: '',
    type: 'Workshop',
    maxAttendees: '',
    description: '',
    location: '',
    duration: '',
    organizer: ''
  });
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('events');
  const { user, logout } = useAuth();

  // Event types for dropdown
  const eventTypes = ['Workshop', 'Networking', 'Seminar', 'Conference', 'Webinar', 'Social', 'Career Fair'];
  
  // Initialize with sample data
  useEffect(() => {
    const sampleEvents = [
      {
        id: 1,
        title: "Career Guidance Workshop",
        date: "2024-12-15",
        time: "14:00",
        type: "Workshop",
        maxAttendees: 100,
        currentAttendees: 45,
        description: "A comprehensive workshop to guide students on career paths and professional development opportunities.",
        location: "Main Auditorium",
        duration: "2 hours",
        organizer: "Career Services",
        status: "upcoming",
        createdAt: new Date('2024-11-01')
      },
      {
        id: 2,
        title: "Alumni Networking Meet",
        date: "2024-12-18",
        time: "18:00",
        type: "Networking",
        maxAttendees: 200,
        currentAttendees: 120,
        description: "Annual alumni networking event with industry professionals and recent graduates.",
        location: "University Campus",
        duration: "3 hours",
        organizer: "Alumni Association",
        status: "upcoming",
        createdAt: new Date('2024-11-05')
      },
      {
        id: 3,
        title: "Industry Expert Talk",
        date: "2024-12-22",
        time: "11:00",
        type: "Seminar",
        maxAttendees: 300,
        currentAttendees: 200,
        description: "Insights from industry leaders about current trends and future opportunities.",
        location: "Tech Hall",
        duration: "1.5 hours",
        organizer: "Tech Department",
        status: "upcoming",
        createdAt: new Date('2024-11-10')
      }
    ];
    setEvents(sampleEvents);
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create new event
  const handleCreateEvent = () => {
    setEventForm({
      title: '',
      date: '',
      time: '',
      type: 'Workshop',
      maxAttendees: '',
      description: '',
      location: '',
      duration: '',
      organizer: ''
    });
    setEditingEvent(null);
    setShowEventForm(true);
  };

  // Edit existing event
  const handleEditEvent = (event) => {
    setEventForm({ ...event });
    setEditingEvent(event.id);
    setShowEventForm(true);
  };

  // Delete event
  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(event => event.id !== eventId));
    }
  };

  // Submit event form
  const handleSubmitEvent = (e) => {
    e.preventDefault();
    
    if (editingEvent) {
      // Update existing event
      setEvents(events.map(event => 
        event.id === editingEvent ? { 
          ...eventForm, 
          id: editingEvent,
          currentAttendees: eventForm.currentAttendees || 0
        } : event
      ));
    } else {
      // Create new event
      const newEvent = {
        ...eventForm,
        id: Date.now(),
        status: "upcoming",
        currentAttendees: 0,
        createdAt: new Date(),
        maxAttendees: parseInt(eventForm.maxAttendees) || 0
      };
      setEvents([...events, newEvent]);
    }
    
    setShowEventForm(false);
    setEditingEvent(null);
  };

  // Filter events based on filters and search
  const filteredEvents = events.filter(event => {
    const matchesType = filters.type === 'all' || event.type === filters.type;
    const matchesStatus = filters.status === 'all' || event.status === filters.status;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  // Calculate event statistics
  const eventStats = [
    {
      id: 'total',
      name: 'Total Events',
      value: events.length.toString(),
      change: '+3 this week',
      trend: 'up',
      icon: Calendar,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100'
    },
    {
      id: 'upcoming',
      name: 'Upcoming Events',
      value: events.filter(event => event.status === 'upcoming').length.toString(),
      change: '2 scheduled',
      trend: 'up',
      icon: TrendingUp,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100'
    },
    {
      id: 'attendees',
      name: 'Total Attendees',
      value: events.reduce((sum, event) => sum + event.currentAttendees, 0).toString(),
      change: '+45 today',
      trend: 'up',
      icon: Users,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-100'
    },
    {
      id: 'capacity',
      name: 'Avg. Capacity',
      value: `${Math.round(events.reduce((sum, event) => sum + (event.currentAttendees / event.maxAttendees * 100), 0) / events.length || 0)}%`,
      change: '+12% growth',
      trend: 'up',
      icon: BarChart3,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-100'
    }
  ];

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'events':
        return (
          <div className="space-y-6 lg:space-y-8">
            {/* Welcome Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 rounded-2xl lg:rounded-3xl shadow-2xl p-6 lg:p-8">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                  <span className="text-white/90 text-sm font-medium">Admin Dashboard</span>
                </div>
                <h1 className="text-2xl lg:text-4xl font-bold text-white mb-2">
                  Event Management Center
                </h1>
                <p className="text-purple-100 text-sm lg:text-base max-w-2xl">
                  Manage all alumni events, track attendance, and create engaging experiences for your community.
                </p>
              </div>
            </div>

            {/* Stats Grid - FIXED ALIGNMENT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {eventStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={stat.id}
                    className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 overflow-hidden transform hover:-translate-y-1"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        {stat.trend === 'up' && (
                          <TrendingUp className="w-5 h-5 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-600 mb-1 truncate">{stat.name}</p>
                      <p className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{stat.value}</p>
                      <p className="text-sm text-gray-500 flex items-center space-x-1">
                        <span className="truncate">{stat.change}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Controls */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                <div className="flex flex-col lg:flex-row gap-4 flex-1 w-full">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search events..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  {/* Filters */}
                  <div className="flex gap-3">
                    <select
                      className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={filters.type}
                      onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="all">All Types</option>
                      {eventTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    
                    <select
                      className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="all">All Status</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 w-full lg:w-auto">
                  <button className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-semibold">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  <button
                    onClick={handleCreateEvent}
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create Event</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <div key={event.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 overflow-hidden transform hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {event.title}
                    </h3>
                    <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                      {event.type}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                      <span className="font-medium">{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">Time:</span>
                      {event.time}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">Location:</span>
                      {event.location}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-green-500" />
                        <span>{event.currentAttendees} / {event.maxAttendees}</span>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(event.currentAttendees / event.maxAttendees) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      event.status === 'upcoming' ? 'bg-green-100 text-green-800' :
                      event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {event.status}
                    </span>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="Edit Event"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredEvents.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">No events found matching your criteria.</p>
                <button
                  onClick={handleCreateEvent}
                  className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
                >
                  Create Your First Event
                </button>
              </div>
            )}

            {/* Event Form Modal */}
            {showEventForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 lg:p-8">
                    <h2 className="text-2xl lg:text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      {editingEvent ? 'Edit Event' : 'Create New Event'}
                    </h2>
                    
                    <form onSubmit={handleSubmitEvent} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Event Title *
                          </label>
                          <input
                            type="text"
                            name="title"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            value={eventForm.title}
                            onChange={handleInputChange}
                            placeholder="Enter event title"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Event Type *
                          </label>
                          <select
                            name="type"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            value={eventForm.type}
                            onChange={handleInputChange}
                          >
                            {eventTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Date *
                          </label>
                          <input
                            type="date"
                            name="date"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            value={eventForm.date}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Time *
                          </label>
                          <input
                            type="time"
                            name="time"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            value={eventForm.time}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Location *
                          </label>
                          <input
                            type="text"
                            name="location"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            value={eventForm.location}
                            onChange={handleInputChange}
                            placeholder="Enter event location"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Max Attendees *
                          </label>
                          <input
                            type="number"
                            name="maxAttendees"
                            required
                            min="1"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            value={eventForm.maxAttendees}
                            onChange={handleInputChange}
                            placeholder="Enter maximum attendees"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Description *
                        </label>
                        <textarea
                          name="description"
                          required
                          rows="4"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          value={eventForm.description}
                          onChange={handleInputChange}
                          placeholder="Describe your event..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Duration
                          </label>
                          <input
                            type="text"
                            name="duration"
                            placeholder="e.g., 2 hours"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            value={eventForm.duration}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Organizer
                          </label>
                          <input
                            type="text"
                            name="organizer"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            value={eventForm.organizer}
                            onChange={handleInputChange}
                            placeholder="Event organizer"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => setShowEventForm(false)}
                          className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
                        >
                          {editingEvent ? 'Update Event' : 'Create Event'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'messages':
        return <div>Redirecting to messages...</div>;
      default:
        return (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h2>
              <p className="text-gray-600">Select a tab to manage different sections</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-indigo-50/30">
      {/* Admin-specific Navbar */}
      <AdminNavbar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={logout}
        user={user}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {renderContent()}
      </div>

      {/* SINGLE Chatbot - REMOVED DUPLICATE */}
      <Chatbot />
    </div>
  );
};

export default AdminDashboard;