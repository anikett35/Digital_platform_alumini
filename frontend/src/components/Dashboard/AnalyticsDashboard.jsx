import React, { useState, useEffect } from 'react';
import { authAPI, postsAPI, eventsAPI } from '../../services/api.jsx';
import { BarChart3, Users, FileText, Calendar, TrendingUp, UserCheck } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, postsRes] = await Promise.allSettled([
          authAPI.getAllUsers({ limit: 500 }),
          postsAPI.getAllPosts(),
        ]);
        const users = usersRes.status === 'fulfilled' ? (usersRes.value.data.users || []) : [];
        const posts = postsRes.status === 'fulfilled' ? (postsRes.value.data.posts || postsRes.value.data || []) : [];
        setStats({
          total: users.length,
          students: users.filter(u => u.role === 'student').length,
          alumni: users.filter(u => u.role === 'alumni').length,
          active: users.filter(u => u.isActive).length,
          posts: Array.isArray(posts) ? posts.length : 0,
          verified: users.filter(u => u.isVerifiedAlumni).length,
        });
      } catch { setStats(null); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const metrics = stats ? [
    { label: 'Total Users',    value: stats.total,    icon: Users,     color: 'bg-blue-100 text-blue-600' },
    { label: 'Students',       value: stats.students,  icon: Users,     color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Alumni',         value: stats.alumni,    icon: UserCheck, color: 'bg-violet-100 text-violet-600' },
    { label: 'Active Accounts',value: stats.active,    icon: TrendingUp,color: 'bg-amber-100 text-amber-600' },
    { label: 'Feed Posts',     value: stats.posts,     icon: FileText,  color: 'bg-pink-100 text-pink-600' },
    { label: 'Verified Alumni',value: stats.verified,  icon: UserCheck, color: 'bg-teal-100 text-teal-600' },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-2 mb-1"><BarChart3 className="w-5 h-5" /><h1 className="text-xl font-bold">Platform Analytics</h1></div>
        <p className="text-violet-100 text-sm">Real-time usage statistics</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-24 card animate-pulse" />)}
        </div>
      ) : stats === null ? (
        <div className="card p-12 text-center">
          <BarChart3 className="w-10 h-10 text-gray-200 mx-auto mb-2" />
          <p className="text-gray-500">Failed to load analytics</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map(m => (
              <div key={m.label} className="card p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${m.color}`}>
                  <m.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{m.value}</p>
                  <p className="text-sm text-gray-500">{m.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Engagement breakdown */}
          <div className="card p-6">
            <h2 className="section-title">User Breakdown</h2>
            <div className="space-y-3">
              {[
                { label: 'Students', value: stats.students, total: stats.total, color: 'bg-emerald-500' },
                { label: 'Alumni',   value: stats.alumni,  total: stats.total, color: 'bg-violet-500' },
                { label: 'Active',   value: stats.active,  total: stats.total, color: 'bg-amber-500' },
              ].map(r => {
                const pct = stats.total > 0 ? Math.round((r.value / r.total) * 100) : 0;
                return (
                  <div key={r.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-gray-700">{r.label}</span>
                      <span className="text-gray-500">{r.value} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`${r.color} h-2 rounded-full transition-all duration-700`} style={{width:`${pct}%`}} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
