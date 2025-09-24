import React from 'react';
import { GraduationCap } from 'lucide-react';

const Loader = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-white/20 rounded-full mx-auto animate-spin border-t-white/80"></div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Alumni Platform</h2>
        <p className="text-white/80 mb-4">Loading your experience...</p>
        
        <div className="flex space-x-2 justify-center">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;