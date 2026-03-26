import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Alumni<span className="text-violet-600">Connect</span></span>
          </Link>
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} AlumniConnect. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <a href="#" className="p-2 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-all"><Linkedin className="w-4 h-4" /></a>
            <a href="#" className="p-2 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-all"><Github className="w-4 h-4" /></a>
            <a href="#" className="p-2 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-all"><Mail className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
