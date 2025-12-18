import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, XCircle, AlertCircle, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MentorshipDashboard = () => {
  const [matches, setMatches] = useState({
    suggested: [],
    pending: [],
    accepted: [],
    rejected: [],
    completed: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
    
    const interval = setInterval(() => {
      fetchMatches();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchMatches = async () => {
    try {
      const { data } = await axios.get('/api/ai-matching/status');
      setMatches(data.matches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (matchId, status, responseMessage = '') => {
    try {
      await axios.post('/api/ai-matching/respond', {
        matchId,
        status,
        responseMessage
      });
      alert(`Request ${status}!`);
      fetchMatches();
    } catch (error) {
      console.error('Error responding:', error);
      alert('Failed to respond to request');
    }
  };

  const handleMessageUser = (otherUser) => {
    navigate('/dashboard/messages', { 
      state: { 
        startConversationWith: otherUser 
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold text-lg">Loading mentorship connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 lg:p-8">
      {/* Page Title - Simple, no overlapping header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center mb-2">
          <Users className="w-9 h-9 md:w-10 md:h-10 mr-3 text-indigo-600" />
          My Mentorship Connections
        </h1>
        <p className="text-gray-600 text-base md:text-lg">
          Manage your mentorship requests and active connections
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Clock}
          label="Pending Requests"
          value={matches.pending.length}
          color="orange"
        />
        <StatCard
          icon={CheckCircle}
          label="Active Mentorships"
          value={matches.accepted.length}
          color="green"
        />
        <StatCard
          icon={AlertCircle}
          label="Suggestions"
          value={matches.suggested.length}
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Total Connections"
          value={matches.pending.length + matches.accepted.length}
          color="purple"
        />
      </div>

      {/* Pending Requests */}
      {matches.pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center">
            <Clock className="w-7 h-7 mr-3 text-orange-600" />
            {user?.role === 'alumni' ? 'Incoming Requests' : 'Sent Requests'}
          </h2>
          <div className="space-y-4">
            {matches.pending.map((match) => (
              <RequestCard
                key={match._id}
                match={match}
                userRole={user?.role}
                onRespond={handleRespond}
              />
            ))}
          </div>
        </div>
      )}

      {/* Active Mentorships */}
      {matches.accepted.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-7 h-7 mr-3 text-green-600" />
            Active Mentorships
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {matches.accepted.map((match) => (
              <ActiveMentorshipCard 
                key={match._id} 
                match={match} 
                userRole={user?.role}
                onMessage={handleMessageUser}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {matches.pending.length === 0 && matches.accepted.length === 0 && (
        <div className="text-center py-16 md:py-20 bg-white rounded-2xl shadow-lg border border-gray-200">
          <Users className="w-20 h-20 md:w-24 md:h-24 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">No Mentorship Connections</h3>
          <p className="text-gray-600 text-base md:text-lg max-w-md mx-auto px-4">
            {user?.role === 'student' 
              ? 'Find mentors using the AI Matching feature to get started!' 
              : 'Students will appear here when they send you mentorship requests.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600'
  };

  const iconBg = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    orange: 'bg-orange-100',
    purple: 'bg-purple-100'
  };

  return (
    <div className={`${colors[color]} border-2 rounded-xl shadow-md p-5 md:p-6 transition-all hover:shadow-lg`}>
      <div className={`w-12 h-12 md:w-14 md:h-14 ${iconBg[color]} rounded-xl flex items-center justify-center mb-3 shadow-sm`}>
        <Icon className="w-6 h-6 md:w-7 md:h-7" />
      </div>
      <p className="text-gray-700 text-sm md:text-base font-semibold">{label}</p>
      <p className="text-3xl md:text-4xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
};

const RequestCard = ({ match, userRole, onRespond }) => {
  const [showResponse, setShowResponse] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const otherUser = userRole === 'alumni' ? match.student : match.mentor;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5 md:p-6 hover:shadow-xl transition-all">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 space-y-3 md:space-y-0">
        <div className="flex items-start space-x-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
            {otherUser?.name?.charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="text-lg md:text-xl font-bold text-gray-900">{otherUser?.name}</h3>
            <p className="text-sm text-gray-600">{otherUser?.email}</p>
            {userRole === 'alumni' && (
              <p className="text-sm text-gray-600 mt-1">
                {match.student?.department} • Year {match.student?.currentYear}
              </p>
            )}
          </div>
        </div>
        <div className="self-start">
          <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm font-bold shadow-md inline-block">
            {match.matchScore}% Match
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm font-bold text-gray-700 mb-2">Topic:</p>
        <p className="text-gray-900 font-medium bg-indigo-50 px-4 py-2 rounded-lg">{match.mentorshipTopic}</p>
      </div>

      <div className="mb-5">
        <p className="text-sm font-bold text-gray-700 mb-2">Message:</p>
        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200 leading-relaxed">{match.requestMessage}</p>
      </div>

      {userRole === 'alumni' && !showResponse && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowResponse(true)}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-md flex items-center justify-center"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Accept
          </button>
          <button
            onClick={() => onRespond(match._id, 'rejected')}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all shadow-md flex items-center justify-center"
          >
            <XCircle className="w-5 h-5 mr-2" />
            Decline
          </button>
        </div>
      )}

      {showResponse && (
        <div className="space-y-3">
          <textarea
            value={responseMessage}
            onChange={(e) => setResponseMessage(e.target.value)}
            placeholder="Add a message (optional)..."
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-medium"
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                onRespond(match._id, 'accepted', responseMessage);
                setShowResponse(false);
              }}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-md"
            >
              Confirm Accept
            </button>
            <button
              onClick={() => setShowResponse(false)}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {userRole === 'student' && (
        <div className="text-center pt-4 border-t-2 border-gray-200 mt-4">
          <p className="text-sm text-gray-600 flex items-center justify-center font-medium">
            <Clock className="w-4 h-4 mr-2 animate-pulse" />
            Waiting for mentor response...
          </p>
        </div>
      )}
    </div>
  );
};

const ActiveMentorshipCard = ({ match, userRole, onMessage }) => {
  const otherUser = userRole === 'alumni' ? match.student : match.mentor;

  const handleMessageClick = () => {
    if (onMessage && otherUser) {
      onMessage(otherUser);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-l-4 border-green-500 p-5 md:p-6 hover:shadow-xl transition-all">
      <div className="flex items-start space-x-4 mb-4">
        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
          {otherUser?.name?.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">{otherUser?.name}</h3>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold ml-2 flex-shrink-0">
              Active
            </span>
          </div>
          <p className="text-sm text-gray-700 font-medium mb-1">{match.mentorshipTopic}</p>
          <p className="text-xs text-gray-500">
            {userRole === 'alumni' ? 'Mentee' : 'Mentor'} • Match Score: {match.matchScore}%
          </p>
        </div>
      </div>

      {match.responseMessage && (
        <div className="mb-4">
          <p className="text-sm font-bold text-gray-700 mb-2">Response:</p>
          <p className="text-gray-700 text-sm bg-green-50 p-3 rounded-lg border border-green-200 leading-relaxed">
            {match.responseMessage}
          </p>
        </div>
      )}

      <button 
        onClick={handleMessageClick}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md flex items-center justify-center space-x-2"
      >
        <MessageCircle className="w-5 h-5" />
        <span>Message {userRole === 'alumni' ? 'Mentee' : 'Mentor'}</span>
      </button>
    </div>
  );
};

export default MentorshipDashboard;
