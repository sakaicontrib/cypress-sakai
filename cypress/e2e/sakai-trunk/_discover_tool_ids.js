// Discovers available Sakai tool IDs from the Course Site creation wizard
// and writes them to cypress/fixtures/sakai-tools.json as an array of
// { id, label } objects. Run this before generating stubs.

describe('Discover Sakai Tool IDs', () => {
  const instructor = 'instructor1';

  it('collects tool checkbox ids and labels', () => {
    cy.sakaiLogin(instructor);

    // Navigate to the Tools selection step of the Site Creation wizard
    cy.visit('/portal/site/~' + instructor);
    cy.contains('a', 'Worksite Setup').click({ force: true });
    cy.contains('a', 'Create New Site').click({ force: true });
    cy.get('input#course').click();
    cy.get('select#selectTerm').select(1);
    cy.get('input#submitBuildOwn').click();

    // Handle either the "select anyway" path or the first available course selection
    cy.get('form[name="addCourseForm"]').then(($html) => {
      if ($html.text().includes('select anyway')) {
        cy.contains('a', 'select anyway').click();
      } else {
        cy.get('form[name="addCourseForm"] input[type="checkbox"]').first().click();
      }
      cy.get('form input#courseDesc1').click();
    });

    cy.get('input#continueButton').click();
    cy.get('textarea').last().type('Cypress Tool Discovery');
    cy.get('.act input[name="continue"]').click();

    // We are now on the Tools step; scrape all tool checkboxes that look like Sakai tools
    cy.get('input[type="checkbox"]').then(($inputs) => {
      const tools = [];
      $inputs.each((_, el) => {
        const id = el.id || '';
        if (!id.startsWith('sakai.')) return; // focus on core sakai.* tools
        const $label = Cypress.$(`label[for="${id}"]`);
        const label = ($label.text() || '').trim();
        tools.push({ id, label });
      });

      // Sort for stability
      tools.sort((a, b) => (a.label || a.id).localeCompare(b.label || b.id));

      cy.log(`Discovered ${tools.length} sakai.* tool ids`);
      cy.writeFile('cypress/fixtures/sakai-tools.json', tools, { log: true });
    });
  });
});

