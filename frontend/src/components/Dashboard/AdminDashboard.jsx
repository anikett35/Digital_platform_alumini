import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, eventsAPI } from '../../services/api.jsx';
import { toast } from 'react-toastify';
import UsersManagement from './UsersManagement';
import AnalyticsDashboard from './AnalyticsDashboard';
import EventsPage from '../Events/EventsPage';
import MessagingPage from '../Messaging/MessagingPage';
import SettingsPage from './SettingsPage';
import {
  Users, Calendar, BarChart3, Settings, MessageSquare,
  Shield, TrendingUp, Activity, UserCheck, AlertCircle
} from 'lucide-react';

const tabs = [
  { id: 'dashboard', label: 'Overview',  icon: Activity },
  { id: 'users',     label: 'Users',     icon: Users },
  { id: 'events',    label: 'Events',    icon: Calendar },
  { id: 'messages',  label: 'Messages',  icon: MessageSquare },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings',  label: 'Settings',  icon: Settings },
];

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

function Overview({ stats, loading }) {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3 mb-1">
          <Shield className="w-6 h-6" />
          <h1 className="text-xl font-bold">Admin Overview</h1>
        </div>
        <p className="text-violet-100 text-sm">Manage the AlumniConnect platform</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}     label="Total Users"    value={loading ? '…' : stats.totalUsers}    color="bg-blue-100 text-blue-600" />
        <StatCard icon={UserCheck} label="Alumni"         value={loading ? '…' : stats.totalAlumni}   color="bg-violet-100 text-violet-600" />
        <StatCard icon={Users}     label="Students"       value={loading ? '…' : stats.totalStudents} color="bg-emerald-100 text-emerald-600" />
        <StatCard icon={Activity}  label="Active Users"   value={loading ? '…' : stats.activeUsers}   color="bg-amber-100 text-amber-600" />
      </div>

      <div className="card p-6">
        <h2 className="section-title">Platform Health</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <p className="text-sm font-bold text-emerald-800">API Status</p>
            </div>
            <p className="text-xs text-emerald-600">All systems operational</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <p className="text-sm font-bold text-blue-800">Database</p>
            </div>
            <p className="text-xs text-blue-600">MongoDB connected</p>
          </div>
          <div className="p-4 bg-violet-50 rounded-xl border border-violet-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-violet-500" />
              <p className="text-sm font-bold text-violet-800">Real-time</p>
            </div>
            <p className="text-xs text-violet-600">Socket.IO active</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="section-title">Quick Admin Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Manage Users',    desc: 'View, activate, or deactivate accounts', icon: Users,     color: 'bg-blue-100 text-blue-600',    tab: 'users' },
            { label: 'Manage Events',   desc: 'Create and manage campus events',        icon: Calendar,  color: 'bg-emerald-100 text-emerald-600', tab: 'events' },
            { label: 'View Analytics',  desc: 'Platform usage and engagement stats',   icon: BarChart3, color: 'bg-violet-100 text-violet-600', tab: 'analytics' },
          ].map(a => (
            <div key={a.tab} className="p-4 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50 transition-all cursor-pointer">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${a.color}`}>
                <a.icon className="w-5 h-5" />
              </div>
              <p className="font-bold text-sm text-gray-900">{a.label}</p>
              <p className="text-xs text-gray-500 mt-1">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats]         = useState({ totalUsers: 0, totalAlumni: 0, totalStudents: 0, activeUsers: 0 });
  const [loading, setLoading]     = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authAPI.getAllUsers({});
      const users = res.data.users || [];
      setStats({
        totalUsers:    users.length,
        totalAlumni:   users.filter(u => u.role === 'alumni').length,
        totalStudents: users.filter(u => u.role === 'student').length,
        activeUsers:   users.filter(u => u.isActive).length,
      });
    } catch { toast.error('Failed to load stats'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Overview stats={stats} loading={loading} />;
      case 'users':     return <UsersManagement />;
      case 'events':    return <EventsPage />;
      case 'messages':  return <MessagingPage />;
      case 'analytics': return <AnalyticsDashboard />;
      case 'settings':  return <SettingsPage />;
      default:          return <Overview stats={stats} loading={loading} />;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static top-16 left-0 h-[calc(100vh-64px)] lg:h-auto w-60 bg-white border-r border-gray-100 z-40 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:flex flex-col shrink-0`}>
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Admin badge */}
          <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-xl border border-rose-100 mb-4">
            <div className="w-9 h-9 avatar text-sm">{user?.name?.charAt(0)}</div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-xs truncate">{user?.name}</p>
              <span className="text-xs font-semibold text-rose-600 flex items-center gap-1"><Shield className="w-3 h-3" />Admin</span>
            </div>
          </div>

          <nav className="space-y-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => { setActiveTab(t.id); setSidebarOpen(false); }}
                className={`sidebar-item w-full ${activeTab === t.id ? 'sidebar-item-active' : 'sidebar-item-inactive'}`}>
                <t.icon className="w-4 h-4 shrink-0" />
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-auto">
        {/* Mobile sidebar toggle */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden mb-4 btn-secondary">
          <span className="text-sm">☰ Menu</span>
        </button>
        {renderContent()}
      </main>
    </div>
  );
}
