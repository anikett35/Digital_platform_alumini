import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, MapPin, Users, Filter, Search, X, Check,
  AlertCircle, Loader, ChevronRight, Tag, Building
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const EventsPage = ({ embedded = false }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    search: ''
  });
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'registered'

  const eventTypes = ['Workshop', 'Networking', 'Seminar', 'Conference', 'Webinar', 'Social', 'Career Fair'];

  useEffect(() => {
    fetchEvents();
    fetchMyEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      
      const response = await axios.get(
        `${API_URL}/events?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setEvents(response.data.events || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.response?.data?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/events/my-events`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setMyEvents(response.data.events || []);
    } catch (err) {
      console.error('Error fetching my events:', err);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/events/${eventId}/register`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Refresh events
      fetchEvents();
      fetchMyEvents();
      
      alert('Successfully registered for event!');
    } catch (err) {
      console.error('Error registering for event:', err);
      alert(err.response?.data?.message || 'Failed to register for event');
    }
  };

  const handleUnregister = async (eventId) => {
    if (!window.confirm('Are you sure you want to unregister from this event?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_URL}/events/${eventId}/unregister`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Refresh events
      fetchEvents();
      fetchMyEvents();
      
      alert('Successfully unregistered from event');
    } catch (err) {
      console.error('Error unregistering from event:', err);
      alert(err.response?.data?.message || 'Failed to unregister from event');
    }
  };

  const isRegistered = (eventId) => {
    return myEvents.some(e => e._id === eventId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEventTypeColor = (type) => {
    const colors = {
      'Workshop': 'bg-blue-100 text-blue-800',
      'Networking': 'bg-green-100 text-green-800',
      'Seminar': 'bg-purple-100 text-purple-800',
      'Conference': 'bg-orange-100 text-orange-800',
      'Webinar': 'bg-teal-100 text-teal-800',
      'Social': 'bg-pink-100 text-pink-800',
      'Career Fair': 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const displayEvents = activeTab === 'all' ? events : myEvents;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600">Loading events...</span>
      </div>
    );
  }

  return (
    <div className={embedded ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
      {/* Header */}
      {!embedded && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Events Calendar</h1>
          <p className="text-gray-600">Discover and register for upcoming events</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          All Events ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('registered')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'registered'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          My Events ({myEvents.length})
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>

          {/* Type Filter */}
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

          {/* Status Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="all">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-4">
        {displayEvents.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {activeTab === 'all' ? 'No events found' : 'You have not registered for any events yet'}
            </p>
          </div>
        ) : (
          displayEvents.map(event => {
            const registered = isRegistered(event._id);
            const currentAttendees = event.attendees?.filter(a => a.status === 'registered').length || 0;
            const isFull = currentAttendees >= event.maxAttendees;

            return (
              <div
                key={event._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-start space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 flex-1">
                          {event.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEventTypeColor(event.type)}`}>
                          {event.type}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        {event.description}
                      </p>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="font-medium">{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-green-500" />
                      <span className="font-medium">{event.time}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-red-500" />
                      <span className="font-medium">{event.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2 text-purple-500" />
                      <span className="font-medium">
                        {currentAttendees} / {event.maxAttendees} registered
                      </span>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>Duration: {event.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-1" />
                      <span>By: {event.organizer}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      event.status === 'upcoming' ? 'bg-green-100 text-green-800' :
                      event.status === 'ongoing' ? 'bg-yellow-100 text-yellow-800' :
                      event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>

                    {user?.role !== 'admin' && event.status === 'upcoming' && (
                      <div>
                        {registered ? (
                          <button
                            onClick={() => handleUnregister(event._id)}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                          >
                            <X className="w-4 h-4" />
                            <span>Unregister</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRegister(event._id)}
                            disabled={isFull}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                              isFull
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                            <span>{isFull ? 'Event Full' : 'Register'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EventsPage;