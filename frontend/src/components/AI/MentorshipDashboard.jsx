import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Video, ArrowRight } from 'lucide-react';
export default function MentorshipDashboard() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><Users className="w-8 h-8 text-violet-600" /></div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Mentorship Hub</h1>
      <p className="text-gray-500 mb-6">Manage all your mentorship connections and sessions</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/meetings" className="btn-primary"><Video className="w-4 h-4" /> My Sessions</Link>
        <Link to="/ai-matching" className="btn-secondary"><ArrowRight className="w-4 h-4" /> Find Mentors</Link>
      </div>
    </div>
  );
}
