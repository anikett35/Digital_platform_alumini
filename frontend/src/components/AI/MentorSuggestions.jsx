import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Building, 
  Send,
  Sparkles,
  Target,
  Award,
  Briefcase
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const MentorSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/ai-matching/suggestions', {
        params: { limit: 12, minScore: 30 }
      });
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
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
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Brain className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">AI Mentor Matching</h1>
        </div>
        <p className="text-gray-600 flex items-center">
          <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
          Our AI has analyzed {suggestions.length} potential mentors based on your profile
        </p>
      </div>

      {/* Suggestions Grid */}
      {suggestions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Matches Found</h3>
          <p className="text-gray-600">Complete your profile to get better mentor suggestions</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.map((suggestion) => (
            <MentorCard
              key={suggestion.mentor._id}
              suggestion={suggestion}
              onConnect={(mentor) => {
                setSelectedMentor(mentor);
                setShowRequestModal(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <MentorRequestModal
          mentor={selectedMentor}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedMentor(null);
          }}
          onSuccess={() => {
            setShowRequestModal(false);
            fetchSuggestions();
          }}
        />
      )}
    </div>
  );
};

const MentorCard = ({ suggestion, onConnect }) => {
  const { mentor, matchScore, matchFactors } = suggestion;

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-blue-500 to-blue-600';
    if (score >= 40) return 'from-orange-500 to-orange-600';
    return 'from-gray-500 to-gray-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Score Badge */}
      <div className={`bg-gradient-to-r ${getScoreColor(matchScore)} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span className="font-semibold">Match Score</span>
          </div>
          <span className="text-2xl font-bold">{matchScore}%</span>
        </div>
      </div>

      {/* Mentor Info */}
      <div className="p-6">
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {mentor.name?.charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{mentor.name}</h3>
            <p className="text-sm text-gray-600 flex items-center mb-1">
              <Briefcase className="w-4 h-4 mr-1" />
              {mentor.currentPosition}
            </p>
            <p className="text-sm text-gray-600 flex items-center">
              <Building className="w-4 h-4 mr-1" />
              {mentor.currentCompany}
            </p>
          </div>
        </div>

        {/* Match Factors */}
        <div className="space-y-2 mb-4">
          <MatchFactor label="Skills" score={matchFactors.skillsMatch} />
          <MatchFactor label="Interests" score={matchFactors.interestsMatch} />
          <MatchFactor label="Industry" score={matchFactors.industryMatch} />
        </div>

        {/* Skills Tags */}
        {mentor.skills && mentor.skills.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">SKILLS</p>
            <div className="flex flex-wrap gap-2">
              {mentor.skills.slice(0, 4).map((skill, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {skill}
                </span>
              ))}
              {mentor.skills.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{mentor.skills.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Connect Button */}
        <button
          onClick={() => onConnect(mentor)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
        >
          <Send className="w-4 h-4" />
          <span>Request Mentorship</span>
        </button>
      </div>
    </div>
  );
};

const MatchFactor = ({ label, score }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs font-medium text-gray-600">{label}</span>
      <span className="text-xs font-bold text-gray-700">{score}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all ${
          score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-blue-500' : 'bg-orange-500'
        }`}
        style={{ width: `${score}%` }}
      ></div>
    </div>
  </div>
);

const MentorRequestModal = ({ mentor, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    message: '',
    topic: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/ai-matching/request', {
        mentorId: mentor._id,
        message: formData.message,
        topic: formData.topic
      });

      alert('Mentorship request sent successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error sending request:', error);
      alert('Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Request Mentorship</h2>
          <p className="text-gray-600 mt-1">Connect with {mentor.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mentorship Topic *
            </label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Career guidance in software engineering"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Introduce yourself and explain why you'd like their mentorship..."
              required
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MentorSuggestions;