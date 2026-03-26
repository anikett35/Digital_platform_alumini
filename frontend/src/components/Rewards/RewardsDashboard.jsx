import React, { useEffect, useState } from 'react';
import { rewardsAPI } from '../../services/api.jsx';
import { Star, Award, TrendingUp, Loader } from 'lucide-react';
import { toast } from 'react-toastify';

export default function RewardsDashboard() {
  const [data, setData] = useState({ rewards: [], totalPoints: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rewardsAPI.getMyRewards()
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load rewards'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-10"><Loader className="w-7 h-7 text-violet-600 animate-spin" /></div>;

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-5">
      <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-6 text-white flex items-center justify-between shadow-lg">
        <div><p className="text-violet-200 text-sm mb-1">Total Points</p><p className="text-5xl font-extrabold">{data.totalPoints}</p></div>
        <TrendingUp className="w-16 h-16 text-white/20" />
      </div>
      {data.rewards.length === 0 ? (
        <div className="card p-10 text-center"><Star className="w-10 h-10 text-gray-200 mx-auto mb-2" /><p className="text-gray-500 text-sm">No rewards yet. Start referring jobs!</p></div>
      ) : (
        <div className="space-y-2">
          {data.rewards.map(r => (
            <div key={r._id} className="card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3"><Star className="w-5 h-5 text-amber-400" /><span className="font-medium text-gray-800 text-sm">{r.earned_from}</span></div>
              <span className="font-bold text-violet-600">+{r.points} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
