import React from 'react';
import { GraduationCap } from 'lucide-react';

const Loader = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-4">
        {/* Animated logo */}
        <div className="relative inline-block">
          <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div className="absolute inset-0 w-16 h-16 border-2 border-gray-900/20 rounded-full animate-spin border-t-gray-900"></div>
        </div>
        
        {/* Text */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Alumni Network
          </h2>
          <p className="text-gray-500 text-sm">
            Loading...
          </p>
        </div>
        
        {/* Simple loading bar */}
        <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-gray-900 rounded-full animate-loading-bar"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
            width: 20%;
          }
          50% {
            transform: translateX(0);
            width: 100%;
          }
          100% {
            transform: translateX(100%);
            width: 20%;
          }
        }

        .animate-loading-bar {
          animation: loading-bar 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Loader;