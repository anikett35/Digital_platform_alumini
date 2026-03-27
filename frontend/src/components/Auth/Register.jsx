import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DEPARTMENTS = [
  'Computer Science', 'Information Technology', 'Electronics & Communication',
  'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering',
  'Chemical Engineering', 'Biotechnology', 'Business Administration', 'Other'
];

const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => THIS_YEAR - i);
const FUTURE_YEARS = Array.from({ length: 6 }, (_, i) => THIS_YEAR + 5 - i);

const inputBase =
  'w-full bg-gray-50 border rounded-xl py-2.5 px-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition';

const errClass = 'border-red-400 bg-red-50 focus:ring-red-400';
const okClass  = 'border-gray-200';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'student', collegeId: '', department: '', graduationYear: '',
    currentYear: '', enrollmentYear: '',
  });
  const [errors, setErrors]       = useState({});
  const [showPwd, setShowPwd]     = useState(false);
  const [showCfm, setShowCfm]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => { const n = { ...e }; delete n[k]; return n; });
    setServerError('');
  };

  const roleChange = r => setForm(f => ({
    ...f, role: r,
    graduationYear: '', currentYear: '', enrollmentYear: '',
  }));

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      e.name = 'Name must be at least 2 characters';
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email))
      e.email = 'Enter a valid email address';
    if (!form.password || form.password.length < 6)
      e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match';
    if (!form.collegeId.trim() || !/^[A-Za-z0-9\-_]{3,20}$/.test(form.collegeId))
      e.collegeId = 'College ID: 3–20 alphanumeric characters (hyphens/underscores ok)';
    if (!form.department)
      e.department = 'Please select your department';
    if (form.role === 'student') {
      if (!form.currentYear) e.currentYear = 'Required';
      if (!form.enrollmentYear) e.enrollmentYear = 'Required';
    }
    if (form.role === 'alumni') {
      if (!form.graduationYear) e.graduationYear = 'Required';
      else if (parseInt(form.graduationYear) > THIS_YEAR)
        e.graduationYear = 'Alumni graduation year cannot be in the future';
    }
    return e;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const ev = validate();
    if (Object.keys(ev).length) { setErrors(ev); return; }

    setLoading(true);
    setServerError('');
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        role: form.role,
        collegeId: form.collegeId.toUpperCase().trim(),
        department: form.department,
      };
      if (form.role === 'student') {
        payload.currentYear    = parseInt(form.currentYear);
        payload.enrollmentYear = parseInt(form.enrollmentYear);
      } else {
        payload.graduationYear = parseInt(form.graduationYear);
      }

      await axios.post(`${API_URL}/api/auth/register`, payload);
      setSubmitted(true);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success / Pending screen ──────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-white/60 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Submitted!</h2>
          <p className="text-gray-600 mb-5 text-sm leading-relaxed">
            Your account is <span className="font-semibold text-amber-600">pending admin approval</span>.
            The admin will verify your College ID and activate your account. This usually takes 1–2 business days.
          </p>
          <div className="bg-indigo-50 rounded-xl p-4 text-sm text-indigo-700 mb-6 text-left space-y-1.5">
            <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" />College ID recorded for verification</p>
            <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500 shrink-0" />Admin will review and approve</p>
            <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />You can log in after approval</p>
          </div>
          <Link to="/login"
            className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const ic = (field) => `${inputBase} ${errors[field] ? errClass : okClass}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 p-7">

          {/* Header */}
          <div className="text-center mb-5">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-sm text-gray-500 mt-1">Join your alumni network — pending admin approval</p>
          </div>

          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />{serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a…</label>
              <div className="grid grid-cols-2 gap-3">
                {[{v:'student',label:'🎓 Student'},{v:'alumni',label:'🏢 Alumni'}].map(({v,label}) => (
                  <button key={v} type="button" onClick={() => roleChange(v)}
                    className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition ${
                      form.role === v ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="Your full name" maxLength={50} className={ic('name')} />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="you@example.com" className={ic('email')} />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* College ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                College ID / Enrollment Number *
              </label>
              <input value={form.collegeId} onChange={e => set('collegeId', e.target.value)}
                placeholder="e.g. CS2021001 or 21IT045" maxLength={20} className={ic('collegeId')} />
              {errors.collegeId
                ? <p className="mt-1 text-xs text-red-600">{errors.collegeId}</p>
                : <p className="mt-1 text-xs text-gray-400">Used by admin to verify your identity</p>}
            </div>

            {/* Department + Year side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <select value={form.department} onChange={e => set('department', e.target.value)}
                  className={ic('department')}>
                  <option value="">Select...</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.department && <p className="mt-1 text-xs text-red-600">{errors.department}</p>}
              </div>

              {form.role === 'student' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Year *</label>
                  <select value={form.currentYear} onChange={e => set('currentYear', e.target.value)}
                    className={ic('currentYear')}>
                    <option value="">Select</option>
                    {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                  {errors.currentYear && <p className="mt-1 text-xs text-red-600">{errors.currentYear}</p>}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year *</label>
                  <select value={form.graduationYear} onChange={e => set('graduationYear', e.target.value)}
                    className={ic('graduationYear')}>
                    <option value="">Select</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  {errors.graduationYear && <p className="mt-1 text-xs text-red-600">{errors.graduationYear}</p>}
                </div>
              )}
            </div>

            {/* Student enrollment year */}
            {form.role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Year *</label>
                <select value={form.enrollmentYear} onChange={e => set('enrollmentYear', e.target.value)}
                  className={ic('enrollmentYear')}>
                  <option value="">Select</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                {errors.enrollmentYear && <p className="mt-1 text-xs text-red-600">{errors.enrollmentYear}</p>}
              </div>
            )}

            {/* Password */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="Min 6 chars" className={`${ic('password')} pr-9`} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm *</label>
                <div className="relative">
                  <input type={showCfm ? 'text' : 'password'} value={form.confirmPassword}
                    onChange={e => set('confirmPassword', e.target.value)}
                    placeholder="Repeat password" className={`${ic('confirmPassword')} pr-9`} />
                  <button type="button" onClick={() => setShowCfm(!showCfm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showCfm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Info box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex gap-2">
              <Clock className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Your College ID will be verified by admin before your account is activated. This typically takes 1–2 business days.</span>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting…</>
                : 'Submit Registration'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
