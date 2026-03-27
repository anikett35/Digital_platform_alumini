import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api.jsx';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, Clock, Users, RefreshCw } from 'lucide-react';

const STATUS_BADGE = {
  pending:  'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-700',
};

function NoteModal({ user, action, onClose, onConfirm }) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(user._id, action, note);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h3 className="font-bold text-gray-800 text-lg mb-1 flex items-center gap-2">
          {action === 'approve'
            ? <><CheckCircle className="w-5 h-5 text-green-600" /> Approve Registration</>
            : <><XCircle className="w-5 h-5 text-red-500" /> Reject Registration</>}
        </h3>
        <p className="text-sm text-gray-500 mb-1">
          <span className="font-semibold text-gray-700">{user.name}</span> — College ID: <span className="font-mono font-semibold">{user.collegeId}</span>
        </p>
        <p className="text-sm text-gray-500 mb-4">{user.department} · {user.role} · Grad {user.graduationYear || user.enrollmentYear}</p>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {action === 'approve' ? 'Welcome note (optional)' : 'Reason for rejection (shown to user, optional)'}
        </label>
        <textarea
          value={note} onChange={e => setNote(e.target.value)}
          rows={3} maxLength={500}
          placeholder={action === 'reject' ? 'e.g. College ID not found in records' : ''}
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:outline-none resize-none mb-4"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50">
            Back
          </button>
          <button onClick={handleConfirm} disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition ${
              action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'}`}>
            {loading ? 'Processing…' : action === 'approve' ? 'Approve' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminApprovalPage() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('pending');
  const [modal, setModal]       = useState(null); // { user, action }

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAllUsers({ status: filter, limit: 100 });
      setUsers(res.data.users);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleApproval = async (userId, action, note) => {
    try {
      await adminAPI.approveUser(userId, action, note);
      toast.success(`User ${action === 'approve' ? 'approved ✅' : 'rejected'} successfully`);
      setModal(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const counts = {
    pending:  users.filter(u => u.approvalStatus === 'pending').length,
    approved: users.filter(u => u.approvalStatus === 'approved').length,
    rejected: users.filter(u => u.approvalStatus === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {modal && (
        <NoteModal
          user={modal.user} action={modal.action}
          onClose={() => setModal(null)}
          onConfirm={handleApproval}
        />
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" /> User Approvals
            </h1>
            <p className="text-gray-500 text-sm mt-1">Review and approve/reject pending registrations</p>
          </div>
          <button onClick={fetchUsers} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Pending', key: 'pending', icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200' },
            { label: 'Approved', key: 'approved', icon: CheckCircle, color: 'text-green-600 bg-green-50 border-green-200' },
            { label: 'Rejected', key: 'rejected', icon: XCircle, color: 'text-red-500 bg-red-50 border-red-200' },
          ].map(({ label, key, icon: Icon, color }) => (
            <div key={key} className={`rounded-2xl border p-4 flex items-center gap-3 bg-white ${filter === key ? 'ring-2 ring-indigo-400' : ''}`}
              onClick={() => setFilter(key)} style={{ cursor: 'pointer' }}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{counts[key]}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {['pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium capitalize transition ${
                filter === s ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center text-gray-400">Loading…</div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center text-gray-400">
            No {filter} registrations found
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Name', 'Email', 'Role', 'College ID', 'Department', 'Year', 'Registered', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          u.role === 'alumni' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-700 text-xs">{u.collegeId || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{u.department}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{u.graduationYear || u.enrollmentYear || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_BADGE[u.approvalStatus] || ''}`}>
                          {u.approvalStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.approvalStatus === 'pending' ? (
                          <div className="flex gap-2">
                            <button onClick={() => setModal({ user: u, action: 'approve' })}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition">
                              ✓ Approve
                            </button>
                            <button onClick={() => setModal({ user: u, action: 'reject' })}
                              className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition">
                              ✕ Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">{u.approvalNote || '—'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
