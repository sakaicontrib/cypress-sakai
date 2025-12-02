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

    // Fill in date fields (openDate and closeDate)
    // These are datetime-local inputs requiring format: YYYY-MM-DDThh:mm
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const datetimeStr = `${year}-${month}-${day}T${hours}:${minutes}`;

    pollForm().within(() => {
      cy.get('input[name="openDate"]').clear();
      cy.get('input[name="openDate"]').type(datetimeStr);

      cy.get('input[name="closeDate"]').clear();
      cy.get('input[name="closeDate"]').type(datetimeStr);
    });

    // Save the poll (this will navigate to the "Add an Option" screen)
    pollForm().within(() => {
      cy.contains('input[type="submit"], button[type="submit"], .act input, .act button', /Save|Add|Create|Continue/i).first().click();
    });

    // Wait for "Add an Option" page to load - look for textarea
    cy.get('textarea', {timeout: 10000}).should('be.visible');

    // Add first option "Yes" and click Save
    cy.get('textarea').clear();
    cy.get('textarea').type('Yes');
    cy.contains('button, input[type="submit"]', /^Save$/i).click();

    // Save takes us back to the poll edit form
    // Wait for success banner to confirm we're on the edit poll view
    cy.get('.sak-banner-success', {timeout: 10000}).should('be.visible');

    // Click "Add option" button to add the second option
    cy.get('input[type="button"][value="Add option"]').click();

    // Wait for "Add an Option" page to load again
    cy.get('textarea', {timeout: 5000}).should('be.visible');

    // Add second option "No" and click Save
    cy.get('textarea').clear();
    cy.get('textarea').type('No');
    cy.get('input[type="submit"][value="Save"]').click();

    // Wait for success banner after saving second option
    cy.get('.sak-banner-success', {timeout: 10000}).should('be.visible');

    cy.get('input[type="submit"][value="Save"]').click();
    cy.get('.sak-banner-success', {timeout: 10000}).contains("Poll saved successfully");

    // Verify the poll appears in the list
    cy.contains(pollTitle).should('exist');
  });
});
