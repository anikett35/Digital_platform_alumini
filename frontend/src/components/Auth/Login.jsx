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
      className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden"
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

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        <div 
          ref={cardRef}
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
          {/* Header with Icon */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6 animate-bounce-gentle">
              {/* Animated Icon */}
              <div className="relative w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <GraduationCap className="w-8 h-8 text-white" />
                {/* Pulsing ring effect */}
                <div className="absolute inset-0 border-2 border-cyan-400/50 rounded-2xl animate-ping"></div>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2 animate-fade-in">
              Welcome Back
            </h2>
            <p className="text-gray-400 text-sm flex items-center justify-center gap-2 animate-fade-in-delay">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Sign in to continue your journey
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message mb-6 p-4 bg-red-500/20 border border-red-400/40 rounded-xl flex items-start space-x-3 backdrop-blur-sm">
              <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-200 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-3 animate-slide-in-left">
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                  focusedField === 'email' ? 'text-cyan-400' : 'text-gray-500'
                }`} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => handleInputFocus('email')}
                  onBlur={handleInputBlur}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:bg-gray-700/70 transition-all duration-300 hover:border-gray-500/50"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-3 animate-slide-in-right">
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                  focusedField === 'password' ? 'text-cyan-400' : 'text-gray-500'
                }`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => handleInputFocus('password')}
                  onBlur={handleInputBlur}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:bg-gray-700/70 transition-all duration-300 hover:border-gray-500/50"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm pt-1 animate-fade-in-delay-2">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700/50 text-cyan-500 focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-800 cursor-pointer"
                />
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <div className="animate-fade-in-delay-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-cyan-500/25 hover:scale-105 active:scale-95 relative overflow-hidden group"
              >
                {/* Button Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
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

          {/* Divider */}
          <div className="relative my-8 animate-fade-in-delay-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-800 text-gray-400 font-medium">
                New to the platform?
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center animate-fade-in-delay-5">
            <Link
              to="/register"
              className="inline-flex items-center justify-center space-x-2 text-gray-300 bg-gray-700/50 hover:bg-gray-700/70 px-6 py-3 rounded-xl font-semibold transition-all duration-300 border border-gray-600/50 hover:border-gray-500/50 hover:scale-105 group"
            >
              <span>Create an account</span>
              <svg 
                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* Quick Demo Access (Optional - Remove in production) */}
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-lg animate-fade-in-delay-6">
            <p className="text-yellow-200 text-xs text-center font-medium">
              💡 Demo: Use any email with password "password123"
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center animate-fade-in-delay-7">
          <p className="text-gray-500 text-sm">
            Protected by enterprise-grade security 🔒
          </p>
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

        .animate-fade-in-delay-6 {
          animation: fadeInUp 0.6s ease-out 1.8s both;
        }

        .animate-fade-in-delay-7 {
          animation: fadeInUp 0.6s ease-out 2s both;
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