// Forums (sakai.forums) – add a forum and a topic
describe('Forums (sakai.forums)', () => {
  const instructor = 'instructor1';
  let sakaiUrl;
  const TOOL_ID = 'sakai.forums';
  const TOOL_ID_ESCAPED = TOOL_ID.replace(/\./g, '\\.');
  const forumTitle = `Cypress Forum ${Date.now()}`;
  const topicTitle = `Cypress Topic ${Date.now()}`;

  beforeEach(() => {
    cy.intercept('POST', 'https://www.google-analytics.com/j/collect*', (req) => { req.destroy() }).as('ga');
  });

  it('creates a site with Forums', () => {
    cy.sakaiLogin(instructor);
    cy.sakaiCreateCourse(instructor, [TOOL_ID_ESCAPED]).then(url => sakaiUrl = url);
  });

  it('can create a forum and add a topic', () => {
    cy.sakaiLogin(instructor);
    cy.visit(sakaiUrl);

    // Open the tool; label can be "Forums" or "Discussions" in some setups
    cy.get('.site-list-item-collapse.collapse.show a.btn-nav').contains(/Forum|Discussion/i).click();

    // Create a forum (look for Add/New Forum in the intra-nav)
    cy.get('.navIntraTool a, .navIntraTool button').contains(/New\s+Forum|Add\s+Forum|New/i).first().click();

    // Title field (prefer label text, fall back to first visible text input)
    cy.get('form').within(() => {
      cy.get('label').then($labels => {
        const $t = $labels.filter((_, el) => /title/i.test(el.textContent || ''));
        if ($t.length) {
          const forId = $t.first().attr('for');
          if (forId) cy.get(`[id="${forId}"]`).clear().type(forumTitle);
          else cy.get('input[type="text"]').filter(':visible').first().clear().type(forumTitle);
        } else {
          cy.get('input[type="text"]').filter(':visible').first().clear().type(forumTitle);
        }
      });
    });

    cy.contains('input[type="submit"], button[type="submit"], .act input, .act button', /Save|Create/i).first().click();

    // Verify forum exists and open it
    cy.contains('a', forumTitle).click();

    // Add a topic
    cy.get('.navIntraTool a, .navIntraTool button').contains(/New\s+Topic|Add\s+Topic|New/i).first().click();

    cy.get('form').within(() => {
      cy.get('label').then($labels => {
        const $t = $labels.filter((_, el) => /title/i.test(el.textContent || ''));
        if ($t.length) {
          const forId = $t.first().attr('for');
          if (forId) cy.get(`[id="${forId}"]`).clear().type(topicTitle);
          else cy.get('input[type="text"]').filter(':visible').first().clear().type(topicTitle);
        } else {
          cy.get('input[type="text"]').filter(':visible').first().clear().type(topicTitle);
        }
      });
    });

    cy.contains('input[type="submit"], button[type="submit"], .act input, .act button', /Save|Create/i).first().click();

    // Verify topic appears in the forum listing
    cy.contains(topicTitle).should('exist');
  });
});
