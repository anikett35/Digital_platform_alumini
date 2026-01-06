import { useState } from "react";
import axios from "axios";

export default function PostJob() {
  const [form, setForm] = useState({ title: "", company: "" });

  const submit = async () => {
    await axios.post("http://localhost:5000/api/jobs", form);
    alert("Job Posted");
  };

  return (
    <div>
      <input placeholder="Title" onChange={e => setForm({ ...form, title: e.target.value })} />
      <input placeholder="Company" onChange={e => setForm({ ...form, company: e.target.value })} />
      <button onClick={submit}>Post</button>
    </div>
  );
}
