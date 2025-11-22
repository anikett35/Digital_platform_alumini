import React, { useState, useEffect } from 'react';
import {
  Users as UsersIcon, Search, Filter, Download, Mail, Phone,
  MapPin, Calendar, Briefcase, GraduationCap, Eye, Trash2,
  UserCheck, UserX, RefreshCw, AlertCircle, Loader
} from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const UsersManagement = () => {
  const [allUsers, setAllUsers] = useState([]); // Store ALL users
  const [displayedUsers, setDisplayedUsers] = useState([]); // Users to display after filtering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'alumni', 'student'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    alumni: 0,
    students: 0,
    active: 0
  });

  // Fetch ALL users once when component mounts
  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Filter users whenever tab, search, or department filter changes
  useEffect(() => {
    filterUsers();
  }, [activeTab, searchTerm, filterDepartment, allUsers]);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      // Fetch ALL users without any filters
      const response = await axios.get(
        `${API_URL}/auth/users?limit=1000`, // Get all users
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('All users fetched:', response.data);
      const users = response.data.users || [];
      setAllUsers(users);
      
      // Calculate real statistics from database
      const totalUsers = users.length;
      const alumniCount = users.filter(u => u.role === 'alumni').length;
      const studentsCount = users.filter(u => u.role === 'student').length;
      const activeCount = users.filter(u => u.isActive).length;
      
      setStats({
        total: totalUsers,
        alumni: alumniCount,
        students: studentsCount,
        active: activeCount
      });
      
      console.log('Real stats calculated:', {
        total: totalUsers,
        alumni: alumniCount,
        students: studentsCount,
        active: activeCount
      });
      
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...allUsers];
    
    // Filter by role (tab)
    if (activeTab === 'alumni') {
      filtered = filtered.filter(u => u.role === 'alumni');
    } else if (activeTab === 'student') {
      filtered = filtered.filter(u => u.role === 'student');
    }
    
    // Filter by department
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(u => u.department === filterDepartment);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => {
        const matchesSearch = 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.studentId && user.studentId.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
      });
    }
    
    setDisplayedUsers(filtered);
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/auth/users/${userId}/toggle-status`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Refresh all users to get updated data
      fetchAllUsers();
      alert('User status updated successfully');
    } catch (err) {
      console.error('Error updating user status:', err);
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_URL}/auth/users/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Refresh all users to get updated data
      fetchAllUsers();
      alert('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  // Get unique departments from all users
  const departments = [...new Set(allUsers.map(u => u.department))].filter(Boolean);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate active rate percentage
  const activeRate = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stats Grid - Using REAL data from database */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Total Users</h3>
              <p className="text-3xl font-bold">{loading ? '...' : stats.total}</p>
              <p className="text-white/80 text-sm">{stats.active} active users</p>
            </div>
            <UsersIcon className="w-9 h-9 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Alumni</h3>
              <p className="text-3xl font-bold">{loading ? '...' : stats.alumni}</p>
              <p className="text-white/80 text-sm">Graduated members</p>
            </div>
            <GraduationCap className="w-9 h-9 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Students</h3>
              <p className="text-3xl font-bold">{loading ? '...' : stats.students}</p>
              <p className="text-white/80 text-sm">Current students</p>
            </div>
            <UsersIcon className="w-9 h-9 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Active Rate</h3>
              <p className="text-3xl font-bold">{loading ? '...' : `${activeRate}%`}</p>
              <p className="text-white/80 text-sm">User engagement</p>
            </div>
            <UserCheck className="w-9 h-9 opacity-80" />
          </div>
        </div>
      </div>

    

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          All Users ({stats.total})
        </button>
        <button
          onClick={() => setActiveTab('alumni')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'alumni'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Alumni ({stats.alumni})
        </button>
        <button
          onClick={() => setActiveTab('student')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'student'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Students ({stats.students})
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, or student ID..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <button
            onClick={fetchAllUsers}
            className="flex items-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>

          <button className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-semibold">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Users List */}
      {!loading && !error && (
        <div className="space-y-4">
          {displayedUsers.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
              <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No users found</p>
              {searchTerm && (
                <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {displayedUsers.map(user => (
                <div
                  key={user._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* User Info */}
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                        user.role === 'alumni' ? 'bg-blue-500' :
                        user.role === 'student' ? 'bg-green-500' :
                        'bg-purple-500'
                      }`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'alumni' ? 'bg-blue-100 text-blue-800' :
                            user.role === 'student' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{user.email}</span>
                          </div>

                          {user.studentId && (
                            <div className="flex items-center space-x-2">
                              <GraduationCap className="w-4 h-4 text-gray-400" />
                              <span>ID: {user.studentId}</span>
                            </div>
                          )}

                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{user.department}</span>
                          </div>

                          {user.phoneNumber && (
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{user.phoneNumber}</span>
                            </div>
                          )}

                          {user.role === 'alumni' && user.graduationYear && (
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>Graduated: {user.graduationYear}</span>
                            </div>
                          )}

                          {user.role === 'alumni' && user.currentCompany && (
                            <div className="flex items-center space-x-2">
                              <Briefcase className="w-4 h-4 text-gray-400" />
                              <span>{user.currentPosition} at {user.currentCompany}</span>
                            </div>
                          )}

                          {user.role === 'student' && user.currentYear && (
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>Year: {user.currentYear}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 text-xs text-gray-500">
                          Joined: {formatDate(user.createdAt)}
                          {user.lastLogin && ` • Last login: ${formatDate(user.lastLogin)}`}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 lg:flex-shrink-0">
                      <button
                        onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.isActive
                            ? 'text-orange-600 hover:bg-orange-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={user.isActive ? 'Deactivate User' : 'Activate User'}
                      >
                        {user.isActive ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                      </button>

                      <button
                        onClick={() => alert('View user details - Feature coming soon')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UsersManagement;