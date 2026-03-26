import React, { useEffect, useState } from 'react';
import { applicationsAPI } from '../../services/api.jsx';
import { Briefcase, Clock, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import { toast } from 'react-toastify';

const STATUS = {
  Pending:  { icon: Clock,        cls: 'badge-amber'  },
  Reviewed: { icon: AlertCircle,  cls: 'badge-blue'   },
  Hired:    { icon: CheckCircle,  cls: 'badge-green'  },
  Rejected: { icon: XCircle,      cls: 'badge-red'    },
};

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationsAPI.getMyApplications()
      .then(res => setApps(res.data || []))
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-10"><Loader className="w-7 h-7 text-violet-600 animate-spin" /></div>;

  if (apps.length === 0) return (
    <div className="card p-12 text-center">
      <Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-2" />
      <p className="text-gray-500 font-medium">No applications yet</p>
      <p className="text-gray-400 text-xs mt-1">Browse jobs and apply to track here</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {apps.map(app => {
        const s = app.status || 'Pending';
        const cfg = STATUS[s] || STATUS.Pending;
        const Icon = cfg.icon;
        const job = app.job_id;
        return (
          <div key={app._id} className="card p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center text-lg font-bold text-violet-700 shrink-0">{job?.company?.charAt(0) || '?'}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{job?.title || 'Job'}</p>
              <p className="text-sm text-gray-500 truncate">{job?.company}{job?.location ? ` · ${job.location}` : ''}</p>
            </div>
            <span className={`${cfg.cls} shrink-0 flex items-center gap-1`}><Icon className="w-3 h-3" />{s}</span>
          </div>
        );
      })}
    </div>
  );
}
