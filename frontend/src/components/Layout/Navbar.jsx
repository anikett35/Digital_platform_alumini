import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap, Home, Briefcase, Hash, TrendingUp, Video,
  MessageSquare, Users, Bell, ChevronDown, LogOut, Settings,
  Menu, X, User
} from 'lucide-react';

const NAV = {
  student: [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Jobs',      path: '/jobs',      icon: Briefcase },
    { label: 'Community', path: '/communities',icon: Hash },
    { label: 'Insights',  path: '/insights',  icon: TrendingUp },
    { label: 'Meetings',  path: '/meetings',  icon: Video },
    { label: 'Messages',  path: '/messages',  icon: MessageSquare },
  ],
  alumni: [
    { label: 'Dashboard', path: '/dashboard',  icon: Home },
    { label: 'Jobs',      path: '/jobs',       icon: Briefcase },
    { label: 'Community', path: '/communities',icon: Hash },
    { label: 'Insights',  path: '/insights',   icon: TrendingUp },
    { label: 'Meetings',  path: '/meetings',   icon: Video },
    { label: 'Messages',  path: '/messages',   icon: MessageSquare },
    { label: 'Requests',  path: '/mentorships',icon: Users },
  ],
  admin: [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Messages',  path: '/messages',  icon: MessageSquare },
  ],
};

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen,   setDropOpen]   = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!isAuthenticated) return null;

  const links = NAV[user?.role] || NAV.admin;

  const isActive = (path) => location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));

  const roleColors = {
    student: 'bg-blue-100 text-blue-700',
    alumni:  'bg-violet-100 text-violet-700',
    admin:   'bg-rose-100 text-rose-700',
  };

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-white border-b border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-sm">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-gray-900 text-lg">Alumni<span className="text-violet-600">Connect</span></span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1 bg-gray-50 rounded-2xl p-1 border border-gray-100">
            {links.map(l => (
              <Link key={l.path} to={l.path}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(l.path) ? 'bg-white text-violet-700 shadow-sm border border-gray-100' : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'}`}>
                <l.icon className="w-4 h-4" />
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button className="relative p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full" />
            </button>

            {/* Profile dropdown */}
            <div ref={dropRef} className="relative">
              <button onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-900 leading-none">{user?.name?.split(' ')[0]}</p>
                  <p className="text-xs text-gray-500 capitalize mt-0.5">{user?.role}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-modal border border-gray-100 py-2 animate-fade-up z-50">
                  <div className="px-4 py-2.5 border-b border-gray-100 mb-1">
                    <p className="font-bold text-gray-900 text-sm">{user?.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${roleColors[user?.role]}`}>{user?.role}</span>
                  </div>
                  <Link to="/setup-profile" className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors mx-1 rounded-xl">
                    <Settings className="w-4 h-4" /> Settings & Profile
                  </Link>
                  {user?.role === 'alumni' && (
                    <Link to="/verify" className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors mx-1 rounded-xl">
                      <User className="w-4 h-4" /> Verification
                    </Link>
                  )}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button onClick={logout} className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left mx-1 rounded-xl" style={{width:'calc(100% - 8px)'}}>
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors">
              {mobileOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg animate-fade-up">
          <div className="px-4 py-3 space-y-1">
            {links.map(l => (
              <Link key={l.path} to={l.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive(l.path) ? 'bg-violet-50 text-violet-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                <l.icon className="w-5 h-5" />
                {l.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 pt-2 mt-2">
              <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-all">
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}