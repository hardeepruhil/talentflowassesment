# TALENTFLOW - A Mini Hiring Platform (Frontend-only)

This repository is a scaffolded React front-end for the **TalentFlow** assignment (no real backend).
It includes:
- MSW/Mirage-like mock server (api/) + artificial latency + error simulation
- IndexedDB persistence using Dexie
- Routes for Jobs, Candidates, Assessments
- Drag-and-drop reordering and Kanban board (placeholders)
- Virtualized candidate list (example)
- Basic styling and structure

## How to run locally

1. Install dependencies
```bash
npm install
```

2. Start the app
```bash
npm start
```

MSW is configured inside the app to run in development.

## Project structure
```
src/
  api/           # mock server (Mirage-like) and MSW handlers
  components/    # small components (Jobs, Candidates, Assessments)
  db/            # Dexie setup
  pages/         # Page routes
  App.jsx
  index.jsx
```

This scaffold includes working example endpoints and local persistence. Use it as a starting point to implement the full features required by the assignment.

