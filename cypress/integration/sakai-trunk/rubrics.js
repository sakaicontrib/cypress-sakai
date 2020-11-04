describe('Rubrics', () => {

  const instructor = 'instructor1';
  const student11 = 'student0011';
  const student12 = 'student0012';
  const rubricTitle = 'Cypress Rubric';
  let sakaiUrl;

  const createRubric = () => {

    cy.sakaiLogin(instructor);
    cy.visit(sakaiUrl);
    cy.get('.Mrphs-toolsNav__menuitem--link').contains('Rubrics').click();

    // Create new rubric
    cy.get('.add-rubric').click();
  };

  context('Create a new Rubric', () => {

    it ('can create a new course', () => {

      cy.sakaiLogin(instructor);
      cy.sakaiCreateCourse(instructor, "sakai\\.rubrics").then(url => sakaiUrl = url);
    });

    it('can create a rubric and set the title', () => {

      createRubric();

      // Set the title and save it
      cy.get('#rubric_title_edit').type(rubricTitle);
      cy.get("div.rubric-edit-popover .save").click();

      // Check the title updated.
      cy.get('a.rubric-name').first({ timeout: 500 }).should("contain", rubricTitle);
    });

    it('can create a rubric and then add a criterion', () => {

      createRubric();
      // We don't want to bother saving the title.
      cy.get("div.rubric-edit-popover .cancel:visible").click();
      cy.get(".add-criterion:visible").click();
      cy.get("div.criterion-edit-popover .cancel:visible").click();
      cy.get('h4.criterion-title:visible').last({ timeout: 500 }).should("contain", "New Criterion");
    });

    it('can delete a rubric', () => {

      createRubric();
      // We don't want to bother saving the title.
      cy.get("div.rubric-edit-popover .cancel:visible").click();
      cy.get("sakai-item-delete.sakai-rubric").last().click();
      cy.get("button.save:visible").click();
      cy.get("#site_rubrics rubric-item").should("not.exist");
    });

    it('can copy a rubric', () => {

      createRubric();
      // We don't want to bother saving the title.
      cy.get("div.rubric-edit-popover .cancel:visible").click();
      cy.get(".rubric-title a.clone:visible").last().click();
      cy.get("button.save:visible").click();
      cy.get('a.rubric-name').last().should("contain", "New Rubric Copy");
    });

    it('can copy a criterion', () => {

      createRubric();
      // We don't want to bother saving the title.
      cy.get("div.rubric-edit-popover .cancel:visible").click();
      cy.get(".criterion-row a.clone:visible").last().click();
      cy.get("button.save:visible").click();
      cy.get('h4.criterion-title').last().should("contain", "Criterion 2 Copy");
      cy.get('h4.criterion-title').its("length") === 3;
    });
  })
});
