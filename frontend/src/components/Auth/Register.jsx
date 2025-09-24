import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, GraduationCap, UserCog, Users, Phone, Building, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    studentId: '',
    graduationYear: '',
    department: '',
    phoneNumber: '',
    currentCompany: '',
    currentPosition: '',
    currentYear: '',
    enrollmentYear: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { value: 'student', label: 'Student', icon: User, color: 'bg-blue-500' },
    { value: 'alumni', label: 'Alumni', icon: GraduationCap, color: 'bg-green-500' },
    { value: 'admin', label: 'Admin', icon: UserCog, color: 'bg-purple-500' }
  ];

  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Chemical Engineering',
    'Biotechnology',
    'Business Administration',
    'Other'
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) clearError();
  };

  const handleRoleChange = (role) => {
    setFormData({
      ...formData,
      role,
      // Clear role-specific fields when changing role
      studentId: '',
      graduationYear: '',
      currentCompany: '',
      currentPosition: '',
      currentYear: '',
      enrollmentYear: ''
    });
    if (error) clearError();
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.name || !formData.email || !formData.department) {
      alert('Please fill in all required fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return false;
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long!');
      return false;
    }

    // Role-specific validation
    if (formData.role === 'student') {
      if (!formData.studentId || !formData.currentYear || !formData.enrollmentYear) {
        alert('Please fill all student-specific fields!');
        return false;
      }
    } else if (formData.role === 'alumni') {
      if (!formData.studentId || !formData.graduationYear || !formData.currentCompany || !formData.currentPosition) {
        alert('Please fill all alumni-specific fields!');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    // Prepare the data to send
    const dataToSend = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      department: formData.department,
      phoneNumber: formData.phoneNumber || ''
    };

    // Add role-specific fields
    if (formData.role === 'student') {
      dataToSend.studentId = formData.studentId;
      dataToSend.currentYear = parseInt(formData.currentYear);
      dataToSend.enrollmentYear = parseInt(formData.enrollmentYear);
    } else if (formData.role === 'alumni') {
      dataToSend.studentId = formData.studentId;
      dataToSend.graduationYear = parseInt(formData.graduationYear);
      dataToSend.currentCompany = formData.currentCompany;
      dataToSend.currentPosition = formData.currentPosition;
    }

    console.log('Sending registration data:', dataToSend);

    try {
      const result = await register(dataToSend);
      
      if (result.success) {
        alert('Registration successful! Welcome aboard!');
        navigate('/dashboard');
      } else {
        alert(result.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      alert('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const renderRoleSpecificFields = () => {
    if (formData.role === 'student') {
      return (
        <>
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Student ID *
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your student ID"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Current Year *
              </label>
              <select
                name="currentYear"
                value={formData.currentYear}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Year</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(year => (
                  <option key={year} value={year} className="bg-gray-800">
                    Year {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Enrollment Year *
              </label>
              <input
                type="number"
                name="enrollmentYear"
                value={formData.enrollmentYear}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2020"
                min="2000"
                max="2030"
                required
              />
            </div>
          </div>
        </>
      );
    } else if (formData.role === 'alumni') {
      return (
        <>
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Student ID *
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your student ID"
              required
            />
          </div>

          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Graduation Year *
            </label>
            <input
              type="number"
              name="graduationYear"
              value={formData.graduationYear}
              onChange={handleInputChange}
              className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="2020"
              min="1950"
              max="2030"
              required
            />
          </div>

          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Current Company *
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                type="text"
                name="currentCompany"
                value={formData.currentCompany}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your current company"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Current Position *
            </label>
            <input
              type="text"
              name="currentPosition"
              value={formData.currentPosition}
              onChange={handleInputChange}
              className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your current position"
              required
            />
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Join Our Community</h2>
            <p className="text-white/80">Create your account to get started</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-200 text-sm">{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-3">
                Select Role *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((role) => {
                  const IconComponent = role.icon;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => handleRoleChange(role.value)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        formData.role === role.value
                          ? `${role.color} border-white/30 shadow-lg`
                          : 'bg-white/10 border-white/20 hover:bg-white/20'
                      }`}
                    >
                      <IconComponent className="w-6 h-6 text-white mx-auto mb-2" />
                      <span className="text-white text-sm font-medium">
                        {role.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-10 pr-12 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Create password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-10 pr-12 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Department and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Department *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept} className="bg-gray-800">
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            {/* Role-specific Fields */}
            {renderRoleSpecificFields()}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <User className="w-5 h-5" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center">
            <div className="text-white/60 text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-white hover:text-blue-300 font-medium transition-colors"
              >
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;