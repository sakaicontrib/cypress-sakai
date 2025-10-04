Sakai tool stub generation
==========================

This repo includes a Cypress-based discovery spec and a small Node script to generate per‑tool stub specs without guessing tool IDs.

Workflow
--------

1) Discover tool IDs from your Sakai instance

- Start Sakai locally (default baseUrl is `http://127.0.0.1:8080`).
- Run the discovery spec once to scrape tool IDs from the site-creation wizard:

  npx cypress run --spec cypress/e2e/sakai-trunk/_discover_tool_ids.js

  This writes `cypress/fixtures/sakai-tools.json` with entries like `{ id, label }`.

2) Generate stub specs

- Use the Node generator to write one stub per tool under `cypress/e2e/sakai-trunk/tools/`:

  node scripts/generate-sakai-tool-stubs.js

Notes
-----

- Stubs are created with `it.skip(...)` so they won’t run until you opt‑in.
- Tools already covered by dedicated specs are skipped (Announcements, Assignments, Gradebook, Rubrics, Commons, Lessons, Samigo, Schedule).
- Each stub includes:
  - A site creation test that selects only that tool (escaped ID handled).
  - A generic “open tool” smoke step you can customize by updating the nav label or assertions.
- If your instance uses additional tools (e.g. LTI or custom), they will be picked up by discovery if their checkbox IDs start with `sakai.`.

