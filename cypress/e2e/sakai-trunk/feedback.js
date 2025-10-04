// Stub for Feedback (sakai.feedback)
describe('Tool Stub: Feedback (sakai.feedback)', () => {
  const instructor = 'instructor1';
  let sakaiUrl;
  const TOOL_ID = 'sakai.feedback';
  const TOOL_LABEL = 'Contact Us';
  const TOOL_ID_ESCAPED = TOOL_ID.replace(/\./g, '\\.');

  it('creates a site with Feedback', () => {
    cy.sakaiLogin(instructor);
    cy.sakaiCreateCourse(instructor, [TOOL_ID_ESCAPED]).then(url => sakaiUrl = url);
  });

  it('opens Feedback (generic smoke)', () => {
    cy.sakaiLogin(instructor);
    cy.visit(sakaiUrl);
    cy.sakaiToolClick(TOOL_LABEL);
    cy.get('#content, main, .portletBody').should('exist');
  });
});
