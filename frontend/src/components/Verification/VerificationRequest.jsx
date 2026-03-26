import React, { useState } from 'react';
import { verificationAPI } from '../../services/api.jsx';
import { toast } from 'react-toastify';
import { Shield, Plus, Trash2, CheckCircle, Loader } from 'lucide-react';

const DEPTS = ['Computer Science','Information Technology','Electronics & Communication','Mechanical Engineering','Civil Engineering','Electrical Engineering','Chemical Engineering','Biotechnology','Business Administration','Other'];
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({length:30},(_,i)=>THIS_YEAR-i);

const EMPTY = { name:'', department:'', yearFrom:'', yearTo:'', degreeType:'', collegeCode:'' };

export default function VerificationRequest({ onSubmitted }) {
  const [institutions, setInstitutions] = useState([{...EMPTY}]);
  const [loading, setLoading] = useState(false);

  const update = (i, k, v) => setInstitutions(prev => prev.map((inst,idx) => idx===i ? {...inst,[k]:v} : inst));
  const add    = () => setInstitutions(p => [...p, {...EMPTY}]);
  const remove = (i) => setInstitutions(p => p.filter((_,idx)=>idx!==i));

  const submit = async e => {
    e.preventDefault();
    if (institutions.some(i => !i.name || !i.department)) { toast.error('Fill in name and department for all institutions'); return; }
    setLoading(true);
    try {
      await verificationAPI.submitRequest(institutions);
      toast.success('✅ Verification request submitted! Admin will review shortly.');
      onSubmitted?.();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="page-header mb-6">
        <div className="flex items-center gap-2 mb-1"><Shield className="w-5 h-5" /><h1 className="text-xl font-bold">Alumni Verification</h1></div>
        <p className="text-violet-100 text-sm">Submit your academic credentials for verification</p>
      </div>

      <div className="card p-6 mb-5">
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <Shield className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-blue-900 text-sm">Why verify?</p>
            <p className="text-blue-700 text-xs mt-1">Verified alumni get a badge on their profile, appear in mentor search, and can post jobs. Admin reviews typically take 1-2 business days.</p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {institutions.map((inst, i) => (
          <div key={i} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Institution {i + 1}</h3>
              {institutions.length > 1 && (
                <button type="button" onClick={() => remove(i)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2"><label className="label">Institution Name *</label><input value={inst.name} onChange={e => update(i,'name',e.target.value)} className="input" placeholder="e.g. IIT Bombay" required /></div>
              <div>
                <label className="label">Department *</label>
                <select value={inst.department} onChange={e => update(i,'department',e.target.value)} className="input" required>
                  <option value="">Select</option>
                  {DEPTS.map(d=><option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div><label className="label">Degree Type</label><input value={inst.degreeType} onChange={e=>update(i,'degreeType',e.target.value)} className="input" placeholder="e.g. B.Tech, M.Tech" /></div>
              <div>
                <label className="label">Year From</label>
                <select value={inst.yearFrom} onChange={e=>update(i,'yearFrom',e.target.value)} className="input">
                  <option value="">Select</option>
                  {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Year To</label>
                <select value={inst.yearTo} onChange={e=>update(i,'yearTo',e.target.value)} className="input">
                  <option value="">Select</option>
                  {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2"><label className="label">College/Roll Number</label><input value={inst.collegeCode} onChange={e=>update(i,'collegeCode',e.target.value)} className="input" placeholder="Optional" /></div>
            </div>
          </div>
        ))}

        <button type="button" onClick={add} className="btn-secondary w-full">
          <Plus className="w-4 h-4" /> Add Another Institution
        </button>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
          {loading ? <><Loader className="w-4 h-4 animate-spin" />Submitting…</> : <><CheckCircle className="w-4 h-4" />Submit for Verification</>}
        </button>
      </form>
    </div>
  );
}
