import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api.jsx';
import { toast } from 'react-toastify';
import { Settings, Lock, Bell, Shield, Save, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const changePassword = async e => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Min 6 characters'); return; }
    setLoading(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="page-header">
        <div className="flex items-center gap-2 mb-1"><Settings className="w-5 h-5" /><h1 className="text-xl font-bold">Settings</h1></div>
        <p className="text-violet-100 text-sm">Manage your account preferences</p>
      </div>

      {/* Account Info */}
      <div className="card p-6">
        <h2 className="section-title flex items-center gap-2"><Shield className="w-4 h-4 text-violet-600" />Account Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', value: user?.name },
            { label: 'Email',     value: user?.email },
            { label: 'Role',      value: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '' },
            { label: 'Department',value: user?.department },
          ].map(f => (
            <div key={f.label} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-0.5">{f.label}</p>
              <p className="font-semibold text-gray-900 text-sm">{f.value || '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Change Password */}
      <div className="card p-6">
        <h2 className="section-title flex items-center gap-2"><Lock className="w-4 h-4 text-violet-600" />Change Password</h2>
        <form onSubmit={changePassword} className="space-y-4">
          {[
            { key: 'currentPassword', label: 'Current Password' },
            { key: 'newPassword',     label: 'New Password (min 6 chars)' },
            { key: 'confirmPassword', label: 'Confirm New Password' },
          ].map(f => (
            <div key={f.key}>
              <label className="label">{f.label}</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={pwForm[f.key]}
                  onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="input pr-10" required />
                {f.key === 'newPassword' && (
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving…' : <><Save className="w-4 h-4" />Update Password</>}
          </button>
        </form>
      </div>

      {/* Notifications placeholder */}
      <div className="card p-6">
        <h2 className="section-title flex items-center gap-2"><Bell className="w-4 h-4 text-violet-600" />Notification Preferences</h2>
        <div className="space-y-3">
          {['Email notifications for meetings', 'Email notifications for job applications', 'Community post alerts'].map(pref => (
            <label key={pref} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 cursor-pointer">
              <span className="text-sm text-gray-700">{pref}</span>
              <div className="w-10 h-5 bg-violet-600 rounded-full relative">
                <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm" />
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
