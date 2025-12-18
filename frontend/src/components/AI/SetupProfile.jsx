import React, { useState, useEffect } from 'react';
import { 
  Save, 
  User, 
  Briefcase, 
  GraduationCap, 
  MapPin, 
  Award, 
  Target,
  Linkedin,
  Github,
  Loader2,
  CheckCircle,
  XCircle,
  Building,
  Star,
  Zap
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileSetup = () => {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    // Common fields
    bio: '',
    location: '',
    skills: [],
    interests: [],
    linkedinUrl: '',
    githubUrl: '',
    profileHeadline: '',
    industry: '',
    
    // Student specific
    currentYear: 1,
    enrollmentYear: new Date().getFullYear(),
    careerGoals: [],
    lookingForMentor: false,
    industryPreferences: [],
    
    // Alumni specific
    currentPosition: '',
    currentCompany: '',
    graduationYear: new Date().getFullYear(),
    availableAsMentor: false,
    mentorshipAreas: []
  });

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newMentorshipArea, setNewMentorshipArea] = useState('');
  const [newIndustryPref, setNewIndustryPref] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Determine user role
  const userRole = user?.role || 'student';
  console.log('User role for profile setup:', userRole);

  // Load existing profile data
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        const authToken = token || localStorage.getItem('token');
        
        if (!authToken) {
          navigate('/login');
          return;
        }

        console.log('Loading profile data with token:', authToken);
        
        // Try to get current profile from API
        const { data } = await axios.get('/api/user/me', {
          headers: { 
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Profile API response:', data);
        
        if (data.success && data.user) {
          console.log('Loaded profile data from API:', data.user);
          setFormData(prev => ({
            ...prev,
            bio: data.user.bio || '',
            location: data.user.location || '',
            skills: data.user.skills || [],
            interests: data.user.interests || [],
            linkedinUrl: data.user.linkedinUrl || '',
            githubUrl: data.user.githubUrl || '',
            profileHeadline: data.user.profileHeadline || '',
            industry: data.user.industry || '',
            currentYear: data.user.currentYear || 1,
            enrollmentYear: data.user.enrollmentYear || new Date().getFullYear(),
            careerGoals: data.user.careerGoals || [],
            lookingForMentor: data.user.lookingForMentor || false,
            industryPreferences: data.user.industryPreferences || [],
            currentPosition: data.user.currentPosition || '',
            currentCompany: data.user.currentCompany || '',
            graduationYear: data.user.graduationYear || new Date().getFullYear(),
            availableAsMentor: data.user.availableAsMentor || false,
            mentorshipAreas: data.user.mentorshipAreas || []
          }));
        } else {
          console.error('Failed to load profile:', data.message);
        }
      } catch (error) {
        console.error('Error loading profile from API:', error.response?.data || error.message);
        // If API fails, use context user data
        if (user) {
          console.log('Using context user data as fallback');
          setFormData(prev => ({
            ...prev,
            bio: user.bio || '',
            location: user.location || '',
            skills: user.skills || [],
            interests: user.interests || [],
            linkedinUrl: user.linkedinUrl || '',
            githubUrl: user.githubUrl || '',
            currentYear: user.currentYear || 1,
            enrollmentYear: user.enrollmentYear || new Date().getFullYear(),
            careerGoals: user.careerGoals || [],
            lookingForMentor: user.lookingForMentor || false,
            industryPreferences: user.industryPreferences || [],
            currentPosition: user.currentPosition || '',
            currentCompany: user.currentCompany || '',
            graduationYear: user.graduationYear || new Date().getFullYear(),
            availableAsMentor: user.availableAsMentor || false,
            mentorshipAreas: user.mentorshipAreas || []
          }));
        }
      } finally {
        setLoading(false);
      }
    };

    if (token || localStorage.getItem('token')) {
      loadProfileData();
    } else {
      setLoading(false);
      navigate('/login');
    }
  }, [user, token, navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addArrayItem = (field, value, setter) => {
    const trimmedValue = value.trim();
    if (trimmedValue && !formData[field].includes(trimmedValue)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], trimmedValue]
      }));
      setter('');
    }
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const authToken = token || localStorage.getItem('token');
      
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      console.log('Saving profile data to database:', formData);
      
      // Send to correct API endpoint
      const { data } = await axios.put(
        '/api/user/update',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Database save response:', data);

      if (data.success) {
        // Update context if available
        if (updateUser && data.user) {
          updateUser(data.user);
        }
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setMessage({
          type: 'success',
          text: 'Profile saved to database successfully!'
        });

        // Show success message for 2 seconds then redirect
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to save profile to database');
      }
    } catch (error) {
      console.error('Database save error:', error.response?.data || error.message);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 
             error.response?.data?.error || 
             'Failed to save profile to database. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  // Student Form
  const renderStudentForm = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <GraduationCap className="w-5 h-5" /> Student Information
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Current Year</label>
          <select
            value={formData.currentYear}
            onChange={(e) => handleInputChange('currentYear', parseInt(e.target.value))}
            className="w-full p-2 border rounded"
          >
            <option value="1">First Year</option>
            <option value="2">Second Year</option>
            <option value="3">Third Year</option>
            <option value="4">Fourth Year</option>
            <option value="5">Fifth Year</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Enrollment Year</label>
          <input
            type="number"
            value={formData.enrollmentYear}
            onChange={(e) => handleInputChange('enrollmentYear', e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g., 2022"
            min="2000"
            max={new Date().getFullYear()}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Career Goals</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="e.g., Software Engineer at Google"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('careerGoals', newGoal, setNewGoal))}
          />
          <button
            type="button"
            onClick={() => addArrayItem('careerGoals', newGoal, setNewGoal)}
            className="px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.careerGoals.map((goal, idx) => (
            <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm flex items-center gap-1">
              <Target className="w-3 h-3" />
              {goal}
              <button
                type="button"
                onClick={() => removeArrayItem('careerGoals', idx)}
                className="text-blue-600 hover:text-blue-800 ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Industry Preferences</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newIndustryPref}
            onChange={(e) => setNewIndustryPref(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="e.g., Technology, Finance, Healthcare"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('industryPreferences', newIndustryPref, setNewIndustryPref))}
          />
          <button
            type="button"
            onClick={() => addArrayItem('industryPreferences', newIndustryPref, setNewIndustryPref)}
            className="px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.industryPreferences.map((industry, idx) => (
            <span key={idx} className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm">
              <Building className="w-3 h-3 inline mr-1" />
              {industry}
              <button
                type="button"
                onClick={() => removeArrayItem('industryPreferences', idx)}
                className="text-purple-600 hover:text-purple-800 ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded">
        <input
          type="checkbox"
          id="lookingForMentor"
          checked={formData.lookingForMentor}
          onChange={(e) => handleInputChange('lookingForMentor', e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="lookingForMentor" className="text-sm font-medium">
          Looking for a mentor
        </label>
      </div>
    </div>
  );

  // Alumni Form
  const renderAlumniForm = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Briefcase className="w-5 h-5" /> Professional Information
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Current Position</label>
          <input
            type="text"
            value={formData.currentPosition}
            onChange={(e) => handleInputChange('currentPosition', e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g., Senior Software Engineer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Current Company</label>
          <input
            type="text"
            value={formData.currentCompany}
            onChange={(e) => handleInputChange('currentCompany', e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g., Google, Microsoft"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Graduation Year</label>
          <input
            type="number"
            value={formData.graduationYear}
            onChange={(e) => handleInputChange('graduationYear', e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g., 2020"
            min="1980"
            max={new Date().getFullYear()}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Industry</label>
          <input
            type="text"
            value={formData.industry}
            onChange={(e) => handleInputChange('industry', e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g., Technology, Finance"
          />
        </div>
      </div>

      <div className="p-3 bg-blue-50 rounded">
        <div className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            id="availableAsMentor"
            checked={formData.availableAsMentor}
            onChange={(e) => handleInputChange('availableAsMentor', e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="availableAsMentor" className="text-sm font-medium">
            Available as mentor
          </label>
        </div>
        
        {formData.availableAsMentor && (
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1">Mentorship Areas</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newMentorshipArea}
                onChange={(e) => setNewMentorshipArea(e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder="e.g., Career guidance, Technical interviews"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('mentorshipAreas', newMentorshipArea, setNewMentorshipArea))}
              />
              <button
                type="button"
                onClick={() => addArrayItem('mentorshipAreas', newMentorshipArea, setNewMentorshipArea)}
                className="px-4 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.mentorshipAreas.map((area, idx) => (
                <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
                  <Target className="w-3 h-3 inline mr-1" />
                  {area}
                  <button
                    type="button"
                    onClick={() => removeArrayItem('mentorshipAreas', idx)}
                    className="text-green-600 hover:text-green-800 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Common Fields
  const renderCommonFields = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <User className="w-5 h-5" /> Basic Information
        </h3>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Profile Headline</label>
        <input
          type="text"
          value={formData.profileHeadline}
          onChange={(e) => handleInputChange('profileHeadline', e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="e.g., Passionate Software Developer | AI Enthusiast"
          maxLength={200}
        />
        <p className="text-xs text-gray-500 mt-1">
          A brief headline that appears on your profile
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Bio</label>
        <textarea
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          rows={3}
          className="w-full p-2 border rounded"
          placeholder="Tell us about yourself, your background, and aspirations..."
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.bio.length}/500 characters
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="e.g., New York, NY"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Skills</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="e.g., JavaScript, React, Python"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('skills', newSkill, setNewSkill))}
          />
          <button
            type="button"
            onClick={() => addArrayItem('skills', newSkill, setNewSkill)}
            className="px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.skills.map((skill, idx) => (
            <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {skill}
              <button
                type="button"
                onClick={() => removeArrayItem('skills', idx)}
                className="text-blue-600 hover:text-blue-800 ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Interests</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="e.g., AI, Web Development, Open Source"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('interests', newInterest, setNewInterest))}
          />
          <button
            type="button"
            onClick={() => addArrayItem('interests', newInterest, setNewInterest)}
            className="px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.interests.map((interest, idx) => (
            <span key={idx} className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm flex items-center gap-1">
              <Star className="w-3 h-3" />
              {interest}
              <button
                type="button"
                onClick={() => removeArrayItem('interests', idx)}
                className="text-purple-600 hover:text-purple-800 ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">LinkedIn Profile</label>
          <input
            type="url"
            value={formData.linkedinUrl}
            onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="https://linkedin.com/in/username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">GitHub Profile</label>
          <input
            type="url"
            value={formData.githubUrl}
            onChange={(e) => handleInputChange('githubUrl', e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="https://github.com/username"
          />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                {userRole === 'student' ? 'Student' : 'Alumni'}
              </span>
              <p className="text-gray-600">
                {userRole === 'student' 
                  ? 'Tell us about yourself to connect with alumni mentors' 
                  : 'Share your professional journey to help guide students'}
              </p>
            </div>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : message.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : message.type === 'error' ? (
                <XCircle className="w-5 h-5" />
              ) : null}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {renderCommonFields()}
            
            {userRole === 'student' ? renderStudentForm() : renderAlumniForm()}

            <div className="pt-6 border-t">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Profile to Database
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Skip for Now
                </button>
              </div>
              
              <p className="text-sm text-gray-500 text-center mt-3">
                Your profile will be saved to MongoDB database
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;