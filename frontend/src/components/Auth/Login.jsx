// Login.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle, GraduationCap, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Animation refs
  const cardRef = useRef(null);
  const floatingElementsRef = useRef([]);

  // Initialize animations on mount
  useEffect(() => {
    setIsVisible(true);
    
    // Add floating elements to ref
    const floatingElements = document.querySelectorAll('.floating-element');
    floatingElementsRef.current = Array.from(floatingElements);

    // Start floating animation
    startFloatingAnimation();
  }, []);

  // Floating animation using requestAnimationFrame
  const startFloatingAnimation = () => {
    let time = 0;
    
    const animate = () => {
      time += 0.02;
      floatingElementsRef.current.forEach((el, index) => {
        if (el) {
          const y = Math.sin(time + index) * 20;
          const rotation = Math.sin(time * 0.5 + index) * 5;
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

  // Clear error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Button click animation
    const button = e.target.querySelector('button[type="submit"]');
    if (button) {
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 100);
    }

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast.success('🎉 Welcome back!', {
          position: "top-right",
          autoClose: 3000,
        });
        navigate(from, { replace: true });
      } else {
        toast.error(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputFocus = (field) => {
    setFocusedField(field);
  };

  const handleInputBlur = () => {
    setFocusedField(null);
  };

  return (
    <div 
      className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)'
      }}
    >
      {/* Animated Background Elements - Subtle and professional */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating geometric shapes - Subtle gray tones */}
        <div 
          className="floating-element absolute top-1/4 left-1/4 w-8 h-8 border border-gray-300/30 rounded-lg transition-transform duration-1000"
        ></div>
        <div 
          className="floating-element absolute top-1/3 right-1/4 w-6 h-6 border border-gray-300/30 rounded-full transition-transform duration-1000"
        ></div>
        <div 
          className="floating-element absolute bottom-1/4 left-1/3 w-10 h-10 border border-gray-300/30 rotate-45 transition-transform duration-1000"
        ></div>
        <div 
          className="floating-element absolute bottom-1/3 right-1/3 w-12 h-12 border border-gray-300/30 rounded-full transition-transform duration-1000"
        ></div>
        
        {/* Subtle gradient orbs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-gray-100/30 to-gray-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-gray-100/30 to-gray-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        <div 
          ref={cardRef}
          className={`
            bg-white backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-8 
            hover:border-gray-300 transition-all duration-500
            ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-10'}
          `}
          style={{
            animation: 'fadeInUp 0.8s ease-out'
          }}
        >
          {/* Header with Icon */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6 animate-bounce-gentle">
              {/* Professional Icon */}
              <div className="relative w-16 h-16 bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <GraduationCap className="w-8 h-8 text-white" />
                {/* Subtle ring effect */}
                <div className="absolute inset-0 border border-gray-400/30 rounded-2xl animate-ping opacity-30"></div>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2 animate-fade-in">
              Welcome Back
            </h2>
            <p className="text-gray-600 text-sm flex items-center justify-center gap-2 animate-fade-in-delay">
              <Sparkles className="w-4 h-4 text-gray-500" />
              Sign in to continue to your network
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-3 animate-slide-in-left">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                  focusedField === 'email' ? 'text-gray-900' : 'text-gray-400'
                }`} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => handleInputFocus('email')}
                  onBlur={handleInputBlur}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl py-3.5 pl-12 pr-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-900 focus:bg-white transition-all duration-300 hover:border-gray-400"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-3 animate-slide-in-right">
              <div className="flex items-center justify-between">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                  focusedField === 'password' ? 'text-gray-900' : 'text-gray-400'
                }`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => handleInputFocus('password')}
                  onBlur={handleInputBlur}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl py-3.5 pl-12 pr-12 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-900 focus:bg-white transition-all duration-300 hover:border-gray-400"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors duration-200"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="animate-fade-in-delay-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-900 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:ring-offset-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden group"
              >
                {/* Button Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider - Updated for professional look */}
          <div className="relative my-8 animate-fade-in-delay-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">
                Continue to your dashboard
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center animate-fade-in-delay-4">
            <p className="text-gray-600 text-sm">
              New user?{' '}
              <Link
                to="/register"
                className="text-gray-900 hover:text-gray-700 font-medium transition-colors hover:underline"
              >
                Register as Student / Alumni
              </Link>
            </p>
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
          50% { transform: translateY(-10px); }
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

        .animate-fade-in-delay-2 {
          animation: fadeInUp 0.6s ease-out 1s both;
        }

        .animate-fade-in-delay-3 {
          animation: fadeInUp 0.6s ease-out 1.2s both;
        }

        .animate-fade-in-delay-4 {
          animation: fadeInUp 0.6s ease-out 1.4s both;
        }

        .animate-fade-in-delay-5 {
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

export default Login;