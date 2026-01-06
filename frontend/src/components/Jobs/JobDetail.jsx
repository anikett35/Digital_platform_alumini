export default function JobDetail({ job }) {
  return (
    <div>
      <h2>{job.title}</h2>
      <p>{job.description}</p>
      <p>{job.requirements}</p>
    </div>
  );
}
