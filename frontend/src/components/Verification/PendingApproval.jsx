import React, { useState, useEffect } from 'react';
import { verificationAPI } from '../../services/api.jsx';
import { Shield, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';

export default function PendingApproval() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verificationAPI.getMyStatus()
      .then(res => setStatus(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader className="w-8 h-8 text-violet-600 animate-spin" /></div>;

  const configs = {
    not_submitted: { icon: Shield,       color: 'bg-gray-100 text-gray-500',    title: 'Not Submitted',       msg: 'You haven\'t submitted a verification request yet.' },
    pending:       { icon: Clock,        color: 'bg-amber-100 text-amber-600',  title: 'Under Review',        msg: 'Your request is being reviewed by our admin team. This usually takes 1-2 business days.' },
    approved:      { icon: CheckCircle,  color: 'bg-emerald-100 text-emerald-600', title: 'Verified! ✓',      msg: 'Congratulations! Your alumni status is verified. Your profile now shows the verified badge.' },
    rejected:      { icon: XCircle,      color: 'bg-red-100 text-red-600',      title: 'Request Rejected',    msg: 'Your verification was rejected. Please review the admin notes and resubmit.' },
  };

  const s = status?.status || 'not_submitted';
  const cfg = configs[s] || configs.not_submitted;
  const Icon = cfg.icon;

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 ${cfg.color}`}>
        <Icon className="w-10 h-10" />
      </div>
      <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">{cfg.title}</h1>
      <p className="text-gray-500 leading-relaxed mb-6">{cfg.msg}</p>
      {status?.adminNotes && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-left mb-6">
          <p className="text-xs font-bold text-amber-800 mb-1">Admin Notes:</p>
          <p className="text-sm text-amber-700">{status.adminNotes}</p>
        </div>
      )}
      {(s === 'not_submitted' || s === 'rejected') && (
        <a href="/verify" className="btn-primary inline-flex"><Shield className="w-4 h-4" />{s === 'rejected' ? 'Resubmit Request' : 'Submit Request'}</a>
      )}
    </div>
  );
}
