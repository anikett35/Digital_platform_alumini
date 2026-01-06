import { useEffect, useState } from "react";
import axios from "axios";

export default function RewardsDashboard() {
  const [rewards, setRewards] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/rewards/me")
      .then(res => setRewards(res.data));
  }, []);

  return (
    <div>
      <h2>My Rewards</h2>
      {rewards.map(r => (
        <p key={r._id}>{r.points} points - {r.earned_from}</p>
      ))}
    </div>
  );
}
