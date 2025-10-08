import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';


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

  useEffect(() => {
    fetchMatches();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Mentorship Connections</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Mentorships</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.accepted.map((match) => (
              <ActiveMentorshipCard key={match._id} match={match} userRole={user?.role} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className={`w-12 h-12 ${colors[color]} rounded-lg flex items-center justify-center mb-3`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

const RequestCard = ({ match, userRole, onRespond }) => {
  const [showResponse, setShowResponse] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const otherUser = userRole === 'alumni' ? match.student : match.mentor;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {otherUser?.name?.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{otherUser?.name}</h3>
            <p className="text-sm text-gray-600">{otherUser?.email}</p>
            {userRole === 'alumni' && (
              <p className="text-sm text-gray-600">{match.student?.department} - Year {match.student?.currentYear}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            {match.matchScore}% Match
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-1">Topic:</p>
        <p className="text-gray-900">{match.mentorshipTopic}</p>
      </div>

      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-1">Message:</p>
        <p className="text-gray-700 bg-gray-50 p-3 rounded">{match.requestMessage}</p>
      </div>

      {userRole === 'alumni' && !showResponse && (
        <div className="flex space-x-3">
          <button
            onClick={() => setShowResponse(true)}
            className="flex-1 bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 flex items-center justify-center"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Accept
          </button>
          <button
            onClick={() => onRespond(match._id, 'rejected')}
            className="flex-1 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 flex items-center justify-center"
          >
            <XCircle className="w-4 h-4 mr-2" />
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="flex space-x-3">
            <button
              onClick={() => {
                onRespond(match._id, 'accepted', responseMessage);
                setShowResponse(false);
              }}
              className="flex-1 bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600"
            >
              Confirm Accept
            </button>
            <button
              onClick={() => setShowResponse(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ActiveMentorshipCard = ({ match, userRole }) => {
  const otherUser = userRole === 'alumni' ? match.student : match.mentor;

  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
      <div className="flex items-start space-x-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {otherUser?.name?.charAt(0)}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{otherUser?.name}</h3>
          <p className="text-sm text-gray-600">{match.mentorshipTopic}</p>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
          Active
        </span>
      </div>

      {match.responseMessage && (
        <div className="mb-3">
          <p className="text-sm font-semibold text-gray-700 mb-1">Response:</p>
          <p className="text-gray-700 text-sm bg-green-50 p-2 rounded">{match.responseMessage}</p>
        </div>
      )}

      <button className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600">
        Message {userRole === 'alumni' ? 'Mentee' : 'Mentor'}
      </button>
    </div>
  );
};

export default MentorshipDashboard;