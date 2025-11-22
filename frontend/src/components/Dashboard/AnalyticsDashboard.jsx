import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Users, Calendar, Activity, RefreshCw,
  ArrowUp, ArrowDown, Eye, MessageSquare, UserPlus, CalendarCheck,
  Clock, Download, Filter, Zap
} from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  const [analytics, setAnalytics] = useState({
    overview: {
      totalUsers: 0,
      totalEvents: 0,
      totalPosts: 0,
      totalMessages: 0,
      alumniCount: 0,
      studentCount: 0,
      activeUsers: 0,
      upcomingEvents: 0
    },
    growth: {
      usersThisMonth: 0,
      eventsThisMonth: 0,
      postsThisMonth: 0,
      usersGrowth: 0,
      eventsGrowth: 0,
      postsGrowth: 0
    },
    engagement: {
      totalEventAttendees: 0,
      averageEventCapacity: 0,
      totalPostLikes: 0,
      totalPostComments: 0,
      activeToday: 0
    },
    usersByDepartment: [],
    recentActivities: [],
    topEvents: []
  });

  useEffect(() => {
    fetchAnalytics();

    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchAnalytics();
      }, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const [usersRes, eventsRes, eventsStatsRes] = await Promise.all([
        axios.get(`${API_URL}/auth/users?limit=1000`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/events?limit=1000`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/events/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const users = usersRes.data.users || [];
      const events = eventsRes.data.events || [];
      const eventStats = eventsStatsRes.data.stats;

      const totalUsers = users.length;
      const alumniCount = users.filter(u => u.role === 'alumni').length;
      const studentCount = users.filter(u => u.role === 'student').length;
      const activeUsers = users.filter(u => u.isActive).length;
      const upcomingEvents = events.filter(e => e.status === 'upcoming').length;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const usersThisMonth = users.filter(u => 
        new Date(u.createdAt) >= thirtyDaysAgo
      ).length;
      
      const eventsThisMonth = events.filter(e => 
        new Date(e.createdAt) >= thirtyDaysAgo
      ).length;

      const usersGrowth = totalUsers > 0 ? ((usersThisMonth / totalUsers) * 100).toFixed(1) : 0;
      const eventsGrowth = events.length > 0 ? ((eventsThisMonth / events.length) * 100).toFixed(1) : 0;

      let totalEventAttendees = 0;
      events.forEach(event => {
        if (event.attendees) {
          totalEventAttendees += event.attendees.filter(a => a.status === 'registered').length;
        }
      });

      const departmentCounts = {};
      users.forEach(user => {
        if (user.department) {
          departmentCounts[user.department] = (departmentCounts[user.department] || 0) + 1;
        }
      });

      const usersByDepartment = Object.entries(departmentCounts)
        .map(([department, count]) => ({
          department,
          count,
          percentage: ((count / totalUsers) * 100).toFixed(1)
        }))
        .sort((a, b) => b.count - a.count);

      const topEvents = events
        .map(event => ({
          ...event,
          attendeeCount: event.attendees?.filter(a => a.status === 'registered').length || 0
        }))
        .sort((a, b) => b.attendeeCount - a.attendeeCount)
        .slice(0, 5);

      const recentActivities = [
        ...users.slice(-5).map(u => ({
          type: 'user',
          message: `${u.name} joined as ${u.role}`,
          time: new Date(u.createdAt),
          icon: UserPlus,
          color: 'blue'
        })),
        ...events.slice(-5).map(e => ({
          type: 'event',
          message: `Event "${e.title}" created`,
          time: new Date(e.createdAt),
          icon: Calendar,
          color: 'purple'
        }))
      ]
        .sort((a, b) => b.time - a.time)
        .slice(0, 10);

      setAnalytics({
        overview: {
          totalUsers,
          totalEvents: events.length,
          totalPosts: 0,
          totalMessages: 0,
          alumniCount,
          studentCount,
          activeUsers,
          upcomingEvents
        },
        growth: {
          usersThisMonth,
          eventsThisMonth,
          postsThisMonth: 0,
          usersGrowth,
          eventsGrowth,
          postsGrowth: 0
        },
        engagement: {
          totalEventAttendees,
          averageEventCapacity: eventStats.avgCapacity,
          totalPostLikes: 0,
          totalPostComments: 0,
          activeToday: users.filter(u => {
            if (!u.lastLogin) return false;
            const lastLogin = new Date(u.lastLogin);
            const today = new Date();
            return lastLogin.toDateString() === today.toDateString();
          }).length
        },
        usersByDepartment,
        recentActivities,
        topEvents
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, gradient, trend, trendValue }) => (
    <div className={`bg-gradient-to-r ${gradient} rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-200`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm opacity-90">{title}</p>
            <h3 className="text-3xl font-bold">{loading ? '...' : value}</h3>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 ${
            trend === 'up' ? 'text-green-200' : 'text-red-200'
          }`}>
            {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            <span className="text-sm font-semibold">{trendValue}%</span>
          </div>
        )}
      </div>
      <p className="text-white/80 text-sm">{subtitle}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Auto-Refresh */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center space-x-3">
              <Activity className="w-8 h-8" />
              <span>Real-Time Analytics Dashboard</span>
            </h2>
            <p className="text-blue-100 flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Last updated: {formatTime(lastUpdated)}</span>
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                autoRefresh 
                  ? 'bg-white text-purple-600 shadow-lg' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Zap className={`w-4 h-4 ${autoRefresh ? 'animate-pulse' : ''}`} />
              <span>{autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}</span>
            </button>
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Platform Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={analytics.overview.totalUsers}
            subtitle={`${analytics.overview.activeUsers} active users`}
            icon={Users}
            gradient="from-purple-500 to-purple-600"
            trend="up"
            trendValue={analytics.growth.usersGrowth}
          />
          <StatCard
            title="Total Events"
            value={analytics.overview.totalEvents}
            subtitle={`${analytics.overview.upcomingEvents} upcoming`}
            icon={Calendar}
            gradient="from-blue-500 to-blue-600"
            trend="up"
            trendValue={analytics.growth.eventsGrowth}
          />
          <StatCard
            title="Alumni"
            value={analytics.overview.alumniCount}
            subtitle="Graduated members"
            icon={TrendingUp}
            gradient="from-green-500 to-green-600"
          />
          <StatCard
            title="Students"
            value={analytics.overview.studentCount}
            subtitle="Current students"
            icon={Users}
            gradient="from-orange-500 to-orange-600"
          />
        </div>
      </div>

      {/* Growth & Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Metrics */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <span>Growth (Last 30 Days)</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">New Users</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.growth.usersThisMonth}</p>
              </div>
              <div className="flex items-center space-x-1 text-green-600">
                <ArrowUp className="w-5 h-5" />
                <span className="font-semibold">{analytics.growth.usersGrowth}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">New Events</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.growth.eventsThisMonth}</p>
              </div>
              <div className="flex items-center space-x-1 text-green-600">
                <ArrowUp className="w-5 h-5" />
                <span className="font-semibold">{analytics.growth.eventsGrowth}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Active Today</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.engagement.activeToday}</p>
              </div>
              <div className="flex items-center space-x-1 text-blue-600">
                <Activity className="w-5 h-5" />
                <span className="font-semibold">Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Activity className="w-6 h-6 text-purple-600" />
            <span>Engagement Metrics</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CalendarCheck className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Event Registrations</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.engagement.totalEventAttendees}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg. Event Capacity</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.engagement.averageEventCapacity}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.activeUsers}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users by Department & Top Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Department */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Users by Department</h3>
          <div className="space-y-3">
            {analytics.usersByDepartment.slice(0, 5).map((dept, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{dept.department}</span>
                  <span className="text-gray-600">{dept.count} users ({dept.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${dept.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Events */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Top Events by Attendance</h3>
          <div className="space-y-4">
            {analytics.topEvents.map((event, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  index === 0 ? 'bg-yellow-500' :
                  index === 1 ? 'bg-gray-400' :
                  index === 2 ? 'bg-orange-500' :
                  'bg-purple-500'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 line-clamp-1">{event.title}</p>
                  <p className="text-sm text-gray-600">{event.attendeeCount} attendees</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  event.type === 'Workshop' ? 'bg-blue-100 text-blue-800' :
                  event.type === 'Networking' ? 'bg-green-100 text-green-800' :
                  event.type === 'Seminar' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {event.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-purple-600" />
            <span>Recent Platform Activity</span>
          </span>
          <span className="text-sm text-gray-500">Real-time updates</span>
        </h3>
        <div className="space-y-3">
          {analytics.recentActivities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.color === 'blue' ? 'bg-blue-100' :
                  activity.color === 'purple' ? 'bg-purple-100' :
                  activity.color === 'green' ? 'bg-green-100' :
                  'bg-gray-100'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    activity.color === 'blue' ? 'text-blue-600' :
                    activity.color === 'purple' ? 'text-purple-600' :
                    activity.color === 'green' ? 'text-green-600' :
                    'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.message}</p>
                  <p className="text-sm text-gray-500">{formatRelativeTime(activity.time)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Export Analytics Report</h3>
            <p className="text-sm text-gray-600">Download comprehensive analytics data</p>
          </div>
          <button className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-lg hover:shadow-xl">
            <Download className="w-5 h-5" />
            <span>Export as PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;