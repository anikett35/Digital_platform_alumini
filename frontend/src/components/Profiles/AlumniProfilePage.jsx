import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { profilesAPI, meetingsAPI } from '../../services/api.jsx';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { MapPin, Briefcase, Globe, Linkedin, Github, Star, ArrowLeft, Video, Send, X, Loader } from 'lucide-react';

function RequestModal({ alumni, onClose }) {
  const [form, setForm] = useState({ topic: 'Career Guidance', message: '', duration: 30, type: 'one-on-one' });
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!form.message.trim()) { toast.error('Write a message'); return; }
    setLoading(true);
    try {
      await meetingsAPI.requestMeeting({ alumniId: alumni._id, ...form });
      toast.success('🎉 Meeting request sent!');
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-md">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="font-bold text-gray-900 flex items-center gap-2"><Video className="w-5 h-5 text-violet-600" />Request Session</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-xl">
            <div className="w-10 h-10 avatar text-sm shrink-0">{alumni.name?.charAt(0)}</div>
            <div><p className="font-bold text-violet-900 text-sm">{alumni.name}</p><p className="text-xs text-violet-600">{alumni.currentPosition}</p></div>
          </div>
          <div>
            <label className="label">Topic</label>
            <select value={form.topic} onChange={e => setForm(f => ({...f, topic: e.target.value}))} className="input">
              {['Career Guidance','Resume Review','Interview Prep','Technical Skills','Industry Insights','Networking','Other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Message *</label>
            <textarea value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))}
              className="input resize-none" rows={3} placeholder="Introduce yourself and what you'd like to discuss…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Duration</label>
              <select value={form.duration} onChange={e => setForm(f => ({...f, duration: +e.target.value}))} className="input">
                {[15,30,45,60].map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
            <div>
              <label className="label">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} className="input">
                <option value="one-on-one">1-on-1</option>
                <option value="workshop">Workshop</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={send} disabled={loading} className="btn-primary flex-1">
              {loading ? 'Sending…' : <><Send className="w-4 h-4" />Send Request</>}
            </button>
            <button onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AlumniProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [alumni,  setAlumni]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReq, setShowReq] = useState(false);

  useEffect(() => {
    profilesAPI.getAlumniProfile(id)
      .then(res => setAlumni(res.data))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader className="w-8 h-8 text-violet-600 animate-spin" /></div>;
  if (!alumni)  return <div className="text-center py-20"><p className="text-gray-500">Profile not found</p></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Link to="/alumni-directory" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-violet-600 font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Directory
      </Link>

      {/* Profile Header */}
      <div className="card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="w-24 h-24 avatar text-3xl shrink-0 self-start">{alumni.name?.charAt(0)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-display font-bold text-gray-900">{alumni.name}</h1>
                <p className="text-gray-600 font-medium mt-0.5">{alumni.currentPosition}{alumni.currentCompany ? ` @ ${alumni.currentCompany}` : ''}</p>
                <p className="text-sm text-gray-400 mt-1">{alumni.department} · Class of {alumni.graduationYear}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {alumni.isOpenToMentorship && <span className="badge-green"><Star className="w-3 h-3" />Open to Mentor</span>}
                {alumni.isVerifiedAlumni    && <span className="badge-violet">✓ Verified</span>}
              </div>
            </div>

            {alumni.bio && <p className="text-gray-600 text-sm leading-relaxed mt-3 max-w-2xl">{alumni.bio}</p>}

            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              {alumni.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-violet-400" />{alumni.location}</span>}
              {alumni.industry  && <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-violet-400" />{alumni.industry}</span>}
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {alumni.linkedinUrl && <a href={alumni.linkedinUrl} target="_blank" rel="noreferrer" className="btn-secondary py-1.5 px-3 text-xs"><Linkedin className="w-3.5 h-3.5" />LinkedIn</a>}
              {alumni.githubUrl   && <a href={alumni.githubUrl}   target="_blank" rel="noreferrer" className="btn-secondary py-1.5 px-3 text-xs"><Github className="w-3.5 h-3.5" />GitHub</a>}
              {alumni.website     && <a href={alumni.website}     target="_blank" rel="noreferrer" className="btn-secondary py-1.5 px-3 text-xs"><Globe className="w-3.5 h-3.5" />Website</a>}
            </div>
          </div>
        </div>

        {user?.role === 'student' && alumni.isOpenToMentorship && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <button onClick={() => setShowReq(true)} className="btn-primary">
              <Video className="w-4 h-4" /> Request Mentorship Session
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills */}
        {alumni.skills?.length > 0 && (
          <div className="card p-6">
            <h2 className="section-title">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {alumni.skills.map((s, i) => <span key={i} className="text-sm bg-violet-50 text-violet-700 px-3 py-1 rounded-full border border-violet-100 font-medium">{s}</span>)}
            </div>
          </div>
        )}

        {/* Work Experience */}
        {alumni.workExperience?.length > 0 && (
          <div className="card p-6">
            <h2 className="section-title">Work Experience</h2>
            <div className="space-y-4">
              {alumni.workExperience.map((w, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">{w.company?.charAt(0)}</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{w.position}</p>
                    <p className="text-xs text-gray-500">{w.company}{w.location ? ` · ${w.location}` : ''}</p>
                    <p className="text-xs text-gray-400">{new Date(w.startDate).getFullYear()} — {w.currentlyWorking ? 'Present' : w.endDate ? new Date(w.endDate).getFullYear() : ''}</p>
                    {w.description && <p className="text-xs text-gray-600 mt-1 leading-relaxed">{w.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mentorship areas */}
        {alumni.mentorshipAreas?.length > 0 && (
          <div className="card p-6">
            <h2 className="section-title">Mentorship Areas</h2>
            <div className="flex flex-wrap gap-2">
              {alumni.mentorshipAreas.map((a, i) => <span key={i} className="badge-green">{a}</span>)}
            </div>
          </div>
        )}

        {/* Education */}
        {alumni.education?.length > 0 && (
          <div className="card p-6">
            <h2 className="section-title">Education</h2>
            <div className="space-y-3">
              {alumni.education.map((e, i) => (
                <div key={i}>
                  <p className="font-semibold text-gray-900 text-sm">{e.institution}</p>
                  <p className="text-xs text-gray-500">{e.degree}{e.fieldOfStudy ? ` in ${e.fieldOfStudy}` : ''}</p>
                  {(e.startYear || e.endYear) && <p className="text-xs text-gray-400">{e.startYear} — {e.endYear}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showReq && <RequestModal alumni={alumni} onClose={() => setShowReq(false)} />}
    </div>
  );
}
