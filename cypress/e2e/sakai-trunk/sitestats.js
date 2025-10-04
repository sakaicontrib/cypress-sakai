// SiteStats (sakai.sitestats) – add and generate a report
describe('SiteStats (sakai.sitestats)', () => {
  const instructor = 'instructor1';
  let sakaiUrl;
  const TOOL_ID = 'sakai.sitestats';
  const TOOL_LABEL = 'Statistics'; // Sometimes shown as "Statistics"
  const TOOL_ID_ESCAPED = TOOL_ID.replace(/\./g, '\\.');
  const reportTitle = `Cypress Report ${Date.now()}`;
  const reportDesc = 'This is a Cypress-generated SiteStats report.';

  beforeEach(() => {
    cy.intercept('POST', 'https://www.google-analytics.com/j/collect*', (req) => { req.destroy() }).as('ga');
  });

  it('creates a site with Statistics', () => {
    cy.sakaiLogin(instructor);
    cy.sakaiCreateCourse(instructor, [TOOL_ID_ESCAPED]).then(url => sakaiUrl = url);
  });

  it('creates a report via Reports → Add → Generate report', () => {
    cy.sakaiLogin(instructor);
    cy.visit(sakaiUrl);
    cy.sakaiToolClick(TOOL_LABEL);

    // Go to Reports tab
    cy.get('.navIntraTool a, .navIntraTool button, a, button').contains(/^Reports$/i).first().click({ force: true });

    // Click Add
    cy.get('.navIntraTool a, .navIntraTool button, a, button').contains(/^Add$/i).first().click({ force: true });

    // Enter Title – avoid labels; pick the first visible text input in the content area
    cy.get('#content, main, .portletBody').first().within(() => {
      cy.get('input[type="text"]').filter(':visible').first().clear().type(reportTitle);
    });

    // Enter Description via CKEditor or fallback textarea/contenteditable in the content area
    cy.get('#content, main, .portletBody').first().then($scope => {
      cy.window().then((win) => {
        const hasCk = !!(win.CKEDITOR && Object.keys(win.CKEDITOR.instances || {}).length);
        if (hasCk) {
          const editorId = Object.keys(win.CKEDITOR.instances)[0];
          cy.wrap(editorId).window().then((w) => cy.typetype(w, editorId, `<p>${reportDesc}</p>`));
        } else {
          cy.wrap($scope).find('textarea, [contenteditable="true"], div[role="textbox"]').filter(':visible').first()
            .type(reportDesc, { parseSpecialCharSequences: false });
        }
      });
    });

    // Generate report
    cy.contains('button, input[type="submit"]', /^Generate report$/i).first().click({ force: true });

    // Verify the report title appears somewhere on the page (list or result)
    cy.contains(reportTitle).should('exist');
  });
});
