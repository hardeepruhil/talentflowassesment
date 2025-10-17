import { setupWorker, rest } from "msw";
import { v4 as uuidv4 } from "uuid";

// In-memory "server" that writes through to IndexedDB is simulated here.
// For scaffold, we keep an in-memory store and some latency + error rate.

const LATENCY_MIN = 200;
const LATENCY_MAX = 1200;
const ERROR_RATE = 0.08; // 8% write error

function randLatency(){ return Math.floor(Math.random()*(LATENCY_MAX-LATENCY_MIN))+LATENCY_MIN; }
function maybeError(){ return Math.random() < ERROR_RATE; }

// Seed data
let jobs = [];
let candidates = [];
let assessments = {};

function seed(){
  jobs = Array.from({length:25}).map((_,i)=>({
    id: uuidv4(),
    title: `Job Role ${i+1}`,
    slug: `job-role-${i+1}`,
    status: Math.random()>0.2 ? "active":"archived",
    tags: ["engineering","frontend"].slice(0, Math.floor(Math.random()*2)+1),
    order: i
  }));

  // 1000 candidates
  const stages = ["applied","screen","tech","offer","hired","rejected"];
  candidates = Array.from({length:1000}).map((_,i)=>({
    id: uuidv4(),
    name: `Candidate ${i+1}`,
    email: `candidate${i+1}@example.com`,
    stage: stages[Math.floor(Math.random()*stages.length)],
    jobId: jobs[Math.floor(Math.random()*jobs.length)].id
  }));

  // Assessments sample
  for(let j=0;j<3;j++){
    const job = jobs[j];
    assessments[job.id] = {
      jobId: job.id,
      sections: [
        { id: uuidv4(), title: "General", questions: [
          { id: uuidv4(), type: "short_text", label: "Why are you a fit?" },
          { id: uuidv4(), type: "single_choice", label: "Experience level", options: ["0-1","2-4","5+"] }
        ]}
      ]
    };
  }
}

seed();

// Helpers for pagination & filters
function paginate(arr, page=1, pageSize=25){
  const p = Number(page)||1;
  const ps = Number(pageSize)||25;
  const start = (p-1)*ps;
  return { items: arr.slice(start, start+ps), total: arr.length };
}

export const handlers = [
  rest.get("/api/jobs", async (req, res, ctx) => {
    await new Promise(r=>setTimeout(r, randLatency()));
    const search = req.url.searchParams.get("search") || "";
    const status = req.url.searchParams.get("status") || "";
    const page = req.url.searchParams.get("page") || "1";
    const pageSize = req.url.searchParams.get("pageSize") || "25";
    let result = jobs.filter(j=> j.title.toLowerCase().includes(search.toLowerCase()));
    if(status) result = result.filter(j=> j.status===status);
    const paged = paginate(result, page, pageSize);
    return res(ctx.status(200), ctx.json({ data: paged.items, total: paged.total }));
  }),

  rest.post("/api/jobs", async (req, res, ctx) => {
    await new Promise(r=>setTimeout(r, randLatency()));
    if(maybeError()) return res(ctx.status(500), ctx.json({ error: "Simulated server error" }));
    const body = await req.json();
    const newJob = { id: uuidv4(), ...body, order: jobs.length };
    jobs.push(newJob);
    return res(ctx.status(201), ctx.json(newJob));
  }),

  rest.patch("/api/jobs/:id", async (req, res, ctx) => {
    await new Promise(r=>setTimeout(r, randLatency()));
    if(maybeError()) return res(ctx.status(500), ctx.json({ error: "Simulated server error" }));
    const { id } = req.params;
    const updates = await req.json();
    jobs = jobs.map(j=> j.id===id ? {...j, ...updates} : j);
    const job = jobs.find(j=> j.id===id);
    return res(ctx.status(200), ctx.json(job));
  }),

  rest.patch("/api/jobs/:id/reorder", async (req, res, ctx) => {
    await new Promise(r=>setTimeout(r, randLatency()));
    // sometimes error to test rollback
    if(Math.random()<0.12) return res(ctx.status(500), ctx.json({error:"Random reorder failure"}));
    const { id } = req.params;
    const { fromOrder, toOrder } = await req.json();
    // naive reorder
    const job = jobs.find(j=> j.id===id);
    if(!job) return res(ctx.status(404));
    jobs = jobs.filter(j=> j.id!==id);
    jobs.splice(toOrder, 0, job);
    // reassign orders
    jobs = jobs.map((j,i)=>({ ...j, order: i }));
    return res(ctx.status(200), ctx.json({ fromOrder, toOrder }));
  }),

  rest.get("/api/candidates", async (req, res, ctx) => {
    await new Promise(r=>setTimeout(r, randLatency()));
    const search = req.url.searchParams.get("search")||"";
    const stage = req.url.searchParams.get("stage")||"";
    const page = req.url.searchParams.get("page")||"1";
    let result = candidates.filter(c=> c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));
    if(stage) result = result.filter(c=> c.stage===stage);
    const paged = paginate(result, page, 50);
    return res(ctx.status(200), ctx.json({ data: paged.items, total: paged.total }));
  }),

  rest.patch("/api/candidates/:id", async (req, res, ctx) => {
    await new Promise(r=>setTimeout(r, randLatency()));
    if(maybeError()) return res(ctx.status(500), ctx.json({ error: "Simulated server error" }));
    const { id } = req.params;
    const updates = await req.json();
    candidates = candidates.map(c=> c.id===id ? {...c, ...updates} : c);
    return res(ctx.status(200), ctx.json(candidates.find(c=> c.id===id)));
  }),

  rest.get("/api/candidates/:id/timeline", async (req, res, ctx) => {
    await new Promise(r=>setTimeout(r, randLatency()));
    const { id } = req.params;
    // return simple timeline
    const timeline = [
      { date: "2025-01-10", note: "Applied" },
      { date: "2025-01-15", note: "Phone screen" }
    ];
    return res(ctx.status(200), ctx.json({ data: timeline }));
  }),

  rest.get("/api/assessments/:jobId", async (req, res, ctx) => {
    await new Promise(r=>setTimeout(r, randLatency()));
    const { jobId } = req.params;
    const a = assessments[jobId];
    if(!a) return res(ctx.status(404), ctx.json({ error: "Not found" }));
    return res(ctx.status(200), ctx.json(a));
  }),

  rest.put("/api/assessments/:jobId", async (req, res, ctx) => {
    await new Promise(r=>setTimeout(r, randLatency()));
    if(maybeError()) return res(ctx.status(500), ctx.json({ error: "Simulated server error" }));
    const { jobId } = req.params;
    const payload = await req.json();
    assessments[jobId] = payload;
    return res(ctx.status(200), ctx.json(payload));
  }),

  rest.post("/api/assessments/:jobId/submit", async (req, res, ctx) => {
    await new Promise(r=>setTimeout(r, randLatency()));
    const { jobId } = req.params;
    const body = await req.json();
    // store responses in memory for scaffold
    assessments[jobId] = assessments[jobId] || {};
    assessments[jobId].responses = assessments[jobId].responses || [];
    assessments[jobId].responses.push(body);
    return res(ctx.status(200), ctx.json({ ok: true }));
  })
];

export const worker = setupWorker(...handlers);
