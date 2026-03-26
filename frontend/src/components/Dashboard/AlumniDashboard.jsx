import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobsAPI, meetingsAPI } from '../../services/api.jsx';
import { toast } from 'react-toastify';
import {
  Briefcase, Video, Users, TrendingUp, ArrowRight, Plus,
  Hash, MessageSquare, CheckCircle, Clock, Star, Globe,
  Sparkles, Shield, Calendar
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, to }) => (
  <Link to={to} className="card-hover p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
    </div>
  </Link>
);

const QuickAction = ({ icon: Icon, label, desc, to, color }) => (
  <Link to={to} className="card-hover p-4 flex items-center gap-3">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="font-semibold text-gray-900 text-sm">{label}</p>
      <p className="text-xs text-gray-500 truncate">{desc}</p>
    </div>
    <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
  </Link>
);

export default function AlumniDashboard() {
  const { user } = useAuth();
  const [myJobs,    setMyJobs]    = useState([]);
  const [meetings,  setMeetings]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [jobsRes, meetingsRes] = await Promise.allSettled([
        jobsAPI.getJobs(),
        meetingsAPI.getMyMeetings(),
      ]);
      if (jobsRes.status === 'fulfilled') setMyJobs(jobsRes.value.data.filter(j => j.poster_id?._id === user?.id || j.poster_id === user?.id).slice(0, 3));
      if (meetingsRes.status === 'fulfilled') setMeetings(meetingsRes.value.data.slice(0, 5));
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const firstName = user?.name?.split(' ')[0] || 'Alumni';
  const pendingRequests = meetings.filter(m => m.status === 'pending').length;
  const completedSessions = meetings.filter(m => m.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white blur-3xl -mr-20 -mt-20" />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-indigo-200 text-sm font-medium mb-1">Welcome back 🎓</p>
            <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">{firstName}!</h1>
            <p className="text-indigo-100 text-sm max-w-md">
              {pendingRequests > 0
                ? `You have ${pendingRequests} pending mentorship request${pendingRequests > 1 ? 's' : ''} waiting.`
                : 'Share your experience and help students grow their careers.'}
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link to="/jobs" className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-4 py-2 rounded-xl text-sm hover:bg-indigo-50 transition-all shadow-sm">
                <Plus className="w-4 h-4" /> Post a Job
              </Link>
              <Link to="/meetings" className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all">
                <Video className="w-4 h-4" /> View Requests
              </Link>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold">
              {firstName.charAt(0)}
            </div>
            <span className="text-xs text-indigo-200 font-medium">{user?.currentPosition || 'Alumni'}</span>
            {user?.isVerifiedAlumni && (
              <span className="text-xs bg-emerald-400/30 text-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Shield className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Clock}    label="Pending Requests"   value={pendingRequests}    color="bg-amber-100 text-amber-600"    to="/meetings" />
        <StatCard icon={CheckCircle} label="Completed Sessions" value={completedSessions} color="bg-emerald-100 text-emerald-600" to="/meetings" />
        <StatCard icon={Briefcase} label="Jobs Posted"       value={myJobs.length}     color="bg-blue-100 text-blue-600"       to="/jobs" />
        <StatCard icon={Star}     label="Open to Mentor"     value={user?.isOpenToMentorship ? 'Yes' : 'No'} color="bg-violet-100 text-violet-600" to="/setup-profile" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Pending Mentorship Requests */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title mb-0">Mentorship Requests</h2>
            <Link to="/meetings" className="text-sm text-violet-600 font-semibold hover:text-violet-700 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : meetings.filter(m => m.status === 'pending').length === 0 ? (
            <div className="text-center py-10">
              <Video className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No pending requests</p>
              <p className="text-gray-400 text-xs mt-1">Students will appear here when they request sessions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {meetings.filter(m => m.status === 'pending').map(m => (
                <div key={m._id} className="flex items-center gap-3 p-3 rounded-xl border border-amber-100 bg-amber-50">
                  <div className="w-10 h-10 avatar text-sm">{m.student?.name?.charAt(0) || '?'}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{m.student?.name || 'Student'}</p>
                    <p className="text-xs text-gray-500 truncate">📌 {m.topic}</p>
                  </div>
                  <Link to="/meetings" className="btn-primary py-1.5 px-3 text-xs shrink-0">Review</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="section-title">Quick Actions</h2>
            <div className="space-y-2">
              <QuickAction icon={Briefcase}  label="Post a Job"      desc="Share opportunities with students" to="/jobs"         color="bg-blue-100 text-blue-600" />
              <QuickAction icon={Hash}       label="Community"       desc="Engage with your department"       to="/communities"  color="bg-purple-100 text-purple-600" />
              <QuickAction icon={TrendingUp} label="Career Insights" desc="View department analytics"         to="/insights"     color="bg-amber-100 text-amber-600" />
              <QuickAction icon={MessageSquare} label="Messages"     desc="Chat with students"                to="/messages"     color="bg-emerald-100 text-emerald-600" />
            </div>
          </div>

          {/* Profile card */}
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 avatar">{firstName.charAt(0)}</div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.currentPosition || 'Add your position'}</p>
              </div>
            </div>
            {user?.currentCompany && <p className="text-xs text-gray-500 mb-3 flex items-center gap-1"><Globe className="w-3 h-3" />{user.currentCompany}</p>}
            <Link to="/setup-profile" className="btn-secondary w-full text-xs py-2">Edit Profile</Link>
          </div>
        </div>
      </div>

      {/* Accepted/Completed Sessions */}
      {meetings.filter(m => ['accepted','completed'].includes(m.status)).length > 0 && (
        <div className="card p-6">
          <h2 className="section-title">Your Sessions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {meetings.filter(m => ['accepted','completed'].includes(m.status)).map(m => (
              <div key={m._id} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 avatar text-sm">{m.student?.name?.charAt(0) || '?'}</div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{m.student?.name || 'Student'}</p>
                    <p className="text-xs text-gray-500 truncate">{m.topic}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{m.status}</span>
                  {m.meetingLink && (
                    <a href={m.meetingLink} target="_blank" rel="noreferrer" className="text-xs text-violet-600 font-semibold flex items-center gap-1 hover:text-violet-700">
                      <Video className="w-3 h-3" /> Join
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
