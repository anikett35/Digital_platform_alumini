import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsAPI, applicationsAPI } from '../../services/api.jsx';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
  Briefcase, MapPin, DollarSign, Clock, Search, Filter,
  ChevronRight, Loader, AlertCircle, Plus, X, CheckCircle,
  Building, FileText, Calendar, RefreshCw
} from 'lucide-react';

const TYPE_COLORS = {
  'Full-time':  'bg-indigo-50 text-indigo-700 border-indigo-100',
  'Part-time':  'bg-violet-50 text-violet-700 border-violet-100',
  'Contract':   'bg-amber-50  text-amber-700  border-amber-100',
  'Internship': 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

/* ─── Post Job Modal ─── */
function PostJobModal({ onClose, onPosted }) {
  const [form, setForm] = useState({
    title: '', company: '', location: '', job_type: 'Full-time',
    salary_range: '', description: '', requirements: '', deadline: ''
  });
  const [loading, setLoading] = useState(false);
  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.title || !form.company) { toast.error('Title and company are required'); return; }
    setLoading(true);
    try {
      await jobsAPI.createJob(form);
      toast.success('✅ Job posted successfully!');
      onPosted();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" /> Post a Job
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Job Title *</label>
              <input name="title" value={form.title} onChange={change} required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="e.g. Senior Engineer" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Company *</label>
              <input name="company" value={form.company} onChange={change} required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="e.g. Google" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Location</label>
              <input name="location" value={form.location} onChange={change}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Remote / City, Country" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Job Type</label>
              <select name="job_type" value={form.job_type} onChange={change}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                {['Full-time','Part-time','Contract','Internship'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Salary Range</label>
              <input name="salary_range" value={form.salary_range} onChange={change}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="e.g. ₹8-12 LPA" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Deadline</label>
              <input type="date" name="deadline" value={form.deadline} onChange={change}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Description</label>
            <textarea name="description" value={form.description} onChange={change} rows={4}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              placeholder="Role overview, responsibilities..." />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Requirements</label>
            <textarea name="requirements" value={form.requirements} onChange={change} rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              placeholder="Skills, experience, qualifications..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all disabled:opacity-60">
              {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Posting…</> : 'Post Job'}
            </button>
            <button type="button" onClick={onClose} className="px-6 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Job Detail Modal ─── */
function JobDetailModal({ job, onClose, canApply, onApply, applying }) {
  if (!job) return null;
  const typeColor = TYPE_COLORS[job.job_type] || 'bg-gray-100 text-gray-700 border-gray-200';
  const deadlineStr = job.deadline ? new Date(job.deadline).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : null;
  const isExpired = job.deadline && new Date(job.deadline) < new Date();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="font-bold text-gray-900 truncate pr-4">{job.title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition shrink-0"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">
          {/* Company info */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shrink-0 text-2xl font-extrabold text-indigo-600">
              {job.company?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
              <p className="text-gray-600 font-medium">{job.company}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {job.location && (
                  <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                    <MapPin className="w-3 h-3" />{job.location}
                  </span>
                )}
                {job.job_type && (
                  <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full border font-medium ${typeColor}`}>
                    {job.job_type}
                  </span>
                )}
                {job.salary_range && (
                  <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-100">
                    <DollarSign className="w-3 h-3" />{job.salary_range}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {deadlineStr && (
              <div className={`flex items-center gap-2 p-3 rounded-xl ${isExpired ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                <Calendar className="w-4 h-4 shrink-0" />
                <div>
                  <p className="text-xs font-medium opacity-70">Deadline</p>
                  <p className="text-sm font-bold">{deadlineStr} {isExpired && '(Expired)'}</p>
                </div>
              </div>
            )}
            {job.poster_id && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-50 text-indigo-700">
                <Building className="w-4 h-4 shrink-0" />
                <div>
                  <p className="text-xs font-medium opacity-70">Posted by</p>
                  <p className="text-sm font-bold">{job.poster_id?.name || 'Alumni'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {job.description && (
            <div className="mb-5">
              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-500" />About the Role</h4>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && (
            <div className="mb-6">
              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />Requirements</h4>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{job.requirements}</p>
            </div>
          )}

          {/* Actions */}
          {canApply && !isExpired && (
            <button onClick={onApply} disabled={applying}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all disabled:opacity-60 shadow-lg shadow-indigo-200">
              {applying ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Applying…</> : '🚀 Apply Now'}
            </button>
          )}
          {isExpired && <p className="text-center text-red-500 font-medium py-3 bg-red-50 rounded-xl">This job posting has expired</p>}
          {!canApply && !isExpired && <p className="text-center text-gray-400 text-sm py-2">Post a job from your dashboard to connect with students</p>}
        </div>
      </div>
    </div>
  );
}

/* ─── Main JobsList ─── */
export default function JobsList() {
  const { user } = useAuth();
  const [jobs, setJobs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [filterType, setFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [appliedIds, setAppliedIds] = useState(new Set());

  const fetchJobs = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await jobsAPI.getJobs();
      setJobs(res.data);
    } catch {
      setError('Failed to load jobs. Make sure the backend is running.');
    } finally { setLoading(false); }
  }, []);

  // Fetch applied job IDs so we can show "Applied" badge
  const fetchApplied = useCallback(async () => {
    if (user?.role !== 'student') return;
    try {
      const { applicationsAPI: api } = await import('../../services/api.jsx');
      const res = await api.getMyApplications();
      setAppliedIds(new Set(res.data.map(a => a.job_id?._id || a.job_id)));
    } catch { /* silent */ }
  }, [user]);

  useEffect(() => { fetchJobs(); fetchApplied(); }, [fetchJobs, fetchApplied]);

  const handleApply = async () => {
    if (!selectedJob) return;
    setApplying(true);
    try {
      await applicationsAPI.apply({ job_id: selectedJob._id });
      toast.success('✅ Application submitted!');
      setAppliedIds(prev => new Set([...prev, selectedJob._id]));
      setSelectedJob(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally { setApplying(false); }
  };

  const filtered = jobs.filter(job => {
    const q = search.toLowerCase();
    const matchSearch = !q || job.title?.toLowerCase().includes(q) || job.company?.toLowerCase().includes(q) || job.location?.toLowerCase().includes(q);
    const matchType = filterType === 'all' || job.job_type === filterType;
    return matchSearch && matchType;
  });

  const isAlumniOrAdmin = user?.role === 'alumni' || user?.role === 'admin';
  const isStudent = user?.role === 'student';

  const postedAt = (job) => {
    if (!job.created_at) return 'recently';
    const diff = Math.floor((Date.now() - new Date(job.created_at)) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return '1 day ago';
    return `${diff} days ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl p-8 mb-8 text-white bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 shadow-2xl">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">Job Board</h1>
              <p className="text-indigo-100 text-lg max-w-md">
                {isStudent ? 'Opportunities shared by your alumni network' : 'Share opportunities with students'}
              </p>
              <p className="text-indigo-200 text-sm mt-1">{jobs.length} active listings</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button onClick={fetchJobs} className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition backdrop-blur-sm" title="Refresh">
                <RefreshCw className="w-5 h-5" />
              </button>
              {isAlumniOrAdmin && (
                <button onClick={() => setShowPostModal(true)}
                  className="flex items-center gap-2 bg-white text-indigo-700 font-bold px-5 py-3 rounded-xl hover:bg-indigo-50 transition shadow-lg">
                  <Plus className="w-5 h-5" /> Post a Job
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3 shadow-sm border border-white">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text" placeholder="Search by title, company, location…"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm transition-all"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              className="pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm font-medium appearance-none cursor-pointer"
              value={filterType} onChange={e => setFilter(e.target.value)}>
              <option value="all">All Types</option>
              {['Full-time','Part-time','Contract','Internship'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* States */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader className="w-10 h-10 text-indigo-500 animate-spin mb-3" />
            <p className="text-gray-500 font-medium">Loading jobs…</p>
          </div>
        )}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-700 font-medium mb-3">{error}</p>
            <button onClick={fetchJobs} className="text-sm text-red-600 underline">Try again</button>
          </div>
        )}

        {/* Job Grid */}
        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
                <Briefcase className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No jobs found</h3>
                <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map(job => {
                  const typeColor = TYPE_COLORS[job.job_type] || 'bg-gray-100 text-gray-700 border-gray-200';
                  const isApplied = appliedIds.has(job._id);
                  const isExpired = job.deadline && new Date(job.deadline) < new Date();
                  return (
                    <div key={job._id}
                      className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
                      onClick={() => setSelectedJob(job)}>
                      {/* Company logo + title */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-xl font-extrabold text-indigo-600 shrink-0 group-hover:scale-105 transition-transform">
                          {job.company?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                          <p className="text-sm text-gray-500 truncate">{job.company}</p>
                        </div>
                        {isApplied && <span className="shrink-0 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Applied ✓</span>}
                        {isExpired && !isApplied && <span className="shrink-0 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Expired</span>}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.location && (
                          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                            <MapPin className="w-3 h-3" />{job.location}
                          </span>
                        )}
                        {job.job_type && (
                          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${typeColor}`}>{job.job_type}</span>
                        )}
                        {job.salary_range && (
                          <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
                            <DollarSign className="w-3 h-3" />{job.salary_range}
                          </span>
                        )}
                      </div>

                      {/* Description preview */}
                      {job.description && (
                        <p className="text-xs text-gray-400 line-clamp-2 mb-4 flex-1">{job.description}</p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />{postedAt(job)}
                        </span>
                        <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                          View Details <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          canApply={isStudent && !appliedIds.has(selectedJob._id)}
          onApply={handleApply}
          applying={applying}
        />
      )}
      {showPostModal && (
        <PostJobModal onClose={() => setShowPostModal(false)} onPosted={fetchJobs} />
      )}
    </div>
  );
}
