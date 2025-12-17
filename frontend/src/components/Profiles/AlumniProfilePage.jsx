import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Calendar,
  Globe,
  Linkedin,
  Github,
  Users,
  Star,
  Award,
  BookOpen,
  Building,
  Phone,
  ExternalLink,
  Loader2,
  MessageSquare,
  ChevronRight,
  UserCheck,
  Target,
  Zap,
  Globe as Earth,
  Sparkles
} from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const AlumniProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similarAlumni, setSimilarAlumni] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAlumniProfile();
  }, [id]);

  const fetchAlumniProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      // Fetch main profile
      const profileResponse = await axios.get(`${API_URL}/profiles/alumni/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (profileResponse.data.success) {
        setAlumni(profileResponse.data.alumni);

        // Fetch similar alumni
        try {
          const similarResponse = await axios.get(`${API_URL}/profiles/alumni/${id}/similar`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (similarResponse.data.success) {
            setSimilarAlumni(similarResponse.data.similarAlumni || []);
          }
        } catch (similarError) {
          console.log('Error fetching similar alumni:', similarError);
        }
      } else {
        setError('Profile not found');
      }
    } catch (error) {
      console.error('Error fetching alumni profile:', error);
      setError(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const formatYear = (year) => {
    if (!year) return '';
    return `Class of ${year}`;
  };

  const handleBackToDirectory = () => {
    navigate('/dashboard?tab=alumni-directory');
  };

  const handleConnect = () => {
    // Implement connection request logic
    alert(`Connection request sent to ${alumni.name}`);
  };

  const handleMessage = () => {
    // Implement messaging logic
    navigate(`/messages?user=${alumni._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-6" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Profile</h3>
          <p className="text-gray-500 max-w-md">Fetching the complete professional profile...</p>
        </div>
      </div>
    );
  }

  if (error || !alumni) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4 p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20">
          <div className="text-6xl mb-6">🔍</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Profile Not Found</h1>
          <p className="text-gray-600 mb-8 text-lg">{error || 'The alumni profile you\'re looking for doesn\'t exist or has been removed.'}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-8 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-xl hover:from-gray-200 hover:to-gray-300 font-medium shadow-lg transition-all duration-300"
            >
              Go Back
            </button>
            <button
              onClick={handleBackToDirectory}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 font-medium shadow-lg transition-all duration-300"
            >
              Browse Directory
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Navigation Bar */}
          <div className="flex items-center justify-between mb-10">
            <button
              onClick={handleBackToDirectory}
              className="flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl transition-all duration-300 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Directory</span>
            </button>
            
            <div className="flex gap-4">
              {alumni.isOpenToMentorship && (
                <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-semibold">Open to Mentorship</span>
                </div>
              )}
              <button
                onClick={handleConnect}
                className="bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl transition-all duration-300 flex items-center gap-2 font-medium"
              >
                <UserCheck className="w-5 h-5" />
                Connect
              </button>
            </div>
          </div>

          {/* Profile Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {/* Profile Image */}
            <div className="relative">
              {alumni.profileImage ? (
                <div className="relative">
                  <img
                    src={alumni.profileImage}
                    alt={alumni.name}
                    className="w-40 h-40 rounded-3xl border-4 border-white/50 shadow-2xl object-cover"
                  />
                  <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-40 h-40 rounded-3xl border-4 border-white/50 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 shadow-2xl flex items-center justify-center relative">
                  <span className="text-white text-5xl font-bold">
                    {alumni.name?.charAt(0).toUpperCase()}
                  </span>
                  <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-4xl font-bold tracking-tight">{alumni.name}</h1>
                {alumni.isOpenToMentorship && (
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1 rounded-full text-xs font-bold">
                    MENTOR
                  </div>
                )}
              </div>
              
              {alumni.profileHeadline && (
                <p className="text-xl text-blue-100 mb-6 max-w-3xl">{alumni.profileHeadline}</p>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {alumni.currentPosition && alumni.currentCompany && (
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-blue-200">Current Role</div>
                      <div className="font-semibold">{alumni.currentPosition}</div>
                      <div className="text-sm opacity-90">{alumni.currentCompany}</div>
                    </div>
                  </div>
                )}

                {alumni.department && (
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-blue-200">Education</div>
                      <div className="font-semibold">{alumni.department}</div>
                      <div className="text-sm opacity-90">{formatYear(alumni.graduationYear)}</div>
                    </div>
                  </div>
                )}

                {alumni.location && (
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-blue-200">Location</div>
                      <div className="font-semibold">{alumni.location}</div>
                      {alumni.industry && (
                        <div className="text-sm opacity-90">{alumni.industry}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleMessage}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 font-semibold shadow-lg transition-all duration-300 flex items-center gap-3 group"
                >
                  <MessageSquare className="w-5 h-5" />
                  Send Message
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-3">
                  <ExternalLink className="w-5 h-5" />
                  View Portfolio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:w-2/3">
            {/* Navigation Tabs */}
            <div className="flex gap-2 mb-8 p-2 bg-gradient-to-r from-white to-blue-50 rounded-2xl shadow-lg">
              {['overview', 'experience', 'education', 'skills'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 capitalize ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                  }`}
                >
                  {tab === 'overview' && 'Overview'}
                  {tab === 'experience' && 'Experience'}
                  {tab === 'education' && 'Education'}
                  {tab === 'skills' && 'Skills'}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-8">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Professional Overview</h2>
                      <p className="text-gray-500">Complete career journey and expertise</p>
                    </div>
                  </div>

                  {alumni.bio ? (
                    <div className="space-y-6">
                      <div className="prose prose-lg max-w-none">
                        <p className="text-gray-700 leading-relaxed text-lg">{alumni.bio}</p>
                      </div>
                      
                      {/* Key Highlights */}
                      {alumni.skills && alumni.skills.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-gray-100">
                          <h3 className="text-xl font-semibold text-gray-900 mb-4">Core Expertise</h3>
                          <div className="flex flex-wrap gap-3">
                            {alumni.skills.slice(0, 8).map((skill, index) => (
                              <div
                                key={index}
                                className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium rounded-full border border-blue-100 flex items-center gap-2"
                              >
                                <Zap className="w-4 h-4" />
                                {skill}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Overview Available</h3>
                      <p className="text-gray-500">This alumni hasn't added a professional overview yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Experience Tab */}
              {activeTab === 'experience' && (
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Work Experience</h2>
                      <p className="text-gray-500">Professional journey and accomplishments</p>
                    </div>
                  </div>

                  {alumni.workExperience && alumni.workExperience.length > 0 ? (
                    <div className="space-y-8">
                      {alumni.workExperience.map((exp, index) => (
                        <div key={index} className="relative pl-12">
                          {/* Timeline dot */}
                          <div className="absolute left-0 top-6 w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          
                          <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900">{exp.position}</h3>
                                <p className="text-blue-600 font-semibold">{exp.company}</p>
                              </div>
                              <div className="px-4 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-sm font-medium">
                                {formatDate(exp.startDate)} - {exp.currentlyWorking ? 'Present' : formatDate(exp.endDate)}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 mb-4">
                              {exp.location && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <MapPin className="w-4 h-4" />
                                  {exp.location}
                                </div>
                              )}
                            </div>
                            
                            {exp.description && (
                              <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Experience Added</h3>
                      <p className="text-gray-500">Work experience information will appear here.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Education Tab */}
              {activeTab === 'education' && (
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Education</h2>
                      <p className="text-gray-500">Academic background and qualifications</p>
                    </div>
                  </div>

                  {alumni.education && alumni.education.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {alumni.education.map((edu, index) => (
                        <div key={index} className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-purple-200 transition-all duration-300">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                              <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900">{edu.institution}</h3>
                              <p className="text-purple-600 font-semibold">{edu.degree}</p>
                              {edu.fieldOfStudy && (
                                <p className="text-gray-600 text-sm">{edu.fieldOfStudy}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                              {edu.startYear} - {edu.endYear || 'Present'}
                            </div>
                          </div>
                          
                          {edu.description && (
                            <p className="text-gray-700 text-sm">{edu.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Education Added</h3>
                      <p className="text-gray-500">Education information will appear here.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Skills Tab */}
              {activeTab === 'skills' && (
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Skills & Expertise</h2>
                      <p className="text-gray-500">Technical and professional competencies</p>
                    </div>
                  </div>

                  {alumni.skills && alumni.skills.length > 0 ? (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {alumni.skills.map((skill, index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-2xl border border-orange-100 hover:border-orange-300 transition-all duration-300 group hover:-translate-y-1"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Zap className="w-5 h-5 text-white" />
                              </div>
                              <span className="font-semibold text-gray-900">{skill}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Skill Categories */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Distribution</h3>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="h-3 bg-white rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                style={{ width: '70%' }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 mt-2">
                              <span>Technical</span>
                              <span>70%</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="h-3 bg-white rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                                style={{ width: '85%' }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 mt-2">
                              <span>Professional</span>
                              <span>85%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Skills Added</h3>
                      <p className="text-gray-500">Skills information will appear here.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:w-1/3">
            <div className="sticky top-8 space-y-8">
              {/* Contact Card */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-cyan-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Contact & Links</h2>
                </div>

                <div className="space-y-4">
                  {alumni.email && (
                    <a
                      href={`mailto:${alumni.email}`}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl hover:from-blue-100 hover:to-cyan-100 transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-500">Email</div>
                        <div className="font-medium text-gray-900 group-hover:text-blue-600">{alumni.email}</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-transform" />
                    </a>
                  )}

                  {alumni.phoneNumber && (
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-500">Phone</div>
                        <div className="font-medium text-gray-900">{alumni.phoneNumber}</div>
                      </div>
                    </div>
                  )}

                  {/* Social Links */}
                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Social Profiles</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {alumni.linkedinUrl && (
                        <a
                          href={alumni.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300"
                        >
                          <Linkedin className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-gray-900">LinkedIn</span>
                        </a>
                      )}
                      
                      {alumni.githubUrl && (
                        <a
                          href={alumni.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-300"
                        >
                          <Github className="w-5 h-5 text-gray-700" />
                          <span className="font-medium text-gray-900">GitHub</span>
                        </a>
                      )}
                      
                      {alumni.website && (
                        <a
                          href={alumni.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="col-span-2 flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all duration-300"
                        >
                          <Earth className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-gray-900">Portfolio Website</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Similar Alumni */}
              {similarAlumni.length > 0 && (
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Similar Alumni</h2>
                        <p className="text-sm text-gray-500">Based on profile similarity</p>
                      </div>
                    </div>
                    <div className="text-xs font-semibold px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                      {similarAlumni.length} Profiles
                    </div>
                  </div>

                  <div className="space-y-4">
                    {similarAlumni.map((similar) => (
                      <div
                        key={similar._id}
                        onClick={() => navigate(`/alumni/${similar._id}`)}
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-100 hover:border-purple-300 hover:shadow-md cursor-pointer transition-all duration-300 group"
                      >
                        {similar.profileImage ? (
                          <img
                            src={similar.profileImage}
                            alt={similar.name}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-white group-hover:border-purple-200 shadow-sm"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-2 border-white shadow-sm">
                            <span className="text-white font-bold text-lg">
                              {similar.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{similar.name}</h4>
                          <p className="text-sm text-gray-600 truncate">{similar.currentPosition}</p>
                          <p className="text-xs text-gray-500 truncate">{similar.department}</p>
                        </div>
                        
                        <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-transform" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mentor Availability Card */}
              {alumni.isOpenToMentorship && (
                <div className="bg-gradient-to-br from-emerald-500 to-green-500 rounded-3xl shadow-2xl p-8 text-white">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
                      <Star className="w-7 h-7 fill-current" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Mentorship Available</h3>
                      <p className="text-emerald-100">Professional guidance & career advice</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <span>1-on-1 sessions</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <Target className="w-4 h-4" />
                      </div>
                      <span>Career guidance</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4" />
                      </div>
                      <span>Industry insights</span>
                    </div>
                  </div>
                  
                  <button className="w-full py-4 bg-white text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-all duration-300 shadow-lg">
                    Request Mentorship Session
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniProfilePage;