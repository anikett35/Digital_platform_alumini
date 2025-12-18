import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Plus, 
  X, 
  User, 
  Briefcase, 
  Target, 
  Building, 
  GraduationCap, 
  Sparkles,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Globe,
  Link,
  MapPin,
  Award,
  Star,
  Zap,
  Database,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const SetupProfile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    interests: [],
    skills: [],
    careerGoals: [],
    industryPreferences: [],
    lookingForMentor: false,
    availableAsMentor: false,
    mentorshipAreas: [],
    bio: '',
    currentPosition: '',
    location: '',
    linkedinUrl: '',
    githubUrl: '',
    currentCompany: '',
    education: [],
    profileHeadline: '',
    industry: ''
  });
  
  const [newItem, setNewItem] = useState({
    interest: '',
    skill: '',
    careerGoal: '',
    industry: '',
    mentorshipArea: '',
    education: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [activeSection, setActiveSection] = useState('basic');
  const [progress, setProgress] = useState(0);
  const [isDirty, setIsDirty] = useState(false);

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'skills', label: 'Skills', icon: Award },
    { id: 'interests', label: 'Interests', icon: Star },
    { id: 'career', label: 'Career', icon: Briefcase },
    { id: 'mentorship', label: 'Mentorship', icon: Target }
  ];

  // Load profile data from backend
  const loadProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const { data } = await axios.get('/api/ai-matching/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (data.success && data.user) {
        const mergedData = {
          interests: data.user.interests || [],
          skills: data.user.skills || [],
          careerGoals: data.user.careerGoals || [],
          industryPreferences: data.user.industryPreferences || [],
          lookingForMentor: data.user.lookingForMentor || false,
          availableAsMentor: data.user.availableAsMentor || false,
          mentorshipAreas: data.user.mentorshipAreas || [],
          bio: data.user.bio || '',
          currentPosition: data.user.currentPosition || '',
          location: data.user.location || '',
          linkedinUrl: data.user.linkedinUrl || '',
          githubUrl: data.user.githubUrl || '',
          currentCompany: data.user.currentCompany || '',
          education: data.user.education || [],
          profileHeadline: data.user.profileHeadline || '',
          industry: data.user.industry || ''
        };
        
        setFormData(mergedData);
        calculateProgress(mergedData);
        setIsDirty(false);
        
        if (updateUser) {
          updateUser({
            ...user,
            ...mergedData,
            profileComplete: data.user.profileComplete || false,
            profileStrength: data.user.profileStrength || 0
          });
        }
      }
    } catch (error) {
      if (user) {
        const userData = {
          interests: user.interests || [],
          skills: user.skills || [],
          careerGoals: user.careerGoals || [],
          industryPreferences: user.industryPreferences || [],
          lookingForMentor: user.lookingForMentor || false,
          availableAsMentor: user.availableAsMentor || false,
          mentorshipAreas: user.mentorshipAreas || [],
          bio: user.bio || '',
          currentPosition: user.currentPosition || '',
          location: user.location || '',
          linkedinUrl: user.linkedinUrl || '',
          githubUrl: user.githubUrl || '',
          currentCompany: user.currentCompany || '',
          education: user.education || [],
          profileHeadline: user.profileHeadline || '',
          industry: user.industry || ''
        };
        setFormData(userData);
        calculateProgress(userData);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const calculateProgress = (data) => {
    let filledFields = 0;
    const totalFields = 12;
    
    if (data.bio && data.bio.trim()) filledFields++;
    if (data.skills && data.skills.length > 0) filledFields++;
    if (data.interests && data.interests.length > 0) filledFields++;
    if (data.careerGoals && data.careerGoals.length > 0) filledFields++;
    if (data.industryPreferences && data.industryPreferences.length > 0) filledFields++;
    if (data.currentPosition && data.currentPosition.trim()) filledFields++;
    if (data.location && data.location.trim()) filledFields++;
    if (data.currentCompany && data.currentCompany.trim()) filledFields++;
    if (data.education && data.education.length > 0) filledFields++;
    if (data.profileHeadline && data.profileHeadline.trim()) filledFields++;
    if (data.industry && data.industry.trim()) filledFields++;
    
    const progressPercentage = (filledFields / totalFields) * 100;
    setProgress(Math.min(progressPercentage, 100));
  };

  const handleInputChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    calculateProgress(updatedData);
    setIsDirty(true);
  };

  const addItem = (field, itemField) => {
    const trimmedValue = newItem[itemField].trim();
    if (trimmedValue && !formData[field].includes(trimmedValue)) {
      const updatedData = {
        ...formData,
        [field]: [...formData[field], trimmedValue]
      };
      setFormData(updatedData);
      calculateProgress(updatedData);
      setNewItem({ ...newItem, [itemField]: '' });
      setIsDirty(true);
    }
  };

  const removeItem = (field, index) => {
    const updatedData = {
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index)
    };
    setFormData(updatedData);
    calculateProgress(updatedData);
    setIsDirty(true);
  };

  const saveProfileToDatabase = async () => {
    setSaving(true);
    setSaveStatus(null);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const { data } = await axios.put(
        '/api/ai-matching/profile', 
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!data.success) {
        throw new Error(data.message || 'Failed to save profile');
      }

      if (updateUser && data.user) {
        updateUser({
          ...user,
          ...formData,
          profileComplete: data.user.profileComplete || false,
          profileStrength: data.user.profileStrength || 0
        });
      }

      localStorage.setItem('userProfile', JSON.stringify(formData));
      localStorage.setItem('profileLastSaved', new Date().toISOString());

      setSaveStatus({ 
        type: 'success', 
        message: 'Profile saved successfully!'
      });
      setIsDirty(false);
      
      setTimeout(() => {
        loadProfileData();
      }, 1000);
      
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error ||
                         'Failed to save profile. Please try again.';
      
      setSaveStatus({ 
        type: 'error', 
        message: errorMessage 
      });
      
      localStorage.setItem('userProfile_temp', JSON.stringify(formData));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    await saveProfileToDatabase();
  };

  useEffect(() => {
    if (isDirty) {
      const autoSaveTimer = setTimeout(() => {
        if (!saving) {
          saveProfileToDatabase();
        }
      }, 30000);

      return () => clearTimeout(autoSaveTimer);
    }
  }, [isDirty, formData]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const renderSection = () => {
    const SectionIcon = sections.find(s => s.id === activeSection)?.icon || User;

    switch (activeSection) {
      case 'basic':
        return (
          <div className="space-y-8">
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <SectionIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Basic Information</h3>
                  <p className="text-gray-600">Tell us about yourself</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-base font-semibold text-gray-800">
                  Current Position *
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.currentPosition}
                    onChange={(e) => handleInputChange('currentPosition', e.target.value)}
                    className="w-full pl-14 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-base font-semibold text-gray-800">
                  Current Company
                </label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.currentCompany}
                    onChange={(e) => handleInputChange('currentCompany', e.target.value)}
                    className="w-full pl-14 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                    placeholder="e.g., Google, Microsoft..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-base font-semibold text-gray-800">
                  Industry
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                  placeholder="e.g., Technology, Finance, Healthcare..."
                />
              </div>

              <div className="space-y-4">
                <label className="block text-base font-semibold text-gray-800">
                  Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full pl-14 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-base font-semibold text-gray-800">
                Profile Headline *
              </label>
              <input
                type="text"
                value={formData.profileHeadline}
                onChange={(e) => handleInputChange('profileHeadline', e.target.value)}
                className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                placeholder="e.g., Software Engineer passionate about AI and Web Development"
                maxLength={200}
              />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Brief description that appears on your profile</span>
                <span className="text-gray-500">{formData.profileHeadline.length}/200</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-base font-semibold text-gray-800">
                Bio *
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={8}
                className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-base"
                placeholder="Tell us about yourself, your background, experiences, and aspirations..."
                maxLength={500}
              />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Share your story (500 characters max)</span>
                <span className={`font-medium ${formData.bio.length > 500 ? 'text-red-500' : 'text-gray-500'}`}>
                  {formData.bio.length}/500
                </span>
              </div>
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-8">
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <SectionIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Skills & Expertise</h3>
                  <p className="text-gray-600">Add skills that represent your expertise</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-base font-semibold text-gray-800">
                    Technical Skills *
                  </label>
                  <span className="text-sm text-gray-500">Press Enter or click Add</span>
                </div>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={newItem.skill}
                    onChange={(e) => setNewItem({ ...newItem, skill: e.target.value })}
                    className="flex-1 px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                    placeholder="e.g., JavaScript, Python, React, Machine Learning..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('skills', 'skill'))}
                  />
                  <button
                    type="button"
                    onClick={() => addItem('skills', 'skill')}
                    className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center space-x-3 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Add</span>
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                {formData.skills.map((skill, idx) => (
                  <span key={idx} className="group px-5 py-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 flex items-center space-x-3 hover:scale-105 transition-all duration-200">
                    <Zap className="w-5 h-5" />
                    <span className="font-medium text-base">{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeItem('skills', idx)}
                      className="text-blue-700 hover:text-blue-900 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </span>
                ))}
              </div>
              
              {formData.skills.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl">
                  <GraduationCap className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                  <p className="text-gray-500 text-lg mb-2">No skills added yet</p>
                  <p className="text-gray-400">Add your first skill above to get started</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'interests':
        return (
          <div className="space-y-8">
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <SectionIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Interests & Passions</h3>
                  <p className="text-gray-600">What topics are you passionate about?</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-base font-semibold text-gray-800">
                    Professional Interests
                  </label>
                  <span className="text-sm text-gray-500">What excites you professionally?</span>
                </div>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={newItem.interest}
                    onChange={(e) => setNewItem({ ...newItem, interest: e.target.value })}
                    className="flex-1 px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                    placeholder="e.g., AI, Web Development, Data Science, Open Source..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('interests', 'interest'))}
                  />
                  <button
                    type="button"
                    onClick={() => addItem('interests', 'interest')}
                    className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center space-x-3 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Add</span>
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                {formData.interests.map((interest, idx) => (
                  <span key={idx} className="group px-5 py-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 flex items-center space-x-3 hover:scale-105 transition-all duration-200">
                    <Star className="w-5 h-5" />
                    <span className="font-medium text-base">{interest}</span>
                    <button
                      type="button"
                      onClick={() => removeItem('interests', idx)}
                      className="text-blue-700 hover:text-blue-900 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 'career':
        return (
          <div className="space-y-8">
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <SectionIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Career Goals & Education</h3>
                  <p className="text-gray-600">Where do you see your career going?</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-4">
                  Career Goals *
                </label>
                <div className="flex space-x-4 mb-6">
                  <input
                    type="text"
                    value={newItem.careerGoal}
                    onChange={(e) => setNewItem({ ...newItem, careerGoal: e.target.value })}
                    className="flex-1 px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                    placeholder="e.g., Become a Software Engineer at FAANG, Start a tech company..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('careerGoals', 'careerGoal'))}
                  />
                  <button
                    type="button"
                    onClick={() => addItem('careerGoals', 'careerGoal')}
                    className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center space-x-3 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Add</span>
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  {formData.careerGoals.map((goal, idx) => (
                    <span key={idx} className="group px-5 py-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 flex items-center space-x-3 hover:scale-105 transition-all duration-200">
                      <Target className="w-5 h-5" />
                      <span className="font-medium text-base">{goal}</span>
                      <button
                        type="button"
                        onClick={() => removeItem('careerGoals', idx)}
                        className="text-blue-700 hover:text-blue-900 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-800 mb-4">
                  Education *
                </label>
                <div className="flex space-x-4 mb-6">
                  <input
                    type="text"
                    value={newItem.education}
                    onChange={(e) => setNewItem({ ...newItem, education: e.target.value })}
                    className="flex-1 px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                    placeholder="e.g., B.S. Computer Science, Stanford University"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('education', 'education'))}
                  />
                  <button
                    type="button"
                    onClick={() => addItem('education', 'education')}
                    className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center space-x-3 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Add</span>
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  {formData.education.map((edu, idx) => (
                    <span key={idx} className="group px-5 py-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 flex items-center space-x-3 hover:scale-105 transition-all duration-200">
                      <GraduationCap className="w-5 h-5" />
                      <span className="font-medium text-base">{edu}</span>
                      <button
                        type="button"
                        onClick={() => removeItem('education', idx)}
                        className="text-blue-700 hover:text-blue-900 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-800 mb-4">
                  Industry Preferences *
                </label>
                <div className="flex space-x-4 mb-6">
                  <input
                    type="text"
                    value={newItem.industry}
                    onChange={(e) => setNewItem({ ...newItem, industry: e.target.value })}
                    className="flex-1 px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                    placeholder="e.g., Technology, Finance, Healthcare, E-commerce..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('industryPreferences', 'industry'))}
                  />
                  <button
                    type="button"
                    onClick={() => addItem('industryPreferences', 'industry')}
                    className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center space-x-3 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Add</span>
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  {formData.industryPreferences.map((industry, idx) => (
                    <span key={idx} className="group px-5 py-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 flex items-center space-x-3 hover:scale-105 transition-all duration-200">
                      <Building className="w-5 h-5" />
                      <span className="font-medium text-base">{industry}</span>
                      <button
                        type="button"
                        onClick={() => removeItem('industryPreferences', idx)}
                        className="text-blue-700 hover:text-blue-900 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'mentorship':
        return (
          <div className="space-y-8">
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <SectionIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Mentorship Preferences</h3>
                  <p className="text-gray-600">Configure your mentorship settings</p>
                </div>
              </div>
            </div>

            {user?.role === 'student' && (
              <div className="bg-blue-50 p-8 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="p-4 bg-blue-600 rounded-lg">
                      <Target className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">Looking for a Mentor</h4>
                      <p className="text-gray-600 text-base">
                        Get matched with alumni mentors who can guide you in your career journey
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.lookingForMentor}
                      onChange={(e) => handleInputChange('lookingForMentor', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-16 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            )}

            {user?.role === 'alumni' && (
              <>
                <div className="bg-blue-50 p-8 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="p-4 bg-blue-600 rounded-lg">
                        <GraduationCap className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">Available as Mentor</h4>
                        <p className="text-gray-600 text-base">
                          Help guide students and recent graduates in their career paths
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.availableAsMentor}
                        onChange={(e) => handleInputChange('availableAsMentor', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-16 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {formData.availableAsMentor && (
                  <div className="space-y-6">
                    <label className="block text-base font-semibold text-gray-800">
                      Mentorship Areas
                    </label>
                    <div className="flex space-x-4">
                      <input
                        type="text"
                        value={newItem.mentorshipArea}
                        onChange={(e) => setNewItem({ ...newItem, mentorshipArea: e.target.value })}
                        className="flex-1 px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                        placeholder="e.g., Career guidance, Technical skills, Interview prep..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('mentorshipAreas', 'mentorshipArea'))}
                      />
                      <button
                        type="button"
                        onClick={() => addItem('mentorshipAreas', 'mentorshipArea')}
                        className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center space-x-3 shadow-lg hover:shadow-xl"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">Add</span>
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      {formData.mentorshipAreas.map((area, idx) => (
                        <span key={idx} className="group px-5 py-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 flex items-center space-x-3 hover:scale-105 transition-all duration-200">
                          <Target className="w-5 h-5" />
                          <span className="font-medium text-base">{area}</span>
                          <button
                            type="button"
                            onClick={() => removeItem('mentorshipAreas', idx)}
                            className="text-blue-700 hover:text-blue-900 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-3">
                  LinkedIn Profile
                </label>
                <div className="relative">
                  <Link className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                    className="w-full pl-14 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-800 mb-3">
                  GitHub Profile
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                    className="w-full pl-14 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                    placeholder="https://github.com/yourusername"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
                Setup Your Profile
              </h1>
              <p className="text-gray-600 text-lg mt-3">
                Complete your profile to unlock personalized mentor matches
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-6 lg:mt-0">
              <button
                type="button"
                onClick={loadProfileData}
                disabled={saving}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center space-x-3 text-base"
              >
                <RefreshCw className={`w-5 h-5 ${saving ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving || !isDirty}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center space-x-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Status Messages */}
          {saveStatus && (
            <div className={`mt-8 p-5 rounded-xl flex items-center space-x-4 ${
              saveStatus.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {saveStatus.type === 'success' ? (
                <CheckCircle className="w-7 h-7 text-green-600" />
              ) : (
                <AlertCircle className="w-7 h-7 text-red-600" />
              )}
              <div className="flex-1">
                <p className={`text-lg font-medium ${saveStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                  {saveStatus.message}
                </p>
                {saveStatus.type === 'success' && (
                  <p className="text-green-600 mt-1">
                    Your data has been saved and will persist after refresh.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-medium text-base">Profile Completion</span>
              <span className="font-bold text-blue-600 text-lg">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>Start</span>
              <span>Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 sticky top-8">
              <div className="space-y-3">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left p-5 rounded-xl transition-all duration-300 flex items-center space-x-4 ${
                        isActive 
                          ? 'bg-blue-50 border-2 border-blue-200' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-3 rounded-lg ${isActive ? 'bg-blue-600' : 'bg-gray-100'}`}>
                        <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1">
                        <span className={`font-medium text-base ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                          {section.label}
                        </span>
                      </div>
                      <ChevronRight className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 p-5 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium text-base">
                      Data Status
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {isDirty ? 'Unsaved changes' : 'All changes saved'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 min-h-[700px]">
              {renderSection()}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-12 pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = sections.findIndex(s => s.id === activeSection);
                    if (currentIndex > 0) {
                      setActiveSection(sections[currentIndex - 1].id);
                    }
                  }}
                  disabled={activeSection === sections[0].id}
                  className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center space-x-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-6">
                  <span className="text-gray-500 text-base">
                    Section {sections.findIndex(s => s.id === activeSection) + 1} of {sections.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const currentIndex = sections.findIndex(s => s.id === activeSection);
                      if (currentIndex < sections.length - 1) {
                        setActiveSection(sections[currentIndex + 1].id);
                      } else {
                        handleSubmit();
                      }
                    }}
                    className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center space-x-3 shadow-lg hover:shadow-xl text-base font-medium"
                  >
                    <span>
                      {activeSection === sections[sections.length - 1].id ? 'Save & Complete' : 'Next Section'}
                    </span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupProfile;