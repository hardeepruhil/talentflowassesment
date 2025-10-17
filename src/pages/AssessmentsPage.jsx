import React, {useEffect, useState} from "react";
import axios from "axios";

export default function AssessmentsPage(){
  const [jobs, setJobs] = useState([]);
  useEffect(()=>{ 
    (async () => {
      try {
        const res = await axios.get('/api/jobs', { params: { page:1, pageSize:25 } });
        setJobs(res.data.data || []);
      } catch (err) {
        console.error("Failed to load jobs", err);
        setJobs([]);
      }
    })();
  }, []);

  return (
    <div>
      <h2>Assessments</h2>
      <div className="card">
        <p>Pick a job to edit its assessment (scaffold)</p>
        <ul>
          {jobs.map(j=> <li key={j.id}>{j.title} — <button onClick={async ()=> {
            const r = await axios.get(`/api/assessments/${j.id}`).catch(()=>null);
            alert(r ? "Assessment loaded (see console)" : "No assessment for this job");
            console.log(r?.data);
          }}>Load</button></li>)}
        </ul>
      </div>
    </div>
  );
}
