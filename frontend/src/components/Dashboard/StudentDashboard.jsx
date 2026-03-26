import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobsAPI, meetingsAPI, postsAPI } from '../../services/api.jsx';
import { toast } from 'react-toastify';
import {
  Briefcase, Video, Users, TrendingUp, ArrowRight, Clock,
  BookOpen, Hash, MessageSquare, Star, MapPin, Calendar,
  Sparkles, CheckCircle, Bell, RefreshCw
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
    <div className="min-w-0">
      <p className="font-semibold text-gray-900 text-sm">{label}</p>
      <p className="text-xs text-gray-500 truncate">{desc}</p>
    </div>
    <ArrowRight className="w-4 h-4 text-gray-400 ml-auto shrink-0" />
  </Link>
);

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs,     setJobs]     = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [jobsRes, meetingsRes] = await Promise.allSettled([
        jobsAPI.getJobs(),
        meetingsAPI.getMyMeetings(),
      ]);
      if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.data.slice(0, 4));
      if (meetingsRes.status === 'fulfilled') setMeetings(meetingsRes.value.data.slice(0, 3));
    } catch { toast.error('Failed to load dashboard data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const firstName = user?.name?.split(' ')[0] || 'Student';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const pendingMeetings = meetings.filter(m => m.status === 'pending').length;
  const acceptedMeetings = meetings.filter(m => m.status === 'accepted').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Welcome Hero */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white blur-3xl -ml-10 -mb-10" />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-violet-200 text-sm font-medium mb-1">{greeting} 👋</p>
            <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">{firstName}!</h1>
            <p className="text-violet-100 text-sm max-w-md">
              Your alumni network is ready to help. Explore jobs, request mentorship, and grow your career.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link to="/jobs" className="inline-flex items-center gap-2 bg-white text-violet-700 font-bold px-4 py-2 rounded-xl text-sm hover:bg-violet-50 transition-all shadow-sm">
                <Briefcase className="w-4 h-4" /> Browse Jobs
              </Link>
              <Link to="/meetings" className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all">
                <Video className="w-4 h-4" /> Request Mentorship
              </Link>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold">
              {firstName.charAt(0)}
            </div>
            <span className="text-xs text-violet-200 font-medium uppercase tracking-wide">{user?.department}</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Briefcase} label="Open Jobs" value={jobs.length} color="bg-blue-100 text-blue-600" to="/jobs" />
        <StatCard icon={Video}     label="Pending Sessions" value={pendingMeetings} color="bg-violet-100 text-violet-600" to="/meetings" />
        <StatCard icon={CheckCircle} label="Confirmed Sessions" value={acceptedMeetings} color="bg-emerald-100 text-emerald-600" to="/meetings" />
        <StatCard icon={TrendingUp} label="Career Insights" value="Live" color="bg-amber-100 text-amber-600" to="/insights" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Jobs */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title mb-0">Recent Job Openings</h2>
            <Link to="/jobs" className="text-sm text-violet-600 font-semibold hover:text-violet-700 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-10">
              <Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No jobs posted yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map(job => (
                <Link key={job._id} to="/jobs" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group">
                  <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center text-lg font-bold text-violet-700 shrink-0">
                    {job.company?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-violet-700 transition-colors">{job.title}</p>
                    <p className="text-xs text-gray-500 truncate">{job.company} {job.location ? `· ${job.location}` : ''}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                    job.job_type === 'Internship' ? 'bg-amber-100 text-amber-700' :
                    job.job_type === 'Full-time'  ? 'bg-emerald-100 text-emerald-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{job.job_type || 'Job'}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="section-title">Quick Actions</h2>
            <div className="space-y-2">
              <QuickAction icon={Video}        label="Request Session"  desc="Book a mentorship session" to="/meetings"    color="bg-violet-100 text-violet-600" />
              <QuickAction icon={TrendingUp}   label="Career Insights"  desc="Explore alumni career paths" to="/insights"  color="bg-blue-100 text-blue-600" />
              <QuickAction icon={Hash}         label="Communities"      desc="Join department groups"     to="/communities"color="bg-purple-100 text-purple-600" />
              <QuickAction icon={Users}        label="Alumni Directory" desc="Find mentors"               to="/alumni-directory" color="bg-indigo-100 text-indigo-600" />
            </div>
          </div>

          {/* Profile completion */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <p className="font-bold text-gray-900 text-sm">Complete Your Profile</p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
              <div className="bg-violet-600 h-2 rounded-full transition-all" style={{width: '45%'}} />
            </div>
            <p className="text-xs text-gray-500 mb-3">45% complete — add skills to stand out</p>
            <Link to="/setup-profile" className="btn-primary w-full text-xs py-2">Complete Profile</Link>
          </div>
        </div>
      </div>

      {/* My Meetings */}
      {meetings.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title mb-0">My Mentorship Sessions</h2>
            <Link to="/meetings" className="text-sm text-violet-600 font-semibold hover:text-violet-700 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {meetings.map(m => (
              <div key={m._id} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 avatar text-sm">{m.alumni?.name?.charAt(0) || '?'}</div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{m.alumni?.name || 'Alumni'}</p>
                    <p className="text-xs text-gray-500 truncate">{m.alumni?.currentPosition}</p>
                  </div>
                </div>
                <p className="text-xs font-medium text-gray-700 truncate">📌 {m.topic}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    m.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                    m.status === 'pending'  ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{m.status}</span>
                  {m.scheduledAt && <span className="text-xs text-gray-400">{new Date(m.scheduledAt).toLocaleDateString()}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
