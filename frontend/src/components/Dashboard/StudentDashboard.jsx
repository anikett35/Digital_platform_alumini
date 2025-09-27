import React, { useState } from 'react';
import { 
  User, 
  Users, 
  Calendar, 
  Briefcase, 
  BookOpen, 
  TrendingUp,
  Bell,
  MessageCircle,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PostsPage from '../Posts/PostsPage';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Stats data
  const stats = [
    {
      name: 'Alumni Connections',
      value: '24',
      change: '+12%',
      changeColor: 'text-green-600',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'Alumni Posts',
      value: '15',
      change: 'New this week',
      changeColor: 'text-blue-600',
      icon: MessageCircle,
      color: 'bg-green-500'
    },
    {
      name: 'Job Applications',
      value: '7',
      change: '3 pending',
      changeColor: 'text-orange-600',
      icon: Briefcase,
      color: 'bg-purple-500'
    },
    {
      name: 'Mentorship Sessions',
      value: '5',
      change: '1 scheduled',
      changeColor: 'text-green-600',
      icon: BookOpen,
      color: 'bg-orange-500'
    }
  ];

  // Recent activities data
  const recentActivities = [
    {
      id: 1,
      type: 'connection',
      message: 'John Doe accepted your connection request',
      time: '2 hours ago',
      icon: User,
      color: 'text-blue-600'
    },
    {
      id: 2,
      type: 'event',
      message: 'New event: Tech Career Fair 2024',
      time: '4 hours ago',
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      id: 3,
      type: 'job',
      message: 'New job posting: Frontend Developer at TechCorp',
      time: '1 day ago',
      icon: Briefcase,
      color: 'text-purple-600'
    },
    {
      id: 4,
      type: 'message',
      message: 'Sarah Wilson sent you a message',
      time: '2 days ago',
      icon: MessageCircle,
      color: 'text-orange-600'
    }
  ];

  // Upcoming events data
  const upcomingEvents = [
    {
      id: 1,
      title: 'Career Guidance Workshop',
      date: 'Dec 15, 2024',
      time: '2:00 PM',
      attendees: 45,
      type: 'Workshop'
    },
    {
      id: 2,
      title: 'Alumni Networking Meet',
      date: 'Dec 18, 2024',
      time: '6:00 PM',
      attendees: 120,
      type: 'Networking'
    },
    {
      id: 3,
      title: 'Industry Expert Talk',
      date: 'Dec 22, 2024',
      time: '11:00 AM',
      attendees: 200,
      type: 'Seminar'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        return <PostsPage />;
      default:
        return (
          <>
            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Here's what's happening in your alumni network today.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-4 mb-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  activeTab === 'posts'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Alumni Posts</span>
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => {
                const IconComponent = stat.icon;
                return (
                  <div key={stat.name} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                        <p className={`text-sm mt-2 ${stat.changeColor}`}>{stat.change}</p>
                      </div>
                      <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Activities */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => {
                      const IconComponent = activity.icon;
                      return (
                        <div key={activity.id} className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center`}>
                            <IconComponent className={`w-5 h-5 ${activity.color}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{activity.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="border-l-4 border-blue-500 pl-4 py-2">
                        <h3 className="font-medium text-gray-900 text-sm">{event.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{event.date} • {event.time}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {event.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {event.attendees} attending
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                    View All Events
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button 
                    onClick={() => setActiveTab('posts')}
                    className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                  >
                    <MessageCircle className="w-8 h-8 text-gray-600 group-hover:text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">Read Alumni Posts</span>
                  </button>
                  <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors group">
                    <Calendar className="w-8 h-8 text-gray-600 group-hover:text-green-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">Join Event</span>
                  </button>
                  <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group">
                    <Briefcase className="w-8 h-8 text-gray-600 group-hover:text-purple-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">Browse Jobs</span>
                  </button>
                  <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors group">
                    <BookOpen className="w-8 h-8 text-gray-600 group-hover:text-orange-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">Get Mentorship</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  if (activeTab === 'posts') {
    return <PostsPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default StudentDashboard;