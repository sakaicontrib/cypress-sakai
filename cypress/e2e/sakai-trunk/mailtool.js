// Email (sakai.mailtool) – send a message to All
describe('Email (sakai.mailtool)', () => {
  const instructor = 'instructor1';
  let sakaiUrl;
  const TOOL_ID = 'sakai.mailtool';
  const TOOL_LABEL = 'Email';
  const TOOL_ID_ESCAPED = TOOL_ID.replace(/\./g, '\\.');
  const subject = `Cypress Mail ${Date.now()}`;
  const body = 'This is a Cypress test email body.';

  beforeEach(() => {
    cy.intercept('POST', 'https://www.google-analytics.com/j/collect*', (req) => { req.destroy() }).as('ga');
  });

  it('creates a site with Email', () => {
    cy.sakaiLogin(instructor);
    cy.sakaiCreateCourse(instructor, [TOOL_ID_ESCAPED]).then(url => sakaiUrl = url);
  });

  it('sends an email to All', () => {
    cy.sakaiLogin(instructor);
    cy.visit(sakaiUrl);
    cy.sakaiToolClick(TOOL_LABEL);

    // Select the "All" checkbox via its label
    cy.contains('label', /^All$/).then($label => {
      if ($label.length) {
        const forId = $label.attr('for');
        if (forId) {
          cy.get(`#${forId}`).check({ force: true });
        } else {
          // Fall back to nearest visible checkbox in same container
          cy.wrap($label).closest('tr, li, div, fieldset').find('input[type="checkbox"]').filter(':visible').first().check({ force: true });
        }
      } else {
        // Ultimate fallback: first visible checkbox
        cy.get('input[type="checkbox"]').filter(':visible').first().check({ force: true });
      }
    });

    // Enter Subject (use label if present, else first visible text input)
    cy.get('form').within(() => {
      cy.get('label').then($labels => {
        const $s = $labels.filter((_, el) => /subject/i.test(el.textContent || ''));
        if ($s.length) {
          const forId = $s.first().attr('for');
          if (forId) cy.get(`#${forId}`).clear().type(subject);
          else cy.get('input[type="text"]').filter(':visible').first().clear().type(subject);
        } else {
          cy.get('input[type="text"]').filter(':visible').first().clear().type(subject);
        }
      });
    });

    // Enter Body via CKEditor if available, else visible textarea/contenteditable
    cy.window().then((win) => {
      const hasCk = !!(win.CKEDITOR && Object.keys(win.CKEDITOR.instances || {}).length);
      if (hasCk) {
        const editorId = Object.keys(win.CKEDITOR.instances)[0];
        cy.wrap(editorId).window().then((w) => cy.typetype(w, editorId, `<p>${body}</p>`));
      } else {
        cy.get('textarea, [contenteditable="true"], div[role="textbox"]').filter(':visible').first()
          .type(body, { parseSpecialCharSequences: false });
      }
    });

    // Send Mail
    cy.contains('button, input[type="submit"]', /^Send Mail$/i).first().click({ force: true });

    // Verify success flash/message
    cy.contains(/Message sent to/i).should('exist');
  });
});
