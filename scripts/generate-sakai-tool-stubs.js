#!/usr/bin/env node
/*
 * Generate per-tool Cypress stub specs from cypress/fixtures/sakai-tools.json
 *
 * Usage:
 *   node scripts/generate-sakai-tool-stubs.js
 *
 * Notes:
 * - Skips tools that already have targeted specs in this repo.
 * - Writes stub specs as `cypress/e2e/sakai-trunk/tools/<safe-id>.js`.
 * - Stubs are created with `it.skip(...)` so they won’t run until you opt-in.
 */

const fs = require('fs');
const path = require('path');

const FIXTURE = path.join('cypress', 'fixtures', 'sakai-tools.json');
const OUTDIR = path.join('cypress', 'e2e', 'sakai-trunk', 'tools');

// Tools already covered by existing specs here
const COVERED = new Set([
  'sakai.announcements',
  'sakai.assignment.grades',
  'sakai.gradebookng',
  'sakai.rubrics',
  'sakai.commons',
  'sakai.lessonbuildertool',
  'sakai.samigo',
  'sakai.schedule',
]);

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function toSafeFileName(toolId) {
  return toolId.replace(/\./g, '-');
}

function cssEscapeId(toolId) {
  // Escape "." for CSS id selection in Cypress (#id)
  return toolId.replace(/\./g, '\\\\.');
}

function makeStub(tool) {
  const escapedId = cssEscapeId(tool.id);
  const label = tool.label || tool.id;

  return `// Auto-generated stub for ${label} (${tool.id})\n` +
`// Unskip tests and refine assertions once ready.\n\n` +
`describe('Tool Stub: ${label} (${tool.id})', () => {\n` +
`  const instructor = 'instructor1';\n` +
`  let sakaiUrl;\n\n` +
`  it.skip('creates a site with this tool', () => {\n` +
`    cy.sakaiLogin(instructor);\n` +
`    cy.sakaiCreateCourse(instructor, ['${escapedId}']).then(url => sakaiUrl = url);\n` +
`  });\n\n` +
`  it.skip('opens the tool (generic smoke)', () => {\n` +
`    // If you know the exact nav label, replace the generic nav click below:\n` +
`    // cy.sakaiToolClick('${label.replace(/'/g, "\\'")}');\n` +
`    cy.sakaiLogin(instructor);\n` +
`    cy.visit(sakaiUrl);\n` +
`    cy.get('.site-list-item-collapse.collapse.show a.btn-nav')\n` +
`      .filter(':not(:contains("Overview"))')\n` +
`      .first()\n` +
`      .click({ force: true });\n\n` +
`    // Minimal presence checks — adjust as needed per tool\n` +
`    cy.get('#content, #toolForm, main, .portletBody, .Mrphs-toolTitle, h1, h2').should('exist');\n` +
`  });\n` +
`});\n`;
}

function main() {
  if (!fs.existsSync(FIXTURE)) {
    console.error(`Fixture not found: ${FIXTURE}\nRun the discovery spec first: cypress/e2e/sakai-trunk/_discover_tool_ids.js`);
    process.exit(1);
  }
  const tools = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));
  ensureDir(OUTDIR);

  let created = 0;
  for (const tool of tools) {
    if (!tool || !tool.id) continue;
    if (COVERED.has(tool.id)) continue;
    const fname = path.join(OUTDIR, `${toSafeFileName(tool.id)}.js`);
    if (fs.existsSync(fname)) continue;
    fs.writeFileSync(fname, makeStub(tool));
    created++;
  }
  console.log(`Generated ${created} stub spec(s) in ${OUTDIR}`);
}

main();

