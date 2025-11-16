// Dashboard (sakai.dashboard) – edit and save
describe('Dashboard (sakai.dashboard)', () => {
  const instructor = 'instructor1';
  let sakaiUrl;
  const TOOL_ID = 'sakai.dashboard';
  const TOOL_LABEL = 'Dashboard';
  const TOOL_ID_ESCAPED = TOOL_ID.replace(/\./g, '\\.');

  beforeEach(() => {
    cy.intercept('POST', 'https://www.google-analytics.com/j/collect*', (req) => { req.destroy() }).as('ga');
  });

  it('creates a site with Dashboard', () => {
    cy.sakaiLogin(instructor);
    cy.sakaiCreateCourse(instructor, [TOOL_ID_ESCAPED]).then(url => sakaiUrl = url);
  });

  it('can edit and save the dashboard', () => {
    cy.sakaiLogin(instructor);
    cy.visit(sakaiUrl);
    // Open the Dashboard tool
    cy.get('.site-list-item-collapse.collapse.show a.btn-nav').contains(/Dashboard/i).click();

    // Enter edit mode
    cy.get('#course-dashboard-edit button').first().click({ force: true });

    // Save changes (no-op if nothing changed)
    cy.get('#course-dashboard-save button')
      .first()
      .click({ force: true });

    // Basic assertion: we’re back on the dashboard with content visible
    cy.get('#content, main, .portletBody').should('exist');
    cy.get('#course-dashboard-edit button').should('exist');
  });
});
