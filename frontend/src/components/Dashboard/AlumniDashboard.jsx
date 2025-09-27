import React, { useState } from 'react';
import { 
  GraduationCap, 
  Users, 
  Briefcase, 
  Calendar,
  Heart,
  TrendingUp,
  FileText,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PostsPage from '../Posts/PostsPage';

const AlumniDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        return <PostsPage />;
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
            <div className="container mx-auto px-4 py-8">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-800">Alumni Dashboard</h1>
                      <p className="text-gray-600">Welcome back, {user?.name}!</p>
                    </div>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex space-x-4 mb-8">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'dashboard'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setActiveTab('posts')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                      activeTab === 'posts'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Community Posts</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-xl p-6 text-white">
                    <h3 className="text-xl font-semibold mb-2">My Profile</h3>
                    <p>Department: {user?.department}</p>
                    <p>Role: Alumni</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl p-6 text-white cursor-pointer hover:scale-105 transition-transform"
                       onClick={() => setActiveTab('posts')}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Share Posts</h3>
                        <p>Share knowledge & experiences</p>
                      </div>
                      <MessageCircle className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl p-6 text-white">
                    <h3 className="text-xl font-semibold mb-2">Job Postings</h3>
                    <p>Post job opportunities</p>
                  </div>
                  <div className="bg-gradient-to-r from-pink-400 to-pink-600 rounded-xl p-6 text-white">
                    <h3 className="text-xl font-semibold mb-2">Events</h3>
                    <p>Organize alumni events</p>
                  </div>
                  <div className="bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-xl p-6 text-white">
                    <h3 className="text-xl font-semibold mb-2">Donations</h3>
                    <p>Support the institution</p>
                  </div>
                  <div className="bg-gradient-to-r from-teal-400 to-teal-600 rounded-xl p-6 text-white">
                    <h3 className="text-xl font-semibold mb-2">Network</h3>
                    <p>Connect with other alumni</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  if (activeTab === 'posts') {
    return <PostsPage />;
  }

  return renderContent();
};

export default AlumniDashboard;