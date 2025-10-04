// Stub for Meetings (sakai.meetings)
describe.skip('Tool Stub: Meetings (sakai.meetings)', () => {
  const instructor = 'instructor1';
  let sakaiUrl;
  const TOOL_ID = 'sakai.meetings';
  const TOOL_LABEL = 'Meetings'; // TODO: confirm label in your instance
  const TOOL_ID_ESCAPED = TOOL_ID.replace(/\./g, '\\.');

  it('creates a site with Meetings', () => {
    cy.sakaiLogin(instructor);
    cy.sakaiCreateCourse(instructor, [TOOL_ID_ESCAPED]).then(url => sakaiUrl = url);
  });

  it('opens Meetings (generic smoke)', () => {
    cy.sakaiLogin(instructor);
    cy.visit(sakaiUrl);
    cy.sakaiToolClick(TOOL_LABEL);
    cy.get('#content, main, .portletBody').should('exist');
  });
});
