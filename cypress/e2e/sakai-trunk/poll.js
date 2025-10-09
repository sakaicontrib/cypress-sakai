// Polls (sakai.poll) – create a simple poll and verify
describe('Polls (sakai.poll)', () => {
  const instructor = 'instructor1';
  let sakaiUrl;
  const TOOL_ID = 'sakai.poll';
  const TOOL_ID_ESCAPED = TOOL_ID.replace(/\./g, '\\.');
  const pollTitle = `Cypress Poll ${Date.now()}`;
  const pollForm = () =>
    cy
      .get('form:visible')
      .filter((_, form) => !form.closest('sakai-search') && !form.closest('.offcanvas-body'))
      .first();

  beforeEach(() => {
    cy.intercept('POST', 'https://www.google-analytics.com/j/collect*', (req) => { req.destroy() }).as('ga');
  });

  it('creates a site with Polls', () => {
    cy.sakaiLogin(instructor);
    cy.sakaiCreateCourse(instructor, [TOOL_ID_ESCAPED]).then(url => sakaiUrl = url);
  });

  it('can create a poll with two options', () => {
    cy.sakaiLogin(instructor);
    cy.visit(sakaiUrl);

    // Open the Polls tool by partial label match (robust across locales/skins)
    cy.get('.site-list-item-collapse.collapse.show a.btn-nav').contains(/Poll/i).click();

    // Click Add/New in the tool’s intra-nav
    cy.get('.navIntraTool a, .navIntraTool button, ul.nav a').contains(/Add|New/i).first().click();

    // Fill the question/title field – prefer a label called "Question" or "Title"
    pollForm().within(() => {
      cy.get('label').then($labels => {
        const $qLabel = $labels.filter((_, el) => /question|title/i.test(el.textContent || ''));
        if ($qLabel.length) {
          const forId = $qLabel.first().attr('for');
          if (forId) cy.get(`#${forId}`).clear().type(pollTitle);
          else cy.get('input[type="text"]').first().clear().type(pollTitle);
        } else {
          cy.get('input[type="text"]').first().clear().type(pollTitle);
        }
      });
    });

    // Enter two options – many forms show at least two option inputs by default
    pollForm().within(() => {
      cy.get('input[type="text"]').then($ins => {
        // Heuristic: question/title is usually the first text input, so use next two as options
        const first = $ins.eq(1);
        const second = $ins.eq(2);
        if (first.length) first.clear().type('Yes');
        if (second.length) second.clear().type('No');
      });
    });

    // Save the poll
    pollForm().within(() => {
      cy.contains('input[type="submit"], button[type="submit"], .act input, .act button', /Save|Add|Create/i).first().click();
    });

    // Verify the poll appears in the list
    cy.contains(pollTitle).should('exist');
  });
});
