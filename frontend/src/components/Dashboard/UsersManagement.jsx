import React, { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../../services/api.jsx';
import { toast } from 'react-toastify';
import { Users, Search, UserCheck, UserX, Trash2, RefreshCw, Filter } from 'lucide-react';

const ROLE_BADGE = { student: 'badge-blue', alumni: 'badge-violet', admin: 'badge-red' };

export default function UsersManagement() {
  const [users,    setUsers]    = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [roleFilter, setRole]   = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authAPI.getAllUsers({ limit: 200 });
      setUsers(res.data.users || []);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let list = users;
    if (roleFilter !== 'all') list = list.filter(u => u.role === roleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.department?.toLowerCase().includes(q));
    }
    setFiltered(list);
  }, [users, search, roleFilter]);

  const toggleStatus = async (userId) => {
    try {
      await authAPI.toggleUserStatus(userId);
      toast.success('User status updated');
      load();
    } catch { toast.error('Failed to update status'); }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await authAPI.deleteUser(userId);
      toast.success('User deleted');
      load();
    } catch { toast.error('Failed to delete user'); }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-2 mb-1"><Users className="w-5 h-5" /><h1 className="text-xl font-bold">User Management</h1></div>
        <p className="text-violet-100 text-sm">{users.length} total users registered</p>
      </div>

      {/* Search + Filter */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" placeholder="Search by name, email, department…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select className="input pl-9 pr-8 w-full sm:w-36" value={roleFilter} onChange={e => setRole(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="alumni">Alumni</option>
            <option value="admin">Admins</option>
          </select>
        </div>
        <button onClick={load} className="btn-secondary shrink-0"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center"><Users className="w-10 h-10 text-gray-200 mx-auto mb-2" /><p className="text-gray-500">No users found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['User','Role','Department','Status','Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 avatar text-sm shrink-0">{u.name?.charAt(0)}</div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{u.name}</p>
                          <p className="text-xs text-gray-500 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={ROLE_BADGE[u.role] || 'badge-gray'}>{u.role}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-600 text-xs">{u.department || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={u.isActive ? 'badge-green' : 'badge-red'}>{u.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleStatus(u._id)} title={u.isActive ? 'Deactivate' : 'Activate'}
                          className={`p-2 rounded-lg transition-all ${u.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>
                          {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button onClick={() => deleteUser(u._id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500">{filtered.length} of {users.length} users shown</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
