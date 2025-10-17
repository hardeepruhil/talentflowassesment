import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import JobsPage from "./pages/JobsPage";
import CandidatesPage from "./pages/CandidatesPage";
import AssessmentsPage from "./pages/AssessmentsPage";

export default function App(){
  return (
    <div className="app">
      <header className="header">
        <h1>TalentFlow</h1>
        <nav className="nav">
          <Link to="/jobs">Jobs</Link>
          <Link to="/candidates">Candidates</Link>
          <Link to="/assessments">Assessments</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<JobsPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:jobId" element={<JobsPage />} />
        <Route path="/candidates" element={<CandidatesPage />} />
        <Route path="/candidates/:id" element={<CandidatesPage />} />
        <Route path="/assessments" element={<AssessmentsPage />} />
      </Routes>
    </div>
  );
}
