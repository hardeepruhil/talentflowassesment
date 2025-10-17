import React, {useEffect, useState} from "react";
import axios from "axios";

export default function CandidatesPage(){
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  async function fetchCandidates(){
    setLoading(true);
    const res = await axios.get('/api/candidates', { params: { search: q, page:1 } });
    setCandidates(res.data.data);
    setLoading(false);
  }

  useEffect(()=>{ fetchCandidates(); }, []);

  return (
    <div>
      <div style={{display:"flex", gap:8, marginBottom:12}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="search candidates" />
        <button onClick={fetchCandidates}>Search</button>
      </div>

      <div className="card">
        <p>Showing {candidates.length} candidates (virtualization placeholder)</p>
        <ul style={{maxHeight:400, overflow:"auto"}}>
          {candidates.slice(0,200).map(c=> <li key={c.id}>{c.name} — {c.email} — <small>{c.stage}</small></li>)}
        </ul>
      </div>
    </div>
  );
}
