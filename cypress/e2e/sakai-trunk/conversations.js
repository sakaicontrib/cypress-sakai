// Conversations (sakai.conversations) – create and publish a topic
describe('Conversations (sakai.conversations)', () => {
  const instructor = 'instructor1';
  let sakaiUrl;
  const TOOL_ID = 'sakai.conversations';
  const TOOL_LABEL = 'Conversations';
  const TOOL_ID_ESCAPED = TOOL_ID.replace(/\./g, '\\.');
  const topicTitle = `Cypress Conversation Topic ${Date.now()}`;
  const topicBody = 'This is a Cypress-created Conversations topic.';

  beforeEach(() => {
    cy.intercept('POST', 'https://www.google-analytics.com/j/collect*', (req) => { req.destroy() }).as('ga');
  });

  it('creates a site with Conversations', () => {
    cy.sakaiLogin(instructor);
    cy.sakaiCreateCourse(instructor, [TOOL_ID_ESCAPED]).then(url => sakaiUrl = url);
  });

  it.skip('creates and publishes a new topic', () => {
    cy.sakaiLogin(instructor);
    cy.visit(sakaiUrl);
    // Accept either "Conversations" or a close variant in the sidebar
    cy.get('.site-list-item-collapse.collapse.show a.btn-nav').contains(/Conversation/i).click();
    cy.get('#content, main, .portletBody, .Mrphs-toolTitle').should('exist');

    // Click the Create new topic button using the known selector path
    cy.get('#conv-topbar-and-content > .conv-topbar > .conv-settings-and-create > .btn-primary')
      .should('be.visible')
      .click({ force: true });

    // Fill in the Title field
    cy.get('form').within(() => {
      cy.get('label').then($labels => {
        const $t = $labels.filter((_, el) => /title/i.test(el.textContent || ''));
        if ($t.length) {
          const forId = $t.first().attr('for');
          if (forId) cy.get(`#${forId}`).clear().type(topicTitle);
          else cy.get('input[type="text"]').filter(':visible').first().clear().type(topicTitle);
        } else {
          cy.get('input[type="text"]').filter(':visible').first().clear().type(topicTitle);
        }
      });
    });

    // Enter Details using CKEditor if present, otherwise use a visible textarea/contenteditable
    cy.window().then((win) => {
      const hasCk = !!(win.CKEDITOR && Object.keys(win.CKEDITOR.instances || {}).length);
      if (hasCk) {
        const editorId = Object.keys(win.CKEDITOR.instances)[0];
        // Prefer direct set via our helper; falls back to typing if Source button exists
        cy.wrap(editorId).window().then((w) => cy.typetype(w, editorId, `<p>${topicBody}</p>`));
      } else {
        cy.get('textarea, [contenteditable="true"], div[role="textbox"]').filter(':visible').first()
          .type(topicBody, { parseSpecialCharSequences: false });
      }
    });

    // Publish the topic
    cy.contains('button, input[type="submit"]', /Publish|Post|Create/i).first().click({ force: true });

    // Verify the new topic appears
    cy.contains(topicTitle).should('exist');
  });
});
