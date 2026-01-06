import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, MapPin, Users, Filter, Search, X, Check,
  AlertCircle, Loader, ChevronRight, Tag, Building,
  ExternalLink, Briefcase, GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const EventsPage = ({ embedded = false }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'upcoming', // Default to upcoming events
    search: ''
  });
  const [expandedEvent, setExpandedEvent] = useState(null);

  const eventTypes = ['Workshop', 'Networking', 'Seminar', 'Conference', 'Webinar', 'Social', 'Career Fair'];

  useEffect(() => {
    fetchEvents();
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
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

  const getEventTypeIcon = (type) => {
    const icons = {
      'Workshop': <Briefcase className="w-4 h-4" />,
      'Networking': <Users className="w-4 h-4" />,
      'Seminar': <GraduationCap className="w-4 h-4" />,
      'Conference': <Calendar className="w-4 h-4" />,
      'Webinar': <ExternalLink className="w-4 h-4" />,
      'Social': <Users className="w-4 h-4" />,
      'Career Fair': <Briefcase className="w-4 h-4" />
    };
    return icons[type] || <Calendar className="w-4 h-4" />;
  };

  const getStatusBadge = (status) => {
    const badges = {
      'upcoming': { color: 'bg-green-100 text-green-800', text: 'Upcoming' },
      'ongoing': { color: 'bg-yellow-100 text-yellow-800', text: 'Live Now' },
      'completed': { color: 'bg-gray-100 text-gray-800', text: 'Completed' },
      'cancelled': { color: 'bg-red-100 text-red-800', text: 'Cancelled' }
    };
    const badge = badges[status] || badges.upcoming;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const toggleEventDetails = (eventId) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <span className="ml-3 text-gray-600 text-lg mt-4 block">Loading events...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={embedded ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
      {/* Header */}
      {!embedded && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Events Calendar</h1>
          <p className="text-gray-600">Discover upcoming alumni and professional events</p>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{events.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">
                {events.filter(e => e.status === 'upcoming').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg mr-4">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ongoing</p>
              <p className="text-2xl font-bold text-gray-900">
                {events.filter(e => e.status === 'ongoing').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Attendance</p>
              <p className="text-2xl font-bold text-gray-900">
                {events.length > 0 
                  ? Math.round(events.reduce((acc, e) => acc + (e.attendees?.length || 0), 0) / events.length)
                  : 0
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 mb-8 border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search events by title, description, or organizer..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <select
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base appearance-none bg-white"
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="all">All Types</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Clock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <select
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base appearance-none bg-white"
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
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
          <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <p className="text-gray-600 text-xl mb-2">No events found</p>
          <p className="text-gray-500">Try adjusting your filters or check back later for new events.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map(event => {
            const currentAttendees = event.attendees?.filter(a => a.status === 'registered').length || 0;
            const isFull = currentAttendees >= event.maxAttendees;

            return (
              <div
                key={event._id}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Event Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        {getEventTypeIcon(event.type)}
                      </div>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getEventTypeColor(event.type)}`}>
                          {event.type}
                        </span>
                        <div className="mt-2">
                          {getStatusBadge(event.status)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {new Date(event.date).getDate()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {event.title}
                  </h3>
                  
                  <p className="text-gray-600 line-clamp-2">
                    {event.description}
                  </p>
                </div>

                {/* Event Details */}
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{formatDate(event.date)}</div>
                        <div className="text-sm text-gray-500">{formatTime(event.time)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Duration</div>
                        <div className="text-sm text-gray-500">{event.duration}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Location</div>
                        <div className="text-sm text-gray-500">{event.location}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <Building className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Organizer</div>
                        <div className="text-sm text-gray-500">{event.organizer}</div>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Info */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Attendance</span>
                      <span className="text-sm font-medium text-gray-900">
                        {currentAttendees} / {event.maxAttendees}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${isFull ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min((currentAttendees / event.maxAttendees) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex justify-between">
                      <span>{isFull ? 'Event Full' : 'Spots Available'}</span>
                      <span>{Math.round((currentAttendees / event.maxAttendees) * 100)}% filled</span>
                    </div>
                  </div>

                  {/* Event Details Toggle */}
                  <button
                    onClick={() => toggleEventDetails(event._id)}
                    className="w-full flex items-center justify-center space-x-2 py-3 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <span>{expandedEvent === event._id ? 'Show Less' : 'View Details'}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${expandedEvent === event._id ? 'rotate-90' : ''}`} />
                  </button>

                  {/* Expanded Details */}
                  {expandedEvent === event._id && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h4 className="font-semibold text-gray-900 mb-3">Event Details</h4>
                      <div className="prose prose-blue max-w-none text-gray-600">
                        <p className="mb-4">{event.description}</p>
                        
                        {event.agenda && (
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-900 mb-2">Agenda</h5>
                            <ul className="list-disc pl-5 space-y-1">
                              {event.agenda.split('\n').map((item, idx) => (
                                <li key={idx} className="text-gray-600">{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {event.speakers && (
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-900 mb-2">Speakers</h5>
                            <p className="text-gray-600">{event.speakers}</p>
                          </div>
                        )}

                        {event.prerequisites && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Prerequisites</h5>
                            <p className="text-gray-600">{event.prerequisites}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Event Status Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Upcoming - Registration Open</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Ongoing - Live Event</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Completed - Past Event</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;