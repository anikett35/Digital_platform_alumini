import React from 'react';
import { 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  ExternalLink,
  Users,
  Star,
  Linkedin,
  Github
} from 'lucide-react';

const AlumniProfileCard = ({ alumni, onClick }) => {
  const formatYear = (year) => {
    if (!year) return '';
    return `Class of ${year}`;
  };

  const handleViewClick = (e) => {
    e.stopPropagation(); // Prevent card click
    onClick(alumni);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Header */}
      <div className="relative h-32 bg-gradient-to-r from-blue-500 to-indigo-600">
        {alumni.profileImage ? (
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <img 
              src={alumni.profileImage} 
              alt={alumni.name}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
            />
          </div>
        ) : (
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {alumni.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="pt-14 pb-6 px-6 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{alumni.name}</h3>
        
        {alumni.profileHeadline && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{alumni.profileHeadline}</p>
        )}
        
        {alumni.currentCompany && alumni.currentPosition && (
          <div className="flex items-center justify-center text-gray-700 mb-3">
            <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm font-medium">{alumni.currentPosition} at {alumni.currentCompany}</span>
          </div>
        )}

        {alumni.department && (
          <div className="flex items-center justify-center text-gray-600 mb-3">
            <GraduationCap className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm">{alumni.department} • {formatYear(alumni.graduationYear)}</span>
          </div>
        )}

        {alumni.location && (
          <div className="flex items-center justify-center text-gray-600 mb-4">
            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm">{alumni.location}</span>
          </div>
        )}

        {/* Skills */}
        {alumni.skills && alumni.skills.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap justify-center gap-2">
              {alumni.skills.slice(0, 4).map((skill, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                >
                  {skill}
                </span>
              ))}
              {alumni.skills.length > 4 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  +{alumni.skills.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Single View Button */}
        <div className="flex justify-center mt-4">
          <button 
            onClick={handleViewClick}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center shadow-md hover:shadow-lg"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Full Profile
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center text-gray-600">
          {alumni.isOpenToMentorship ? (
            <>
              <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
              <span className="text-xs font-medium text-yellow-700">Mentor Available</span>
            </>
          ) : (
            <>
              <Users className="w-4 h-4 mr-1" />
              <span className="text-xs">Alumni</span>
            </>
          )}
        </div>
        
        {/* Social links */}
        <div className="flex space-x-2">
          {alumni.linkedinUrl && (
            <a 
              href={alumni.linkedinUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-blue-700"
              onClick={(e) => e.stopPropagation()}
            >
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {alumni.githubUrl && (
            <a 
              href={alumni.githubUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <Github className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlumniProfileCard;