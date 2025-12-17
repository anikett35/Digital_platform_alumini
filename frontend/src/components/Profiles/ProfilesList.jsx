import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Users, 
  X, 
  MapPin, 
  Briefcase, 
  Building, 
  GraduationCap,
  ChevronDown,
  Loader2
} from 'lucide-react';
import AlumniProfileCard from './AlumniProfileCard';
import AlumniFilters from './AlumniFilters';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const ProfilesList = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    industry: '',
    company: '',
    department: '',
    skills: '',
    graduationYear: ''
  });
  const [availableFilters, setAvailableFilters] = useState({
    industries: [],
    companies: [],
    departments: []
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalAlumni: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlumni();
  }, [filters, pagination.currentPage]);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Build query params
      const params = {
        page: pagination.currentPage,
        limit: 12
      };
      
      // Add filters if they exist
      if (filters.industry) params.industry = filters.industry;
      if (filters.company) params.company = filters.company;
      if (filters.department) params.department = filters.department;
      if (filters.skills) params.skills = filters.skills;
      if (filters.graduationYear) params.graduationYear = filters.graduationYear;
      if (searchTerm && searchTerm.trim() !== '') params.search = searchTerm;
      
      console.log('Fetching alumni with params:', params);
      
      const response = await axios.get(`${API_URL}/profiles/alumni`, {
        params: params,
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });
      
      console.log('API Response:', response.data);
      
      setAlumni(response.data.alumni || []);
      setAvailableFilters(response.data.filters || {});
      setPagination({
        currentPage: response.data.currentPage || 1,
        totalPages: response.data.totalPages || 1,
        totalAlumni: response.data.totalAlumni || 0
      });
    } catch (error) {
      console.error('Error fetching alumni:', error);
      console.log('Error response:', error.response?.data);
      
      setAlumni([]);
      setAvailableFilters({});
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalAlumni: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAlumni();
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      industry: '',
      company: '',
      department: '',
      skills: '',
      graduationYear: ''
    });
    setSearchTerm('');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleViewProfile = (alumni) => {
    // Navigate to the full profile page
    navigate(`/alumni/${alumni._id}`);
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const renderStats = () => {
    if (loading && pagination.totalAlumni === 0) return null;
    
    return (
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Alumni Directory</h2>
            <p className="text-blue-100">Connect with successful alumni from your institution</p>
          </div>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <div className="text-center">
              <div className="text-3xl font-bold">{pagination.totalAlumni}</div>
              <div className="text-blue-200 text-sm">Total Alumni</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {alumni.filter(a => a.isOpenToMentorship).length}
              </div>
              <div className="text-blue-200 text-sm">Available Mentors</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {renderStats()}

      <div className="max-w-7xl mx-auto">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search alumni by name, company, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-xl font-medium flex items-center space-x-2 ${
                  showFilters 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
                {Object.values(filters).some(f => f) && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </button>

              {Object.values(filters).some(f => f) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-3 text-red-600 hover:text-red-700 font-medium flex items-center space-x-2"
                >
                  <X className="w-5 h-5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <AlumniFilters
                filters={filters}
                availableFilters={availableFilters}
                onFilterChange={handleFilterChange}
              />
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="ml-3 text-gray-600">Loading alumni profiles...</span>
          </div>
        ) : alumni.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No alumni found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Alumni Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {alumni.map((alumniProfile) => (
                <AlumniProfileCard
                  key={alumniProfile._id}
                  alumni={alumniProfile}
                  onClick={handleViewProfile}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {[...Array(pagination.totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      className={`px-4 py-2 rounded-lg ${
                        pagination.currentPage === index + 1
                          ? 'bg-blue-500 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilesList;