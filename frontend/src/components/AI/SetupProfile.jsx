import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api.jsx';
import { toast } from 'react-toastify';
import { User, Briefcase, Code, Target, Save, Loader, Plus, X, BookOpen, Globe, Linkedin, Github } from 'lucide-react';

const SKILLS_SUGGESTIONS = ['React','Node.js','Python','JavaScript','Java','C++','Machine Learning','Data Science','Cloud Computing','DevOps','UI/UX','Product Management'];
const INDUSTRIES = ['Technology','Finance','Healthcare','Education','E-commerce','Consulting','Manufacturing','Media','Government','Startup'];

function TagInput({ tags, onAdd, onRemove, placeholder, suggestions = [] }) {
  const [input, setInput] = useState('');
  const [showSugg, setShowSugg] = useState(false);
  const filtered = suggestions.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s));

  const add = (val) => {
    const v = val.trim();
    if (v && !tags.includes(v)) { onAdd(v); }
    setInput(''); setShowSugg(false);
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1.5 p-2 border border-gray-200 rounded-xl min-h-[44px] bg-white focus-within:ring-2 focus-within:ring-violet-500 focus-within:border-transparent">
        {tags.map(t => (
          <span key={t} className="inline-flex items-center gap-1 bg-violet-100 text-violet-700 text-xs font-medium px-2 py-1 rounded-lg">
            {t}
            <button type="button" onClick={() => onRemove(t)} className="hover:text-violet-900"><X className="w-3 h-3" /></button>
          </span>
        ))}
        <input value={input} onChange={e => { setInput(e.target.value); setShowSugg(true); }}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(input); } }}
          className="flex-1 min-w-20 outline-none text-sm placeholder-gray-400 bg-transparent"
          placeholder={tags.length === 0 ? placeholder : ''} />
      </div>
      {showSugg && input && filtered.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
          {filtered.slice(0, 6).map(s => (
            <button key={s} type="button" onClick={() => add(s)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-violet-50 hover:text-violet-700 transition-colors">{s}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SetupProfile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    bio: '', profileHeadline: '', location: '', phoneNumber: '',
    skills: [], interests: [], mentorshipAreas: [], careerGoals: [],
    linkedinUrl: '', githubUrl: '', website: '',
    currentCompany: '', currentPosition: '', industry: '',
    isOpenToMentorship: false, lookingForMentor: false,
  });
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    userAPI.getMe().then(res => {
      const u = res.data.user;
      setForm(f => ({
        ...f,
        bio:              u.bio || '',
        profileHeadline:  u.profileHeadline || '',
        location:         u.location || '',
        phoneNumber:      u.phoneNumber || '',
        skills:           u.skills || [],
        interests:        u.interests || [],
        mentorshipAreas:  u.mentorshipAreas || [],
        careerGoals:      u.careerGoals || [],
        linkedinUrl:      u.linkedinUrl || '',
        githubUrl:        u.githubUrl || '',
        website:          u.website || '',
        currentCompany:   u.currentCompany || '',
        currentPosition:  u.currentPosition || '',
        industry:         u.industry || '',
        isOpenToMentorship: u.isOpenToMentorship || false,
        lookingForMentor:   u.lookingForMentor || false,
      }));
    }).catch(() => {}).finally(() => setFetching(false));
  }, []);

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const addTag    = (key, val) => setForm(f => ({ ...f, [key]: [...f[key], val] }));
  const removeTag = (key, val) => setForm(f => ({ ...f, [key]: f[key].filter(t => t !== val) }));

  const save = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await userAPI.updateProfile(form);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    finally { setLoading(false); }
  };

  if (fetching) return <div className="flex justify-center py-20"><Loader className="w-8 h-8 text-violet-600 animate-spin" /></div>;

  const Section = ({ icon: Icon, title, children }) => (
    <div className="card p-6 space-y-4">
      <h2 className="section-title flex items-center gap-2 mb-0"><Icon className="w-4 h-4 text-violet-600" />{title}</h2>
      {children}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Edit Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Keep your profile updated to get the best from AlumniConnect</p>
      </div>

      <form onSubmit={save} className="space-y-5">
        <Section icon={User} title="Basic Information">
          <div>
            <label className="label">Profile Headline</label>
            <input name="profileHeadline" value={form.profileHeadline} onChange={change} className="input" placeholder="e.g. Software Engineer at Google | CS '22" />
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea name="bio" value={form.bio} onChange={change} rows={3} className="input resize-none" placeholder="Tell your story…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Location</label><input name="location" value={form.location} onChange={change} className="input" placeholder="City, Country" /></div>
            <div><label className="label">Phone</label><input name="phoneNumber" value={form.phoneNumber} onChange={change} className="input" placeholder="+91 …" /></div>
          </div>
        </Section>

        {(user?.role === 'alumni') && (
          <Section icon={Briefcase} title="Professional Info">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Current Position</label><input name="currentPosition" value={form.currentPosition} onChange={change} className="input" placeholder="e.g. Software Engineer" /></div>
              <div><label className="label">Company</label><input name="currentCompany" value={form.currentCompany} onChange={change} className="input" placeholder="e.g. Google" /></div>
            </div>
            <div>
              <label className="label">Industry</label>
              <select name="industry" value={form.industry} onChange={change} className="input">
                <option value="">Select industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </Section>
        )}

        <Section icon={Code} title="Skills & Interests">
          <div>
            <label className="label">Skills</label>
            <TagInput tags={form.skills} onAdd={v => addTag('skills', v)} onRemove={v => removeTag('skills', v)} placeholder="Add skills (press Enter)…" suggestions={SKILLS_SUGGESTIONS} />
          </div>
          <div>
            <label className="label">Interests</label>
            <TagInput tags={form.interests} onAdd={v => addTag('interests', v)} onRemove={v => removeTag('interests', v)} placeholder="Add interests…" />
          </div>
        </Section>

        <Section icon={Target} title="Mentorship">
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:border-violet-200 transition-all">
              <input type="checkbox" name="isOpenToMentorship" checked={form.isOpenToMentorship} onChange={change} className="w-4 h-4 accent-violet-600" />
              <div>
                <p className="font-semibold text-sm text-gray-900">Open to Mentoring</p>
                <p className="text-xs text-gray-500">Students can request sessions with you</p>
              </div>
            </label>
            {user?.role === 'student' && (
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:border-violet-200 transition-all">
                <input type="checkbox" name="lookingForMentor" checked={form.lookingForMentor} onChange={change} className="w-4 h-4 accent-violet-600" />
                <div>
                  <p className="font-semibold text-sm text-gray-900">Looking for a Mentor</p>
                  <p className="text-xs text-gray-500">Appear in mentor matching results</p>
                </div>
              </label>
            )}
          </div>
          {form.isOpenToMentorship && (
            <div>
              <label className="label">Mentorship Areas</label>
              <TagInput tags={form.mentorshipAreas} onAdd={v => addTag('mentorshipAreas', v)} onRemove={v => removeTag('mentorshipAreas', v)} placeholder="e.g. Career Guidance, Resume Review…" />
            </div>
          )}
        </Section>

        <Section icon={Globe} title="Social Links">
          <div className="space-y-3">
            <div className="relative"><Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" /><input name="linkedinUrl" value={form.linkedinUrl} onChange={change} className="input pl-9" placeholder="linkedin.com/in/yourhandle" /></div>
            <div className="relative"><Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" /><input name="githubUrl" value={form.githubUrl} onChange={change} className="input pl-9" placeholder="github.com/yourhandle" /></div>
            <div className="relative"><Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" /><input name="website" value={form.website} onChange={change} className="input pl-9" placeholder="yourwebsite.com" /></div>
          </div>
        </Section>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
          {loading ? <><Loader className="w-4 h-4 animate-spin" />Saving…</> : <><Save className="w-4 h-4" />Save Profile</>}
        </button>
      </form>
    </div>
  );
}
