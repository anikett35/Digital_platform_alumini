import React from 'react';
import { GraduationCap } from 'lucide-react';
export default function Loader() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <p className="text-gray-600 font-medium">Loading…</p>
        <div className="w-32 h-1 bg-gray-200 rounded-full mx-auto mt-3 overflow-hidden">
          <div className="h-full bg-violet-600 rounded-full animate-pulse" style={{width:'60%'}} />
        </div>
      </div>
    </div>
  );
}
