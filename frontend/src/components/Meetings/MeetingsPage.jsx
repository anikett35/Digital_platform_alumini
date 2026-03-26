import React, { useState, useEffect, useCallback } from 'react';
import { meetingsAPI, profilesAPI } from '../../services/api.jsx';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
  Video, Calendar, Clock, CheckCircle, XCircle, ExternalLink,
  Search, Send, ChevronDown, ChevronUp, Users, Plus, X, Loader,
  RefreshCw, MessageSquare, Award
} from 'lucide-react';

const STATUS_BADGE = {
  pending:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  accepted:  'bg-green-100  text-green-700  border-green-200',
  rejected:  'bg-red-100    text-red-600    border-red-200',
  completed: 'bg-gray-100   text-gray-600   border-gray-200',
  cancelled: 'bg-gray-100   text-gray-500   border-gray-200',
};

const TOPICS = [
  'Career Guidance', 'Resume Review', 'Interview Prep',
  'Technical Skills', 'Industry Insights', 'Networking',
  'Project Advice', 'Higher Studies', 'Other'
];

/* ─── Request Meeting Modal (student) ─── */
function RequestModal({ onClose, onRequested }) {
  const [alumni, setAlumni]     = useState([]);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [sending, setSending]   = useState(false);
  const [form, setForm] = useState({
    topic: 'Career Guidance', message: '',
    scheduledAt: '', duration: 30, type: 'one-on-one'
  });

  const searchAlumni = useCallback(async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const res = await profilesAPI.getAlumniProfiles({ search, limit: 10 });
      setAlumni(res.data || []);
    } catch { toast.error('Search failed'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => { if (search.trim()) searchAlumni(); else setAlumni([]); }, 400);
    return () => clearTimeout(t);
  }, [search, searchAlumni]);

  const send = async () => {
    if (!selected) { toast.error('Select an alumni'); return; }
    if (!form.topic) { toast.error('Select a topic'); return; }
    if (!form.message.trim()) { toast.error('Write a message'); return; }
    setSending(true);
    try {
      await meetingsAPI.requestMeeting({ alumniId: selected._id, ...form });
      toast.success('🎉 Meeting request sent!');
      onRequested();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally { setSending(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Video className="w-5 h-5 text-indigo-600" /> Request a Session
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5">

          {/* Search alumni */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Find an Alumni *</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Search by name or department…" />
            </div>
            {loading && <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Loader className="w-3 h-3 animate-spin" />Searching…</p>}
            {alumni.length > 0 && !selected && (
              <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {alumni.map(a => (
                  <button key={a._id} onClick={() => { setSelected(a); setAlumni([]); setSearch(a.name); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition text-left border-b border-gray-100 last:border-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {a.name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{a.name}</p>
                      <p className="text-xs text-gray-500 truncate">{a.currentPosition} {a.currentCompany ? `@ ${a.currentCompany}` : ''}</p>
                    </div>
                    {a.isOpenToMentorship && <span className="ml-auto shrink-0 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Open to mentor</span>}
                  </button>
                ))}
              </div>
            )}
            {selected && (
              <div className="mt-2 flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {selected.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-indigo-900">{selected.name}</p>
                  <p className="text-xs text-indigo-600">{selected.currentPosition} {selected.currentCompany ? `@ ${selected.currentCompany}` : ''}</p>
                </div>
                <button onClick={() => { setSelected(null); setSearch(''); }} className="p-1 hover:bg-indigo-100 rounded-lg">
                  <X className="w-4 h-4 text-indigo-500" />
                </button>
              </div>
            )}
          </div>

          {/* Topic */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Topic *</label>
            <select value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Message *</label>
            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Introduce yourself and explain what you'd like to discuss…" />
          </div>

          {/* Duration + Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Duration (min)</label>
              <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                {[15, 30, 45, 60, 90].map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Session Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="one-on-one">1-on-1</option>
                <option value="workshop">Workshop</option>
              </select>
            </div>
          </div>

          {/* Preferred time */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Preferred Date & Time (optional)</label>
            <input type="datetime-local" value={form.scheduledAt}
              onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={send} disabled={sending}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all disabled:opacity-60">
              {sending ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending…</> : <><Send className="w-4 h-4" />Send Request</>}
            </button>
            <button onClick={onClose} className="px-5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Accept Modal (alumni) ─── */
function AcceptModal({ meetingId, onClose, onAccepted }) {
  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoading] = useState(false);

  const accept = async () => {
    setLoading(true);
    try {
      await meetingsAPI.acceptMeeting(meetingId, scheduledAt || undefined);
      toast.success('✅ Meeting accepted! Google Meet link sent via email.');
      onAccepted();
      onClose();
    } catch { toast.error('Failed to accept'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2"><Calendar className="w-5 h-5 text-green-600" />Schedule Meeting</h3>
        <p className="text-sm text-gray-500 mb-4">Pick a time — a Google Meet link will be auto-generated and emailed to both parties.</p>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Date & Time</label>
        <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
        <div className="flex gap-2">
          <button onClick={accept} disabled={loading}
            className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Accept & Send Link
          </button>
          <button onClick={onClose} className="px-4 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Reject Modal ─── */
function RejectModal({ meetingId, onClose, onRejected }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const reject = async () => {
    setLoading(true);
    try {
      await meetingsAPI.rejectMeeting(meetingId, reason);
      toast.success('Meeting request rejected.');
      onRejected();
      onClose();
    } catch { toast.error('Failed to reject'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2"><XCircle className="w-5 h-5 text-red-500" />Reject Request</h3>
        <p className="text-sm text-gray-500 mb-4">Optionally let the student know why.</p>
        <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mb-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
          placeholder="Reason (optional)" />
        <div className="flex gap-2">
          <button onClick={reject} disabled={loading}
            className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <XCircle className="w-4 h-4" />}
            Reject
          </button>
          <button onClick={onClose} className="px-4 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Meeting Card ─── */
function MeetingCard({ m, user, onAccept, onReject, onComplete }) {
  const [expanded, setExpanded] = useState(false);
  const other = user?.role === 'student' ? m.alumni : m.student;
  const badgeClass = STATUS_BADGE[m.status] || STATUS_BADGE.cancelled;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {other?.name?.charAt(0) || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-bold text-gray-900">{other?.name || 'Unknown'}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${badgeClass}`}>{m.status}</span>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">{m.type?.replace('-',' ')}</span>
            </div>
            <p className="text-xs text-gray-500">{other?.currentPosition}{other?.currentCompany ? ` @ ${other.currentCompany}` : ''}</p>
            <p className="text-sm text-gray-800 font-medium mt-2">📌 {m.topic}</p>

            {m.scheduledAt && (
              <p className="text-xs text-indigo-600 mt-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(m.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                {m.duration && <span className="text-gray-400">· {m.duration} min</span>}
              </p>
            )}

            {m.meetingLink && m.status === 'accepted' && (
              <a href={m.meetingLink} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 text-xs bg-green-600 text-white px-3 py-1.5 rounded-full hover:bg-green-700 transition font-semibold">
                <Video className="w-3.5 h-3.5" /> Join Google Meet <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Alumni actions */}
          {user?.role === 'alumni' && m.status === 'pending' && (
            <div className="flex flex-col gap-2 shrink-0">
              <button onClick={() => onAccept(m._id)}
                className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-2 rounded-xl hover:bg-green-700 transition font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />Accept
              </button>
              <button onClick={() => onReject(m._id)}
                className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-3 py-2 rounded-xl hover:bg-red-100 transition font-semibold">
                <XCircle className="w-3.5 h-3.5" />Reject
              </button>
            </div>
          )}
          {m.status === 'accepted' && (
            <button onClick={() => onComplete(m._id)}
              className="text-xs text-gray-500 border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 shrink-0 transition">
              Mark Done
            </button>
          )}

          <button onClick={() => setExpanded(!expanded)} className="p-1 text-gray-400 hover:text-gray-600 shrink-0">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {expanded && m.message && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />Message</p>
            <p className="text-sm text-gray-700 leading-relaxed">{m.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function MeetingsPage() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('pending');
  const [showRequest, setShowRequest] = useState(false);
  const [acceptId, setAcceptId] = useState(null);
  const [rejectId, setRejectId] = useState(null);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await meetingsAPI.getMyMeetings();
      setMeetings(res.data);
    } catch { toast.error('Failed to load meetings'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMeetings(); }, [fetchMeetings]);

  const handleComplete = async (id) => {
    try {
      await meetingsAPI.completeMeeting(id);
      toast.success('Marked as completed!');
      fetchMeetings();
    } catch { toast.error('Failed'); }
  };

  const TABS = ['pending','accepted','completed','rejected','all'];
  const filtered = tab === 'all' ? meetings : meetings.filter(m => m.status === tab);

  const counts = TABS.reduce((acc, t) => {
    acc[t] = t === 'all' ? meetings.length : meetings.filter(m => m.status === t).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30 pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-8">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 text-white mb-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
                <Video className="w-6 h-6" /> Mentorship Sessions
              </h1>
              <p className="text-indigo-100 text-sm">
                {user?.role === 'student'
                  ? 'Request and track your mentorship sessions'
                  : 'Manage incoming mentorship requests from students'}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={fetchMeetings} className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition" title="Refresh">
                <RefreshCw className="w-4 h-4" />
              </button>
              {user?.role === 'student' && (
                <button onClick={() => setShowRequest(true)}
                  className="flex items-center gap-2 bg-white text-indigo-700 font-bold px-4 py-2.5 rounded-xl hover:bg-indigo-50 transition shadow-lg text-sm">
                  <Plus className="w-4 h-4" /> Request Session
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mt-5">
            {[
              { label: 'Pending',   key: 'pending',   color: 'bg-yellow-400/20' },
              { label: 'Accepted',  key: 'accepted',  color: 'bg-green-400/20'  },
              { label: 'Completed', key: 'completed', color: 'bg-blue-400/20'   },
              { label: 'Total',     key: 'all',       color: 'bg-white/20'      },
            ].map(s => (
              <div key={s.key} className={`${s.color} rounded-xl p-3 text-center`}>
                <p className="text-2xl font-extrabold">{counts[s.key]}</p>
                <p className="text-xs text-indigo-100">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition ${tab === t ? 'bg-white text-indigo-700' : 'bg-white/20 hover:bg-white/30'}`}>
                {t} {t !== 'all' && counts[t] > 0 && `(${counts[t]})`}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader className="w-8 h-8 text-indigo-500 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No {tab === 'all' ? '' : tab} meetings</p>
            {user?.role === 'student' && tab === 'pending' && (
              <button onClick={() => setShowRequest(true)}
                className="mt-4 inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
                <Plus className="w-4 h-4" /> Request your first session
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(m => (
              <MeetingCard key={m._id} m={m} user={user}
                onAccept={id => setAcceptId(id)}
                onReject={id => setRejectId(id)}
                onComplete={handleComplete} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showRequest && <RequestModal onClose={() => setShowRequest(false)} onRequested={fetchMeetings} />}
      {acceptId && <AcceptModal meetingId={acceptId} onClose={() => setAcceptId(null)} onAccepted={fetchMeetings} />}
      {rejectId && <RejectModal meetingId={rejectId} onClose={() => setRejectId(null)} onRejected={fetchMeetings} />}
    </div>
  );
}
