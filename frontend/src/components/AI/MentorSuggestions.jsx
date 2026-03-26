import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { aiMatchingAPI, meetingsAPI } from '../../services/api.jsx';
import { toast } from 'react-toastify';
import { Brain, Star, Users, Video, Send, X, Loader, ArrowRight, Sparkles } from 'lucide-react';

function RequestModal({ mentor, onClose }) {
  const [form, setForm] = useState({ topic: 'Career Guidance', message: '', duration: 30 });
  const [loading, setLoading] = useState(false);
  const send = async () => {
    if (!form.message.trim()) { toast.error('Write a message'); return; }
    setLoading(true);
    try {
      await meetingsAPI.requestMeeting({ alumniId: mentor._id, ...form, type: 'one-on-one' });
      toast.success('🎉 Request sent!'); onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };
  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-md">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="font-bold text-gray-900">Request Session</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-xl">
            <div className="w-10 h-10 avatar text-sm">{mentor.name?.charAt(0)}</div>
            <div><p className="font-bold text-violet-900 text-sm">{mentor.name}</p><p className="text-xs text-violet-600">{mentor.currentPosition}</p></div>
          </div>
          <div><label className="label">Topic</label><select value={form.topic} onChange={e => setForm(f=>({...f,topic:e.target.value}))} className="input">{['Career Guidance','Resume Review','Interview Prep','Technical Skills','Industry Insights','Other'].map(t=><option key={t}>{t}</option>)}</select></div>
          <div><label className="label">Message *</label><textarea value={form.message} onChange={e => setForm(f=>({...f,message:e.target.value}))} className="input resize-none" rows={3} placeholder="Introduce yourself and what you'd like to discuss…" /></div>
          <div><label className="label">Duration</label><select value={form.duration} onChange={e => setForm(f=>({...f,duration:+e.target.value}))} className="input">{[15,30,45,60].map(d=><option key={d} value={d}>{d} min</option>)}</select></div>
          <div className="flex gap-3"><button onClick={send} disabled={loading} className="btn-primary flex-1">{loading?'Sending…':<><Send className="w-4 h-4"/>Send</>}</button><button onClick={onClose} className="btn-secondary">Cancel</button></div>
        </div>
      </div>
    </div>
  );
}

export default function MentorSuggestions() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    aiMatchingAPI.getSuggestions()
      .then(res => setMentors(res.data?.suggestions || res.data || []))
      .catch(() => toast.error('Failed to load suggestions'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-2 mb-1"><Brain className="w-5 h-5" /><h1 className="text-xl font-bold">AI Mentor Suggestions</h1></div>
        <p className="text-violet-100 text-sm">Personalized alumni matches based on your profile and goals</p>
      </div>
      {loading ? (
        <div className="flex justify-center py-20"><Loader className="w-8 h-8 text-violet-600 animate-spin" /></div>
      ) : mentors.length === 0 ? (
        <div className="card p-16 text-center">
          <Sparkles className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 mb-2">No suggestions yet</h3>
          <p className="text-gray-500 text-sm mb-5">Complete your profile with skills and career goals to get AI-matched mentors</p>
          <Link to="/setup-profile" className="btn-primary">Complete Profile</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {mentors.map(m => (
            <div key={m._id} className="card-hover p-5 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 avatar text-lg shrink-0">{m.name?.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{m.name}</p>
                  <p className="text-sm text-gray-500 truncate">{m.currentPosition}{m.currentCompany ? ` @ ${m.currentCompany}` : ''}</p>
                  {m.matchScore && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 fill-emerald-500" />{m.matchScore}% match
                    </span>
                  )}
                </div>
              </div>
              {m.bio && <p className="text-xs text-gray-500 line-clamp-2">{m.bio}</p>}
              {m.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {m.skills.slice(0,4).map((s,i) => <span key={i} className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full border border-violet-100">{s}</span>)}
                </div>
              )}
              <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
                <button onClick={() => setSelected(m)} className="btn-primary flex-1 text-xs py-2">
                  <Video className="w-3.5 h-3.5" /> Request
                </button>
                <Link to={`/alumni/${m._id}`} className="btn-secondary text-xs py-2 px-3">Profile</Link>
              </div>
            </div>
          ))}
        </div>
      )}
      {selected && <RequestModal mentor={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
