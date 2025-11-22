// Register.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, GraduationCap, Users, Phone, Building, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    batchYear: '',
    department: '',
    studentId: '',
    currentYear: '',
    enrollmentYear: '',
    graduationYear: '',
    currentCompany: '',
    currentPosition: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const floatingElementsRef = useRef([]);

  const roles = [
    { value: 'student', label: 'Student', icon: User, color: 'bg-blue-500' },
    { value: 'alumni', label: 'Alumni', icon: GraduationCap, color: 'bg-green-500' }
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  // Initialize animations
  useEffect(() => {
    setIsVisible(true);
    
    // Start floating animation
    const floatingElements = document.querySelectorAll('.floating-element');
    floatingElementsRef.current = Array.from(floatingElements);
    startFloatingAnimation();
  }, []);

  // Floating animation using requestAnimationFrame
  const startFloatingAnimation = () => {
    let time = 0;
    
    const animate = () => {
      time += 0.02;
      floatingElementsRef.current.forEach((el, index) => {
        if (el) {
          const y = Math.sin(time + index) * 15;
          const rotation = Math.sin(time * 0.5 + index) * 3;
          el.style.transform = `translateY(${y}px) rotate(${rotation}deg)`;
        }
      });
      requestAnimationFrame(animate);
    };
    
    animate();
  };

  // Error animation
  useEffect(() => {
    if (error) {
      const errorElement = document.querySelector('.error-message');
      if (errorElement) {
        errorElement.style.animation = 'none';
        setTimeout(() => {
          errorElement.style.animation = 'shake 0.5s ease-in-out';
        }, 10);
      }
    }
  }, [error]);

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
      studentId: '',
      batchYear: '',
      currentYear: '',
      enrollmentYear: '',
      graduationYear: '',
      currentCompany: '',
      currentPosition: ''
    });
    if (error) clearError();
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.department) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long!');
      return false;
    }

    if (formData.role === 'student') {
      if (!formData.currentYear || !formData.enrollmentYear) {
        toast.error('Please fill all student-specific fields!');
        return false;
      }
    } else if (formData.role === 'alumni') {
      if (!formData.graduationYear) {
        toast.error('Please fill all alumni-specific fields!');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    // Button click animation
    const button = e.target.querySelector('button[type="submit"]');
    if (button) {
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 100);
    }

    const dataToSend = {
      name: formData.name,
      email: formData.email,
      mobileNumber: formData.mobileNumber,
      password: formData.password,
      role: formData.role,
      department: formData.department
    };

    if (formData.role === 'student') {
      dataToSend.studentId = formData.studentId;
      dataToSend.currentYear = parseInt(formData.currentYear);
      dataToSend.enrollmentYear = parseInt(formData.enrollmentYear);
      dataToSend.batchYear = parseInt(formData.batchYear);
    } else if (formData.role === 'alumni') {
      dataToSend.studentId = formData.studentId;
      dataToSend.graduationYear = parseInt(formData.graduationYear);
      dataToSend.currentCompany = formData.currentCompany;
      dataToSend.currentPosition = formData.currentPosition;
      dataToSend.batchYear = parseInt(formData.batchYear);
    }

    console.log('Sending registration data:', dataToSend);

    try {
      const result = await register(dataToSend);
      
      if (result.success) {
        toast.success('🎉 Registration successful! Welcome aboard!', {
          position: "top-right",
          autoClose: 3000,
        });
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const renderRoleSpecificFields = () => {
    if (formData.role === 'student') {
      return (
        <>
          <div className="animate-slide-in-left">
            <label className="block text-white/90 text-sm font-medium mb-2">
              Student ID
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-white/30"
              placeholder="Enter your student ID"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="animate-slide-in-left">
              <label className="block text-white/90 text-sm font-medium mb-2">
                Current Year *
              </label>
              <select
                name="currentYear"
                value={formData.currentYear}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-white/30"
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

            <div className="animate-slide-in-right">
              <label className="block text-white/90 text-sm font-medium mb-2">
                Enrollment Year *
              </label>
              <select
                name="enrollmentYear"
                value={formData.enrollmentYear}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-white/30"
                required
              >
                <option value="">Select Year</option>
                {years.map(year => (
                  <option key={year} value={year} className="bg-gray-800">
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      );
    } else if (formData.role === 'alumni') {
      return (
        <>
          <div className="animate-slide-in-left">
            <label className="block text-white/90 text-sm font-medium mb-2">
              Student ID
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-white/30"
              placeholder="Enter your student ID"
            />
          </div>

          <div className="animate-slide-in-right">
            <label className="block text-white/90 text-sm font-medium mb-2">
              Graduation Year *
            </label>
            <select
              name="graduationYear"
              value={formData.graduationYear}
              onChange={handleInputChange}
              className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-white/30"
              required
            >
              <option value="">Select Year</option>
              {years.map(year => (
                <option key={year} value={year} className="bg-gray-800">
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="animate-slide-in-left">
              <label className="block text-white/90 text-sm font-medium mb-2">
                Current Company
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="text"
                  name="currentCompany"
                  value={formData.currentCompany}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-white/30"
                  placeholder="Enter your current company"
                />
              </div>
            </div>

            <div className="animate-slide-in-right">
              <label className="block text-white/90 text-sm font-medium mb-2">
                Current Position
              </label>
              <input
                type="text"
                name="currentPosition"
                value={formData.currentPosition}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-white/30"
                placeholder="Enter your current position"
              />
            </div>
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #3730a3 100%)'
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating geometric shapes */}
        <div 
          className="floating-element absolute top-1/4 left-1/4 w-8 h-8 border-2 border-blue-400/30 rounded-lg transition-transform duration-1000"
        ></div>
        <div 
          className="floating-element absolute top-1/3 right-1/4 w-6 h-6 border-2 border-purple-400/30 rounded-full transition-transform duration-1000"
        ></div>
        <div 
          className="floating-element absolute bottom-1/4 left-1/3 w-10 h-10 border-2 border-cyan-400/30 rotate-45 transition-transform duration-1000"
        ></div>
        <div 
          className="floating-element absolute bottom-1/3 right-1/3 w-12 h-12 border-2 border-pink-400/30 rounded-full transition-transform duration-1000"
        ></div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <div 
          className={`
            bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-8 
            hover:border-gray-600/50 transition-all duration-500
            ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-10'}
          `}
          style={{
            background: 'radial-gradient(circle at top right, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))',
            animation: 'fadeInUp 0.8s ease-out'
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4 animate-bounce-gentle">
              <div className="relative w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <Users className="w-10 h-10 text-white" />
                <div className="absolute inset-0 border-2 border-green-400/50 rounded-full animate-ping"></div>
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-2 animate-fade-in">
              Create Your Account
            </h2>
            <p className="text-gray-400 animate-fade-in-delay">
              Join the network to connect with fellow alumni and students
            </p>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600/50"></div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-2 backdrop-blur-sm">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-200 text-sm">{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="animate-fade-in">
              <label className="block text-white/90 text-sm font-medium mb-3">
                I am a... *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((role) => {
                  const IconComponent = role.icon;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => handleRoleChange(role.value)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                        formData.role === role.value
                          ? `${role.color} border-white/30 shadow-lg scale-105`
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
            <div className="space-y-4">
              <h3 className="text-white text-lg font-semibold animate-slide-in-left">Full Name</h3>
              <div className="animate-slide-in-left">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-white/30"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="animate-slide-in-left">
                  <h3 className="text-white text-lg font-semibold mb-2">Email Address</h3>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-white/30"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="animate-slide-in-right">
                  <h3 className="text-white text-lg font-semibold mb-2">Mobile Number</h3>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-white/30"
                      placeholder="Enter your mobile number"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="animate-slide-in-left">
                <h3 className="text-white text-lg font-semibold mb-2">Create Password</h3>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-10 pr-12 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-white/30"
                    placeholder="Enter a strong password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="animate-slide-in-right">
                <h3 className="text-white text-lg font-semibold mb-2">Confirm Password</h3>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-10 pr-12 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-white/30"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Department and Batch Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="animate-slide-in-left">
                <h3 className="text-white text-lg font-semibold mb-2">Department</h3>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-white/30"
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

              <div className="animate-slide-in-right">
                <h3 className="text-white text-lg font-semibold mb-2">Batch Year</h3>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <select
                    name="batchYear"
                    value={formData.batchYear}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-white/30"
                  >
                    <option value="">Select Year</option>
                    {years.map(year => (
                      <option key={year} value={year} className="bg-gray-800">
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Role-specific Fields */}
            {renderRoleSpecificFields()}

            {/* Submit Button */}
            <div className="animate-fade-in-delay-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-green-500/25 hover:scale-105 active:scale-95 relative overflow-hidden group"
              >
                {/* Button Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <User className="w-5 h-5" />
                    <span>Register</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Links */}
          <div className="mt-6 text-center animate-fade-in-delay-4">
            <div className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors hover:underline"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animations to your CSS */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        @keyframes bounceGentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }

        .animate-fade-in {
          animation: fadeInUp 0.6s ease-out 0.2s both;
        }

        .animate-fade-in-delay {
          animation: fadeInUp 0.6s ease-out 0.4s both;
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.6s ease-out 0.6s both;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.6s ease-out 0.8s both;
        }

        .animate-fade-in-delay-3 {
          animation: fadeInUp 0.6s ease-out 1.2s both;
        }

        .animate-fade-in-delay-4 {
          animation: fadeInUp 0.6s ease-out 1.6s both;
        }

        .animate-bounce-gentle {
          animation: bounceGentle 3s ease-in-out infinite;
        }

        .error-message {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Register;