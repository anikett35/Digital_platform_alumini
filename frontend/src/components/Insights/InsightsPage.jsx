import React, { useState, useEffect, useCallback } from 'react';
import { insightsAPI, meetingsAPI } from '../../services/api.jsx';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
  TrendingUp, Users, Briefcase, Award, BarChart2,
  Search, Loader, ChevronRight, Video, X, Send, Star, RefreshCw
} from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science', 'Information Technology', 'Electronics & Communication',
  'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering',
  'Chemical Engineering', 'Biotechnology', 'Business Administration'
];

/* ─── Quick Request Modal ─── */
function QuickRequestModal({ alumni, onClose }) {
  const [form, setForm] = useState({ topic: 'Career Guidance', message: '', duration: 30 });
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!form.message.trim()) { toast.error('Please write a message'); return; }
    setLoading(true);
    try {
      await meetingsAPI.requestMeeting({ alumniId: alumni._id, ...form, type: 'one-on-one' });
      toast.success('🎉 Meeting request sent!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Video className="w-5 h-5 text-indigo-600" /> Request Session
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100 mb-5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold shrink-0">
            {alumni.name?.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-indigo-900 text-sm">{alumni.name}</p>
            <p className="text-xs text-indigo-600">{alumni.currentPosition} {alumni.currentCompany ? `@ ${alumni.currentCompany}` : ''}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Topic</label>
            <select value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              {['Career Guidance','Resume Review','Interview Prep','Technical Skills','Industry Insights','Networking','Other'].map(t =>
                <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Message</label>
            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Introduce yourself and explain what you'd like to discuss…" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Duration</label>
            <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              {[15,30,45,60].map(d => <option key={d} value={d}>{d} minutes</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={send} disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 hover:-translate-y-0.5 transition-all">
              {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
              Send Request
            </button>
            <button onClick={onClose} className="px-4 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Alumni Card ─── */
function AlumniCard({ a, isStudent, onRequest }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all group">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg shrink-0 group-hover:scale-105 transition-transform">
          {a.name?.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 truncate">{a.name}</h3>
              <p className="text-sm text-gray-500 truncate">{a.currentPosition}{a.currentCompany ? ` @ ${a.currentCompany}` : ''}</p>
              <p className="text-xs text-gray-400 mt-0.5">{a.department} · Class of {a.graduationYear}</p>
            </div>
            {a.isOpenToMentorship && (
              <span className="shrink-0 inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium border border-green-200">
                <Star className="w-3 h-3 fill-green-500" /> Mentor
              </span>
            )}
          </div>
        </div>
      </div>

      {a.bio && <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{a.bio}</p>}

      {a.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {a.skills.slice(0, 5).map((s, i) => (
            <span key={i} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-100">{s}</span>
          ))}
          {a.skills.length > 5 && <span className="text-xs text-gray-400">+{a.skills.length - 5} more</span>}
        </div>
      )}

      {isStudent && a.isOpenToMentorship && (
        <button onClick={() => onRequest(a)}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-xl text-xs font-bold hover:opacity-90 transition shadow-sm">
          <Video className="w-3.5 h-3.5" /> Request Session
        </button>
      )}
    </div>
  );
}

/* ─── Skill Bar ─── */
function SkillBar({ skill, count, max }) {
  const pct = Math.max((count / max) * 100, 6);
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-32 truncate shrink-0">{skill}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-6 text-right shrink-0">{count}</span>
    </div>
  );
}

/* ─── Main Page ─── */
export default function InsightsPage() {
  const { user } = useAuth();
  const [dept, setDept]           = useState('Computer Science');
  const [insights, setInsights]   = useState(null);
  const [alumni, setAlumni]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [searchSpec, setSearchSpec]     = useState('');
  const [searchCompany, setSearchCompany] = useState('');
  const [gradYear, setGradYear]   = useState('');
  const [tab, setTab]             = useState('insights');
  const [requestAlumni, setRequestAlumni] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchInsights = useCallback(async (d) => {
    setLoading(true);
    try {
      const res = await insightsAPI.getDepartmentInsights(d);
      setInsights(res.data);
    } catch { toast.error('Failed to load insights'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchInsights(dept); }, [dept, fetchInsights]);

  const doSearch = async () => {
    setLoading(true); setHasSearched(true);
    try {
      const res = await insightsAPI.searchAlumni({
        department: dept,
        specialization: searchSpec || undefined,
        company: searchCompany || undefined,
        gradYear: gradYear || undefined,
      });
      setAlumni(res.data);
      setTab('alumni');
    } catch { toast.error('Search failed'); }
    finally { setLoading(false); }
  };

  const isStudent = user?.role === 'student';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30 pb-20">
      <div className="max-w-6xl mx-auto px-4 pt-8 space-y-6">

        {/* Hero */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-6 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
                <TrendingUp className="w-6 h-6" /> Career Insights
              </h1>
              <p className="text-purple-100 text-sm">Explore alumni career trends, top skills, and find mentors</p>
            </div>
            <button onClick={() => fetchInsights(dept)} className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Quick stats */}
          {insights && (
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="bg-white/20 rounded-xl p-3 text-center">
                <p className="text-2xl font-extrabold">{insights.totalAlumni}</p>
                <p className="text-xs text-purple-100">Alumni</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3 text-center">
                <p className="text-2xl font-extrabold">{insights.topSkills?.length}</p>
                <p className="text-xs text-purple-100">Top Skills</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3 text-center">
                <p className="text-2xl font-extrabold">{insights.topCompanies?.length}</p>
                <p className="text-xs text-purple-100">Companies</p>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Filter & Search</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Department</label>
              <select value={dept} onChange={e => setDept(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Specialization</label>
              <input value={searchSpec} onChange={e => setSearchSpec(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="e.g. AI, Cloud, Cybersecurity" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Company</label>
              <input value={searchCompany} onChange={e => setSearchCompany(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="e.g. Google, TCS, Infosys" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Graduation Year</label>
              <input type="number" value={gradYear} onChange={e => setGradYear(e.target.value)} min="2000" max="2030"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="e.g. 2022" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button onClick={doSearch} disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:-translate-y-0.5 transition-all disabled:opacity-60 shadow-sm">
              <Search className="w-4 h-4" /> Find Alumni
            </button>
            <div className="flex gap-2">
              {['insights', 'alumni'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === t ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                  {t === 'insights' ? '📊 Analytics' : `👥 Alumni${alumni.length > 0 ? ` (${alumni.length})` : ''}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-10"><Loader className="w-8 h-8 text-purple-500 animate-spin" /></div>
        )}

        {/* Insights Tab */}
        {tab === 'insights' && insights && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Total alumni banner */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-5">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center shrink-0">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <p className="text-4xl font-extrabold text-gray-900">{insights.totalAlumni}</p>
                <p className="text-gray-500 font-medium">Alumni in <span className="text-purple-600 font-bold">{insights.department}</span></p>
              </div>
            </div>

            {/* Top Skills */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-500" /> Top Skills
              </h3>
              {insights.topSkills.length === 0
                ? <p className="text-sm text-gray-400">No skill data yet</p>
                : <div className="space-y-3">
                    {insights.topSkills.map((s, i) => (
                      <SkillBar key={i} skill={s.skill} count={s.count} max={insights.topSkills[0]?.count || 1} />
                    ))}
                  </div>}
            </div>

            {/* Top Companies */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-500" /> Top Companies
              </h3>
              {insights.topCompanies.length === 0
                ? <p className="text-sm text-gray-400">No company data yet</p>
                : <div className="space-y-2">
                    {insights.topCompanies.map((c, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-300 w-5">{i + 1}</span>
                          <span className="text-sm text-gray-700 font-medium">{c.company}</span>
                        </div>
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium border border-blue-100">{c.count} alumni</span>
                      </div>
                    ))}
                  </div>}
            </div>

            {/* Top Roles */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-green-500" /> Common Roles
              </h3>
              {insights.topRoles.length === 0
                ? <p className="text-sm text-gray-400">No role data yet</p>
                : <div className="space-y-2">
                    {insights.topRoles.map((r, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-300 w-5">{i + 1}</span>
                          <span className="text-sm text-gray-700 font-medium">{r.role}</span>
                        </div>
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium border border-green-100">{r.count}</span>
                      </div>
                    ))}
                  </div>}
            </div>
          </div>
        )}

        {/* Alumni Tab */}
        {tab === 'alumni' && !loading && (
          <>
            {!hasSearched ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Use the filters above to find alumni</p>
              </div>
            ) : alumni.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No alumni found — try different filters</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500">{alumni.length} alumni found</p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {alumni.map(a => (
                    <AlumniCard key={a._id} a={a} isStudent={isStudent} onRequest={setRequestAlumni} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Quick request modal */}
      {requestAlumni && <QuickRequestModal alumni={requestAlumni} onClose={() => setRequestAlumni(null)} />}
    </div>
  );
}
