// frontend/src/components/Profiles/SetupProfile.jsx
// COMPLETE FIXED VERSION

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, api } from '../../context/AuthContext'; // Import 'api' from AuthContext
import { User, Briefcase, Target, Award, MapPin, Linkedin, Github, Tag } from 'lucide-react';

const SetupProfile = () => {
  const { user, updateProfile } = useAuth(); // Use updateProfile, not updateUser
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    profileHeadline: '',
    bio: '',
    location: '',
    skills: [],
    interests: [],
    linkedinUrl: '',
    githubUrl: '',
    // Student fields
    currentYear: '',
    enrollmentYear: '',
    careerGoals: [],
    industryPreferences: [],
    lookingForMentor: false,
    // Alumni fields
    currentPosition: '',
    currentCompany: '',
    industry: '',
    graduationYear: '',
    availableAsMentor: false,
    mentorshipAreas: [],
    yearsOfExperience: 0
  });

  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [careerGoalInput, setCareerGoalInput] = useState('');
  const [industryPrefInput, setIndustryPrefInput] = useState('');
  const [mentorshipAreaInput, setMentorshipAreaInput] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // Use the configured 'api' instance from AuthContext
      const { data } = await api.get('/api/ai-matching/profile');
      if (data.user.profile) {
        setFormData({
          ...formData,
          ...data.user.profile
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const addToArray = (field, value, setInput) => {
    if (value.trim()) {
      setFormData({
        ...formData,
        [field]: [...(formData[field] || []), value.trim()]
      });
      setInput('');
    }
  };

  const removeFromArray = (field, index) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Submitting profile data:', formData);
      
      // Use the configured 'api' instance from AuthContext
      const { data } = await api.put('/api/ai-matching/profile', formData);
      
      console.log('Profile saved successfully:', data);
      
      // Profile saved successfully! No need to call updateProfile again
      // The response already contains the updated user data
      alert('Profile updated successfully!');
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const isStudent = user?.role === 'student';
  const isAlumni = user?.role === 'alumni';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600 mb-6">
            {isStudent 
              ? 'Tell us about yourself to connect with alumni mentors'
              : 'Share your professional journey to help guide students'
            }
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Basic Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Headline
                  </label>
                  <input
                    type="text"
                    name="profileHeadline"
                    value={formData.profileHeadline}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={isStudent ? "e.g., Computer Science Student" : "e.g., Software Engineer"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Pune, India"
                  />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-600" />
                Skills
              </h2>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('skills', skillInput, setSkillInput))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., JavaScript, Python, React"
                />
                <button
                  type="button"
                  onClick={() => addToArray('skills', skillInput, setSkillInput)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.skills?.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeFromArray('skills', index)}
                      className="ml-2 text-blue-900 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-blue-600" />
                Interests
              </h2>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('interests', interestInput, setInterestInput))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., AI, Web Development, Open Source"
                />
                <button
                  type="button"
                  onClick={() => addToArray('interests', interestInput, setInterestInput)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.interests?.map((interest, index) => (
                  <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center">
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeFromArray('interests', index)}
                      className="ml-2 text-purple-900 hover:text-purple-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Student Specific Fields */}
            {isStudent && (
              <>
                <div className="border-b pb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-600" />
                    Student Information
                  </h2>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Year
                      </label>
                      <select
                        name="currentYear"
                        value={formData.currentYear}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Year</option>
                        <option value="1">First Year</option>
                        <option value="2">Second Year</option>
                        <option value="3">Third Year</option>
                        <option value="4">Fourth Year</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enrollment Year
                      </label>
                      <input
                        type="number"
                        name="enrollmentYear"
                        value={formData.enrollmentYear}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 2021"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Career Goals
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={careerGoalInput}
                        onChange={(e) => setCareerGoalInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('careerGoals', careerGoalInput, setCareerGoalInput))}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Software Engineer at Google"
                      />
                      <button
                        type="button"
                        onClick={() => addToArray('careerGoals', careerGoalInput, setCareerGoalInput)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.careerGoals?.map((goal, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center">
                          {goal}
                          <button
                            type="button"
                            onClick={() => removeFromArray('careerGoals', index)}
                            className="ml-2 text-green-900 hover:text-green-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry Preferences
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={industryPrefInput}
                        onChange={(e) => setIndustryPrefInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('industryPreferences', industryPrefInput, setIndustryPrefInput))}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Technology, Finance, Healthcare"
                      />
                      <button
                        type="button"
                        onClick={() => addToArray('industryPreferences', industryPrefInput, setIndustryPrefInput)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.industryPreferences?.map((industry, index) => (
                        <span key={index} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm flex items-center">
                          {industry}
                          <button
                            type="button"
                            onClick={() => removeFromArray('industryPreferences', index)}
                            className="ml-2 text-orange-900 hover:text-orange-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="lookingForMentor"
                      checked={formData.lookingForMentor}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">I'm looking for a mentor</span>
                  </label>
                </div>
              </>
            )}

            {/* Alumni Specific Fields */}
            {isAlumni && (
              <>
                <div className="border-b pb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                    Professional Information
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Position
                      </label>
                      <input
                        type="text"
                        name="currentPosition"
                        value={formData.currentPosition}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Senior Software Engineer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Company
                      </label>
                      <input
                        type="text"
                        name="currentCompany"
                        value={formData.currentCompany}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Google"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Industry
                        </label>
                        <input
                          type="text"
                          name="industry"
                          value={formData.industry}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Technology"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Years of Experience
                        </label>
                        <input
                          type="number"
                          name="yearsOfExperience"
                          value={formData.yearsOfExperience}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 5"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Graduation Year
                      </label>
                      <input
                        type="number"
                        name="graduationYear"
                        value={formData.graduationYear}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 2018"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mentorship Areas
                      </label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={mentorshipAreaInput}
                          onChange={(e) => setMentorshipAreaInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('mentorshipAreas', mentorshipAreaInput, setMentorshipAreaInput))}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Career guidance, Technical interviews"
                        />
                        <button
                          type="button"
                          onClick={() => addToArray('mentorshipAreas', mentorshipAreaInput, setMentorshipAreaInput)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.mentorshipAreas?.map((area, index) => (
                          <span key={index} className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm flex items-center">
                            {area}
                            <button
                              type="button"
                              onClick={() => removeFromArray('mentorshipAreas', index)}
                              className="ml-2 text-teal-900 hover:text-teal-700"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="availableAsMentor"
                        checked={formData.availableAsMentor}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">I'm available as a mentor</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Social Links */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Linkedin className="w-5 h-5 mr-2 text-blue-600" />
                Social Links
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://github.com/yourusername"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetupProfile;