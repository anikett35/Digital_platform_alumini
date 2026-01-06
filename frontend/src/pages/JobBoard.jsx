import React from "react";
import JobsList from "../components/Jobs/JobsList";

const JobBoard = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Job Board</h2>
      <JobsList />
    </div>
  );
};

export default JobBoard;
