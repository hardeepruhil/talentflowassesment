import React, {useEffect, useState} from "react";
import axios from "axios";

export default function JobsPage(){
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  async function fetchJobs(){
    setLoading(true);
    const res = await axios.get('/api/jobs', { params: { search: q, page:1, pageSize:25 } });
    setJobs(res.data.data);
    setLoading(false);
  }

  useEffect(()=>{ fetchJobs(); }, []);

  return (
    <div>
      <div style={{display:"flex", gap:8, marginBottom:12}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="search jobs" />
        <button onClick={fetchJobs}>Search</button>
      </div>

      <div className="card">
        {loading ? <p>Loading...</p> :
          <ul>
            {jobs.map(j=> <li key={j.id}>{j.title} — <small>{j.status}</small></li>)}
          </ul>
        }
      </div>
    </div>
  );
}
