import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, GraduationCap, Phone, Building, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const DEPARTMENTS = [
  'Computer Science', 'Information Technology', 'Electronics & Communication',
  'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering',
  'Chemical Engineering', 'Biotechnology', 'Business Administration', 'Other'
];

const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => THIS_YEAR - i);

const inputBase =
  'w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition';

const Field = ({ label, icon: Icon, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />}
      {React.cloneElement(children, {
        className: `${inputBase} ${Icon ? 'pl-9' : 'pl-3'} pr-3`
      })}
    </div>
  </div>
);

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '',
    // FIXED: field is 'phoneNumber' to match backend User model (was 'mobileNumber' — caused phone to never save)
    phoneNumber: '',
    password: '', confirmPassword: '',
    role: 'student', department: '',
    studentId: '', currentYear: '', enrollmentYear: '',
    graduationYear: '', currentCompany: '', currentPosition: ''
  });
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);

  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); if (error) clearError(); };
  const change = e => set(e.target.name, e.target.value);

  const roleChange = r => setForm(f => ({
    ...f, role: r,
    studentId: '', currentYear: '', enrollmentYear: '',
    graduationYear: '', currentCompany: '', currentPosition: ''
  }));

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.department) {
      toast.error('Please fill in all required fields'); return false;
    }
    // FIXED: backend accepts min 6 chars — align frontend to match so registration doesn't break
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters'); return false;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match'); return false;
    }
    if (form.role === 'student' && (!form.currentYear || !form.enrollmentYear)) {
      toast.error('Please fill in your current year and enrollment year'); return false;
    }
    if (form.role === 'alumni' && !form.graduationYear) {
      toast.error('Please select your graduation year'); return false;
    }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    // FIXED: send 'phoneNumber' (backend field name), not 'mobileNumber'
    // FIXED: removed 'batchYear' — not in backend schema
    const payload = {
      name:        form.name.trim(),
      email:       form.email.trim(),
      phoneNumber: form.phoneNumber,   // ← was 'mobileNumber' — backend ignored it
      password:    form.password,
      role:        form.role,
      department:  form.department,
      studentId:   form.studentId || undefined,
    };

    if (form.role === 'student') {
      payload.currentYear    = +form.currentYear;
      payload.enrollmentYear = +form.enrollmentYear;
    } else {
      payload.graduationYear  = +form.graduationYear;
      payload.currentCompany  = form.currentCompany  || undefined;
      payload.currentPosition = form.currentPosition || undefined;
    }

    try {
      const result = await register(payload);
      if (result.success) {
        toast.success('🎉 Welcome aboard! Account created.');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Registration failed. Please try again.');
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 p-7">

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-sm text-gray-500 mt-1">Join your alumni network</p>
          </div>

          {/* Server error banner */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a…</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { v: 'student', label: 'Student',  Icon: User          },
                  { v: 'alumni',  label: 'Alumni',   Icon: GraduationCap }
                ].map(({ v, label, Icon }) => (
                  <button key={v} type="button" onClick={() => roleChange(v)}
                    className={`flex flex-col items-center py-3 rounded-xl border-2 text-sm font-semibold transition-all
                      ${form.role === v
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md'
                        : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}>
                    <Icon className="w-5 h-5 mb-1" />{label}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <Field label="Full Name *" icon={User}>
              <input name="name" value={form.name} onChange={change} placeholder="Your full name" required />
            </Field>

            {/* Email + Phone */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email *" icon={Mail}>
                <input name="email" type="email" value={form.email} onChange={change} placeholder="you@example.com" required />
              </Field>
              {/* FIXED: field name is now 'phoneNumber' matching backend */}
              <Field label="Mobile" icon={Phone}>
                <input name="phoneNumber" type="tel" value={form.phoneNumber} onChange={change} placeholder="+91 ..." />
              </Field>
            </div>

            {/* Password + Confirm */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPwd ? 'text' : 'password'} name="password" value={form.password} onChange={change}
                    className={`${inputBase} pl-9 pr-9`} placeholder="Min 6 chars" required />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={change}
                    className={`${inputBase} pl-9 pr-9`} placeholder="Repeat password" required />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
              <select name="department" value={form.department} onChange={change}
                className={`${inputBase} pl-3`} required>
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Student-specific fields */}
            {form.role === 'student' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Year *</label>
                  <select name="currentYear" value={form.currentYear} onChange={change}
                    className={`${inputBase} pl-3`} required>
                    <option value="">Select</option>
                    {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Year *</label>
                  <select name="enrollmentYear" value={form.enrollmentYear} onChange={change}
                    className={`${inputBase} pl-3`} required>
                    <option value="">Select</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Alumni-specific fields */}
            {form.role === 'alumni' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year *</label>
                    <select name="graduationYear" value={form.graduationYear} onChange={change}
                      className={`${inputBase} pl-3`} required>
                      <option value="">Select</option>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                    <input name="studentId" value={form.studentId} onChange={change}
                      className={`${inputBase} pl-3`} placeholder="Optional" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Current Company" icon={Building}>
                    <input name="currentCompany" value={form.currentCompany} onChange={change} placeholder="e.g. Google" />
                  </Field>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Position</label>
                    <input name="currentPosition" value={form.currentPosition} onChange={change}
                      className={`${inputBase} pl-3`} placeholder="e.g. Engineer" />
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating…</>
                : 'Create Account'}
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
