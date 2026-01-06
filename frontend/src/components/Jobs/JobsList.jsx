import { useEffect, useState } from "react";
import axios from "axios";

export default function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/jobs")
      .then((res) => {
        setJobs(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Jobs fetch error:", err);
        setError("Failed to load jobs");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading jobs...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Jobs</h2>

      {jobs.length === 0 && <p>No jobs available</p>}

      {jobs.map((job) => (
        <div key={job._id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
          <h3>{job.title}</h3>
          <p>{job.company}</p>
        </div>
      ))}
    </div>
  );
}
