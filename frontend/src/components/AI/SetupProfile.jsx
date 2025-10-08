import React, { useState, useEffect } from 'react';
import { Save, Plus, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const SetupProfile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    interests: [],
    skills: [],
    careerGoals: [],
    industryPreferences: [],
    lookingForMentor: false,
    availableAsMentor: false,
    mentorshipAreas: [],
    bio: ''
  });
  const [newItem, setNewItem] = useState({
    interest: '',
    skill: '',
    careerGoal: '',
    industry: '',
    mentorshipArea: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load existing profile data
    if (user) {
      setFormData({
        interests: user.interests || [],
        skills: user.skills || [],
        careerGoals: user.careerGoals || [],
        industryPreferences: user.industryPreferences || [],
        lookingForMentor: user.lookingForMentor || false,
        availableAsMentor: user.availableAsMentor || false,
        mentorshipAreas: user.mentorshipAreas || [],
        bio: user.bio || ''
      });
    }
  }, [user]);

  const addItem = (field, itemField) => {
    if (newItem[itemField].trim()) {
      setFormData({
        ...formData,
        [field]: [...formData[field], newItem[itemField].trim()]
      });
      setNewItem({ ...newItem, [itemField]: '' });
    }
  };

  const removeItem = (field, index) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.put('/api/ai-matching/profile', formData);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Setup Your AI Matching Profile</h2>
        <p className="text-gray-600 mb-6">Help us find the perfect mentor matches for you</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell us about yourself, your background, and aspirations..."
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newItem.skill}
                onChange={(e) => setNewItem({ ...newItem, skill: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., JavaScript, Python, React..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('skills', 'skill'))}
              />
              <button
                type="button"
                onClick={() => addItem('skills', 'skill')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center space-x-2">
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeItem('skills', idx)}
                    className="text-blue-700 hover:text-blue-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interests
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newItem.interest}
                onChange={(e) => setNewItem({ ...newItem, interest: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., AI, Web Development, Data Science..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('interests', 'interest'))}
              />
              <button
                type="button"
                onClick={() => addItem('interests', 'interest')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.interests.map((interest, idx) => (
                <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full flex items-center space-x-2">
                  <span>{interest}</span>
                  <button
                    type="button"
                    onClick={() => removeItem('interests', idx)}
                    className="text-purple-700 hover:text-purple-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Career Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Career Goals
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newItem.careerGoal}
                onChange={(e) => setNewItem({ ...newItem, careerGoal: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Become a Software Engineer at FAANG..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('careerGoals', 'careerGoal'))}
              />
              <button
                type="button"
                onClick={() => addItem('careerGoals', 'careerGoal')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.careerGoals.map((goal, idx) => (
                <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full flex items-center space-x-2">
                  <span>{goal}</span>
                  <button
                    type="button"
                    onClick={() => removeItem('careerGoals', idx)}
                    className="text-green-700 hover:text-green-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Industry Preferences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry Preferences
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newItem.industry}
                onChange={(e) => setNewItem({ ...newItem, industry: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Technology, Finance, Healthcare..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('industryPreferences', 'industry'))}
              />
              <button
                type="button"
                onClick={() => addItem('industryPreferences', 'industry')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.industryPreferences.map((industry, idx) => (
                <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full flex items-center space-x-2">
                  <span>{industry}</span>
                  <button
                    type="button"
                    onClick={() => removeItem('industryPreferences', idx)}
                    className="text-orange-700 hover:text-orange-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Mentorship Preferences */}
          {user?.role === 'student' && (
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.lookingForMentor}
                  onChange={(e) => setFormData({ ...formData, lookingForMentor: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">I'm looking for a mentor</span>
              </label>
            </div>
          )}

          {user?.role === 'alumni' && (
            <>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.availableAsMentor}
                    onChange={(e) => setFormData({ ...formData, availableAsMentor: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">I'm available as a mentor</span>
                </label>
              </div>

              {formData.availableAsMentor && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mentorship Areas
                  </label>
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={newItem.mentorshipArea}
                      onChange={(e) => setNewItem({ ...newItem, mentorshipArea: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Career guidance, Technical skills..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('mentorshipAreas', 'mentorshipArea'))}
                    />
                    <button
                      type="button"
                      onClick={() => addItem('mentorshipAreas', 'mentorshipArea')}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.mentorshipAreas.map((area, idx) => (
                      <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full flex items-center space-x-2">
                        <span>{area}</span>
                        <button
                          type="button"
                          onClick={() => removeItem('mentorshipAreas', idx)}
                          className="text-indigo-700 hover:text-indigo-900"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupProfile;