describe('Gradebook', () => {

  const instructor = 'instructor1';
  let sakaiUrl;

    beforeEach(function() {
      cy.intercept('POST', 'https://www.google-analytics.com/j/collect*', (req) => { req.destroy() }).as('googleanalytics')
    })

    // Rubrics seems to have some issues with webcomponent and load order
    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      return false
    })

  context('Create site and add gradebook', () => {

    it ('can create a new course', () => {

      cy.sakaiLogin(instructor);
      cy.sakaiCreateCourse(instructor, ["sakai\\.gradebookng"]).then(
        returnUrl => sakaiUrl = returnUrl
      );
    });

    it('Create categories and items', () => {

      cy.sakaiLogin(instructor);
      cy.visit(sakaiUrl);
      cy.get('.Mrphs-toolsNav__menuitem--link').contains('Gradebook').click();

      cy.server();
      // DOM is being modified by Wicket so wait for the POST to complete
      cy.route('POST', '/portal/site/*/tool/*/settings?1-1.IBehaviorListener.0-form-categoryPanel-settingsCategoriesPanel-categoriesWrap-addCategory').as('addCat');

      const cats = [
        {letter: "A", percent: 10},
        {letter: "B", percent: 35},
        {letter: "C", percent: 10},
        {letter: "D", percent: 15},
        {letter: "E", percent: 30},
      ];

      // We want to use categories
      cy.get('a[title="Settings"]').click();
      cy.get('a').contains('Categories').click();
      cy.get('input[type="radio"]').last().click();

      cats.forEach((cat, i) => {
        cy.get('.gb-category-row input[name$="name"]').eq(i).type(cats[i].letter);
        cy.get('.gb-category-weight input[name$="weight"]').eq(i).clear().type(cats[i].percent);
        cy.get('#settingsCategories button').contains('Add a category').click();
        cy.wait('@addCat')
      });
      cy.get('.act input[type="button"]').should('have.class', 'active').click();

      // Now create the gb items
      cy.reload();
      cy.get("a[title='Grades']").click();

      cats.forEach((cat, i) => {
        cy.get('.wicket-modal').should('not.exist');
        cy.get("button.gb-add-gradebook-item-button").should('be.visible').click();
        cy.get(".wicket-modal", { timeout: 15000 }).should('be.visible').then(() => {
          cy.get(".wicket-modal input[name$='title']").type(`Item ${i + 1}`);
          cy.get(".wicket-modal input[name$='points']").type(100);
          cy.get(".wicket-modal select[name$='category']").select(`${cat.letter} (${cat.percent}%)`);
          cy.get(".wicket-modal button[name$='submit']").click();
        });
        cy.get(".messageSuccess").should('be.visible')
      });
    });
  });
});
