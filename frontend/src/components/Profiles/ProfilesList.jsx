import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { profilesAPI } from '../../services/api.jsx';
import { toast } from 'react-toastify';
import { Search, Filter, Users, MapPin, Briefcase, Star, Loader, RefreshCw, ArrowRight } from 'lucide-react';

const DEPARTMENTS = [
  'All','Computer Science','Information Technology','Electronics & Communication',
  'Mechanical Engineering','Civil Engineering','Electrical Engineering',
  'Chemical Engineering','Biotechnology','Business Administration',
];

function AlumniCard({ alumni }) {
  return (
    <Link to={`/alumni/${alumni._id}`} className="card-hover p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 avatar text-lg shrink-0">{alumni.name?.charAt(0)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-gray-900 truncate">{alumni.name}</h3>
            {alumni.isOpenToMentorship && (
              <span className="badge-green shrink-0 text-xs"><Star className="w-3 h-3" />Mentor</span>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">{alumni.currentPosition || 'Alumni'}{alumni.currentCompany ? ` @ ${alumni.currentCompany}` : ''}</p>
          <p className="text-xs text-gray-400 mt-0.5">{alumni.department} · Class of {alumni.graduationYear}</p>
        </div>
      </div>
      {alumni.bio && <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{alumni.bio}</p>}
      {alumni.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {alumni.skills.slice(0, 4).map((s, i) => (
            <span key={i} className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full border border-violet-100">{s}</span>
          ))}
          {alumni.skills.length > 4 && <span className="text-xs text-gray-400">+{alumni.skills.length - 4}</span>}
        </div>
      )}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {alumni.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{alumni.location}</span>}
          {alumni.industry  && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{alumni.industry}</span>}
        </div>
        <span className="text-xs text-violet-600 font-semibold flex items-center gap-1">View <ArrowRight className="w-3 h-3" /></span>
      </div>
    </Link>
  );
}

export default function ProfilesList() {
  const [alumni,   setAlumni]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [dept,     setDept]     = useState('All');
  const [mentor,   setMentor]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search;
      if (dept !== 'All') params.department = dept;
      if (mentor) params.isOpenToMentorship = true;
      const res = await profilesAPI.getAlumniProfiles(params);
      setAlumni(res.data || []);
    } catch { toast.error('Failed to load alumni'); }
    finally { setLoading(false); }
  }, [search, dept, mentor]);

  useEffect(() => {
    const t = setTimeout(load, 400);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-2 mb-1"><Users className="w-5 h-5" /><h1 className="text-xl font-bold">Alumni Directory</h1></div>
        <p className="text-violet-100 text-sm">{alumni.length} alumni found</p>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-9" placeholder="Search by name, skills, company…" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select value={dept} onChange={e => setDept(e.target.value)} className="input pl-9 pr-8 w-full sm:w-52">
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:border-violet-300 transition-all shrink-0">
          <input type="checkbox" checked={mentor} onChange={e => setMentor(e.target.checked)} className="w-4 h-4 accent-violet-600" />
          <span className="text-sm font-medium text-gray-700">Open to mentor</span>
        </label>
        <button onClick={load} className="btn-secondary shrink-0 p-2.5"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader className="w-8 h-8 text-violet-600 animate-spin" /></div>
      ) : alumni.length === 0 ? (
        <div className="card p-16 text-center">
          <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No alumni found</p>
          <p className="text-gray-400 text-sm mt-1">Try different search filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {alumni.map(a => <AlumniCard key={a._id} alumni={a} />)}
        </div>
      )}
    </div>
  );
}
