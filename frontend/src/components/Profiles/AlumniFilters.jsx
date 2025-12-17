import React, { useState } from 'react';
import { 
  Briefcase, 
  Building, 
  GraduationCap, 
  MapPin,
  Tag,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const AlumniFilters = ({ filters, availableFilters, onFilterChange }) => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterSelect = (filterType, value) => {
    onFilterChange({
      ...filters,
      [filterType]: value
    });
  };

  const handleSkillsChange = (e) => {
    onFilterChange({
      ...filters,
      skills: e.target.value
    });
  };

  const handleGraduationYearChange = (e) => {
    onFilterChange({
      ...filters,
      graduationYear: e.target.value
    });
  };

  const renderFilterSection = (title, Icon, filterType, options) => {
    const isExpanded = expandedSections[filterType];
    
    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection(filterType)}
          className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100"
        >
          <div className="flex items-center space-x-3">
            <Icon className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        {isExpanded && (
          <div className="p-4 bg-white">
            <div className="space-y-2">
              {options && options.length > 0 ? (
                options.map((option, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleFilterSelect(filterType, option)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      filters[filterType] === option
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {option}
                  </button>
                ))
              ) : (
                <p className="text-gray-500 text-sm italic">No options available</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Industry Filter */}
      {renderFilterSection(
        'Industry',
        Building,
        'industry',
        availableFilters.industries
      )}

      {/* Company Filter */}
      {renderFilterSection(
        'Current Company',
        Briefcase,
        'company',
        availableFilters.companies
      )}

      {/* Department Filter */}
      {renderFilterSection(
        'Department',
        GraduationCap,
        'department',
        availableFilters.departments
      )}

      {/* Skills Filter */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 flex items-center space-x-3">
          <Tag className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Skills</span>
        </div>
        <div className="p-4 bg-white">
          <input
            type="text"
            placeholder="e.g., React, Python, Marketing"
            value={filters.skills}
            onChange={handleSkillsChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Graduation Year Filter */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Graduation Year</span>
        </div>
        <div className="p-4 bg-white">
          <input
            type="number"
            placeholder="e.g., 2020"
            min="1950"
            max="2030"
            value={filters.graduationYear}
            onChange={handleGraduationYearChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default AlumniFilters;