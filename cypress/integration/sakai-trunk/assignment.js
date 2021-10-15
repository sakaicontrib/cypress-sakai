
describe('Assignments', function () {
    const instructor = 'instructor1'
    const student11 = 'student0011'
    const student12 = 'student0012'
    const assignTitle = 'Cypress Assignment'
    let sakaiUrl

    beforeEach(function() {

    })

    context('Create a new Assignment', function () {

        it ('can create a new course', function() {
            cy.sakaiLogin(instructor)
            cy.sakaiCreateCourse(instructor, [
              "sakai\\.rubrics",
              "sakai\\.assignment\\.grades",
              "sakai\\.gradebookng"
            ]).then(url => sakaiUrl = url);
        });

        it('can create an assignment', () => {

          cy.sakaiLogin(instructor);
          cy.visit(sakaiUrl);
          cy.get('.Mrphs-toolsNav__menuitem--link').contains('Assignments').click();

          // Create new assignment
          cy.get('.navIntraTool a').contains('Add').click();

          // Add a title
          cy.get('#new_assignment_title').type(assignTitle);

          // Honor pledge
          cy.get('#new_assignment_check_add_honor_pledge').click();

          // Need to set points
          cy.get("#new_assignment_grade_points").type("100");

          // Attempt to save it without instructions
          cy.get('div.act input.active').first().click();

          // Should be an alert at top
          cy.get('#generalAlert').should('contain', 'Alert');

          // Type into the ckeditor instructions field
          cy.type_ckeditor("new_assignment_instructions", 
              "<p>What is chiefly responsible for the increase in the average length of life in the USA during the last fifty years?</p>");

          // Attempt to save it with instructions
          cy.get('div.act input.active').first().click();
        });

        it("Can associate a rubric with an assignment", () =>{

          cy.createRubric(instructor, sakaiUrl);
          cy.get("div.rubric-edit-popover .save").click();

          cy.get('.Mrphs-toolsNav__menuitem--link').contains('Assignments').click()
          cy.get('.itemAction').contains('Edit').click()

          cy.get("#gradeAssignment").click();
          cy.get("#new_assignment_grade_points").type("55");
          cy.get("input[name='rbcs-associate'][value='1']").click();
          cy.get('div.act input.active').first().click()
          cy.get("sakai-rubric-student-button").its("length") === 1;
        });

        it('can submit as student on desktop', function() {
            cy.viewport('macbook-13') 
            cy.sakaiLogin(student11)
            cy.visit(sakaiUrl)
            cy.get('.Mrphs-toolsNav__menuitem--link').contains('Assignments').click()

            cy.get('a').contains(assignTitle).click()

            // Honor Pledge?
            cy.get('input[type="submit"]').contains('Agree').click()

            cy.type_ckeditor('Assignment.view_submission_text', '<p>This is my submission text</p>')
            cy.get('div.act input.active').first().click()

            // Final submit
            cy.get('div.act input.active').first().click()
        })

        it('can submit as student on iphone', function() {
            cy.viewport('iphone-x') 
            cy.sakaiLogin(student12)
            cy.visit(sakaiUrl)
            cy.get('.Mrphs-skipNav__menuitem--tools > .Mrphs-skipNav__link').click()
            cy.get('.Mrphs-toolsNav__menuitem--link').contains('Assignments').click()

            cy.get('a').contains(assignTitle).click()

            // Honor Pledge?
            cy.get('input[type="submit"]').contains('Agree').click()

            cy.type_ckeditor('Assignment.view_submission_text', '<p>This is my submission text</p>')
            cy.get('div.act input.active').first().click()

            // Final submit
            cy.get('div.act input.active').first().click()
        })
    })
});
