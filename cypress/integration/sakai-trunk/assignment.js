
describe('Assignments', function () {
    const instructor = 'instructor1'
    const student11 = 'student0011'
    const student12 = 'student0012'
    const assignTitle = 'Cypress Assignment'
    let sakaiUrl

    beforeEach(function() {
      cy.intercept('POST', 'https://www.google-analytics.com/j/collect*', (req) => { req.destroy() }).as('googleanalytics')
    })

    // Rubrics seems to have some issues with webcomponent and load order
    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      return false
    })

    context('Create a new Assignment', function () {

        it ('can create a new course', function() {
            cy.sakaiLogin(instructor)

            if (sakaiUrl == null) {
              cy.sakaiCreateCourse(instructor, [
                "sakai\\.rubrics",
                "sakai\\.assignment\\.grades",
                "sakai\\.gradebookng"
              ]).then(url => sakaiUrl = url);
            }
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

          // Need to unset grading
          cy.get("#gradeAssignment").click();

          // Attempt to save it without instructions
          cy.get('div.act input.active').first().click();

          // Should be an alert at top
          cy.get('#generalAlert').should('contain', 'Alert');

          // Type into the ckeditor instructions field
          cy.type_ckeditor("new_assignment_instructions", 
              "<p>What is chiefly responsible for the increase in the average length of life in the USA during the last fifty years?</p>")

          // Save it with instructions
          cy.get('div.act input.active').first().click();

          // Confirm it exists but cant graade it
          cy.get("a").contains('View Submissions').its("length") === 1;
        });

        it("Can associate a rubric with an assignment", () =>{

          cy.createRubric(instructor, sakaiUrl);
          cy.get("div.rubric-edit-popover").its("length") === 1;
          cy.get("div.rubric-edit-popover .save").click();

          cy.get('.Mrphs-toolsNav__menuitem--link').contains('Assignments').click()
          cy.get('.itemAction').contains('Edit').click()

          // Save assignment with points and a rubric associated{
          cy.get("#gradeAssignment").click();
          cy.get("#new_assignment_grade_points").type("55.13");
          cy.get("input[name='rbcs-associate'][value='1']").click();

          // Again just to make sure editor loaded fully
          cy.type_ckeditor("new_assignment_instructions", 
              "<p>What is chiefly responsible for the increase in the average length of life in the USA during the last fifty years?</p>")

          // Save
          cy.get('.act input.active').first().click()

          // Confirm rubric button
          cy.get("a").contains('Grade').its("length") === 1;
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
            cy.get('.act input.active').first().should('have.value', 'Proceed').click()

            // Final submit
            cy.get('.textPanel').contains('This is my submission text')
            cy.get('.act input.active').should('have.value', 'Submit').click()

            // Confirmation page
            cy.get('h3').contains('Submission Confirm')
            cy.get('.act input.active').should('have.value', 'Back to list').click()
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
            cy.get('.act input.active').first().should('have.value', 'Proceed').click()

            // Final submit
            cy.get('.act input.active').first().should('have.value', 'Submit').click()

            // Confirmation page
            cy.get('h3').contains('Submission Confirm')
            cy.get('.act input.active').should('have.value', 'Back to list').click()

            // Try to submit again
            cy.get('a').contains(assignTitle).click()
            cy.get('.textPanel').contains('This is my submission text')
            cy.get('form').contains('Back to list').click()
        })

        it('can can allow a student to resubmit', function() {
            cy.sakaiLogin(instructor)
            cy.visit(sakaiUrl)
            cy.get('.Mrphs-toolsNav__menuitem--link').contains('Assignments').click()

            cy.get('.itemAction a').contains('Grade').click()

            // Make sure we are using new grader
            cy.get('grader-toggle')
            cy.get('grader-toggle').find('input[type="checkbox"]').check()
            cy.get('grader-toggle').find('input[type="checkbox"]').should('be.checked')

            cy.get('#submissionList a').contains(student12).click()

            // Allow student12 to resubmit
            cy.get('#grader-feedback-text').contains('This is my submission text')
            cy.get('#score-grade-input').type('50.56')
            cy.get('.resubmission-checkbox input').click()
            cy.get('div.act button[name="return"]').click().pause()
        })

        it('can resubmit as student on iphone', function() {
            cy.viewport('iphone-x') 
            cy.sakaiLogin(student12)
            cy.visit(sakaiUrl)
            cy.get('.Mrphs-skipNav__menuitem--tools > .Mrphs-skipNav__link').click()
            cy.get('.Mrphs-toolsNav__menuitem--link').contains('Assignments').click()

            cy.get('a').contains(assignTitle).click()

            cy.get('h3').contains('Resubmission')
            cy.wait(5000) // wait for ckeditor to load
            cy.type_ckeditor('Assignment.view_submission_text', '<p>This is my re-submission text</p>')
            cy.get('div.act input.active').first().click()

            // Final resubmit
            cy.get('.act input.active').should('have.value', 'Resubmit').click()

            // Confirm no more chances
            cy.get('.act input.active').contains('Back to list').click()
            cy.get('a').contains(assignTitle).click()
            cy.get('.textPanel').contains('This is my re-submission text')
            cy.get('form').contains('Back to list').click()
        })
    })
});
