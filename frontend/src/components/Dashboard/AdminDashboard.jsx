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
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Admin-specific Navbar Component
const AdminNavbar = ({ activeTab, onTabChange, onLogout, user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const adminTabs = [
    { id: 'events', name: 'Events', icon: Calendar },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'messages', name: 'Messages', icon: MessageSquare },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
              <p className="text-sm text-gray-500">System Administration</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {adminTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
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
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
              />
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3 bg-gray-50 rounded-lg px-3 py-2">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0) || 'AD'}
                </span>
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-medium text-gray-800">{user?.name}</p>
                <p className="text-gray-500 capitalize">Administrator</p>
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
              {adminTabs.map((tab) => {
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
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
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
        description: "A comprehensive workshop to guide students on career paths",
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
        description: "Annual alumni networking event",
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
        description: "Insights from industry leaders",
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
  const eventStats = {
    total: events.length,
    upcoming: events.filter(event => event.status === 'upcoming').length,
    completed: events.filter(event => event.status === 'completed').length,
    totalAttendees: events.reduce((sum, event) => sum + event.currentAttendees, 0)
  };

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
          <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Manage events and activities</p>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-700">Total Events</h3>
                  <p className="text-3xl font-bold text-blue-600">{eventStats.total}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-700">Upcoming</h3>
                  <p className="text-3xl font-bold text-green-600">{eventStats.upcoming}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-700">Completed</h3>
                  <p className="text-3xl font-bold text-gray-600">{eventStats.completed}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-700">Total Attendees</h3>
                  <p className="text-3xl font-bold text-purple-600">{eventStats.totalAttendees}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                  <div className="flex flex-col md:flex-row gap-4 flex-1">
                    {/* Search */}
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Search events..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    {/* Filters */}
                    <div className="flex gap-4">
                      <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filters.type}
                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                      >
                        <option value="all">All Types</option>
                        {eventTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      
                      <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  
                  {/* Create Event Button */}
                  <button
                    onClick={handleCreateEvent}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
                  >
                    Create Event
                  </button>
                </div>
              </div>

              {/* Events Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map(event => (
                  <div key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-200">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                          {event.type}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{event.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="font-semibold mr-2">Date:</span>
                          {formatDate(event.date)}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="font-semibold mr-2">Time:</span>
                          {event.time}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="font-semibold mr-2">Location:</span>
                          {event.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="font-semibold mr-2">Attendees:</span>
                          {event.currentAttendees} / {event.maxAttendees}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          event.status === 'upcoming' ? 'bg-green-100 text-green-800' :
                          event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {event.status}
                        </span>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-red-600 hover:text-red-800 font-semibold text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredEvents.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No events found matching your criteria.</p>
                </div>
              )}

              {/* Event Form Modal */}
              {showEventForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                      <h2 className="text-2xl font-bold mb-6">
                        {editingEvent ? 'Edit Event' : 'Create New Event'}
                      </h2>
                      
                      <form onSubmit={handleSubmitEvent} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Event Title *
                            </label>
                            <input
                              type="text"
                              name="title"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={eventForm.title}
                              onChange={handleInputChange}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Event Type *
                            </label>
                            <select
                              name="type"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={eventForm.type}
                              onChange={handleInputChange}
                            >
                              {eventTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Date *
                            </label>
                            <input
                              type="date"
                              name="date"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={eventForm.date}
                              onChange={handleInputChange}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Time *
                            </label>
                            <input
                              type="time"
                              name="time"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={eventForm.time}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Location *
                            </label>
                            <input
                              type="text"
                              name="location"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={eventForm.location}
                              onChange={handleInputChange}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Max Attendees *
                            </label>
                            <input
                              type="number"
                              name="maxAttendees"
                              required
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={eventForm.maxAttendees}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Description *
                          </label>
                          <textarea
                            name="description"
                            required
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={eventForm.description}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Duration
                            </label>
                            <input
                              type="text"
                              name="duration"
                              placeholder="e.g., 2 hours"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={eventForm.duration}
                              onChange={handleInputChange}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Organizer
                            </label>
                            <input
                              type="text"
                              name="organizer"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={eventForm.organizer}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                          <button
                            type="button"
                            onClick={() => setShowEventForm(false)}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
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
          </div>
        );
      case 'messages':
        // Navigate to messages page - this will use the route from App.js
        window.location.href = '/messages';
        return <div>Redirecting to messages...</div>;
      default:
        return (
          <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Select a tab to manage different sections</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin-specific Navbar */}
      <AdminNavbar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={logout}
        user={user}
      />

      {renderContent()}
    </div>
  );
};

export default AdminDashboard;