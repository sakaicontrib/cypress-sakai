
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

        it('can create a letter grade assignment', () => {
            cy.sakaiLogin(instructor);
            cy.visit(sakaiUrl);
            cy.get('.Mrphs-toolsNav__menuitem--link').contains('Assignments').click();
  
            // Create new assignment
            cy.get('.navIntraTool a').contains('Add').click();
  
            // Add a title
            cy.get('#new_assignment_title').type('Letter Grades');

            cy.get('#new_assignment_grade_type').select('Letter grade');
  
            // Type into the ckeditor instructions field
            cy.type_ckeditor("new_assignment_instructions", 
                "<p>What is chiefly responsible for the increase in the average length of life in the USA during the last fifty years?</p>")
    
            // Save
            cy.get('div.act input.active').first().click();

            // Confirm can grade it with letters
            cy.get('.itemAction a').last().click()
            cy.wait(10000)
            cy.get('grader-toggle input').check()
            cy.get('#submissionList a').contains('student0011').click()
            cy.get('#letter-grade-selector').select('B')
            cy.get('.act .active').first().click()
            cy.get('button').contains('Return to List').click()
            cy.get('table#submissionList tr').eq(1).find('td[headers="grade"]').contains('B')
            cy.get('.navIntraTool a').first().click()

            // Now use the old grader
            cy.get('.itemAction a').last().click()
            cy.wait(10000)
            cy.get('grader-toggle input').uncheck()
            cy.get('#submissionList a').contains('student0011').click()
            cy.get('select#grade option:selected').should('have.text', 'B')
            cy.get('select#grade').select('C')
            cy.get('.act input#save').click()
            cy.get('input[name="cancelgradesubmission1"]').click()
            cy.get('table#submissionList tr').eq(1).find('td[headers="grade"]').contains('C')
            cy.get('.navIntraTool a').first().click()

            // Now remove it
            cy.get('input#check_1').check()
            cy.get('input#btnRemove').click()
            cy.get('div').contains('Are you sure you want to delete')
            cy.get('input#delete').click()

        });

        it('can create a points assignment', () => {

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
          cy.get("#gradeAssignment").uncheck();

          // Attempt to save it without instructions
          cy.get('div.act input.active').first().click();

          // Should be an alert at top
          cy.get('#generalAlert').should('contain', 'Alert');

          // Type into the ckeditor instructions field
          cy.type_ckeditor("new_assignment_instructions", 
              "<p>What is chiefly responsible for the increase in the average length of life in the USA during the last fifty years?</p>")

          // Save it with instructions
          cy.get('div.act input.active').first().click();

          // Confirm it exists but can't grade it
          cy.get('a').contains('View Submissions').its('length') === 1
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

          // Confirm score is present on instructor page
          cy.get('td[headers="maxgrade"]').contains('55.13').its('length') === 1
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
            cy.get('.portal-jump-linksitem--tools > .Mrphs-skipNav__link').click()
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

            cy.wait(10000)
            cy.get('grader-toggle input').check()
            cy.get('#submissionList a').contains(student12).click()

            // Allow student12 to resubmit
            cy.get('#grader-feedback-text').contains('This is my submission text')
            cy.get('#score-grade-input').type('50.56')
            cy.get('.resubmission-checkbox input').click()
            // Save and Release
            cy.get('div.act button[name="return"]').click()
        })

        it('can resubmit as student on iphone', function() {
            cy.viewport('iphone-x') 
            cy.sakaiLogin(student12)
            cy.visit(sakaiUrl)
            cy.get('.portal-jump-linksitem--tools > .Mrphs-skipNav__link').click()
            cy.get('.Mrphs-toolsNav__menuitem--link').contains('Assignments').click()

            // Click into the assignment
            cy.get('a').contains(assignTitle).click()

            // Confirm our score is present
            cy.get('.itemSummaryValue').contains('50.56')

            // Confirm we can re-submit as student
            cy.get('h3').contains('Resubmission')
            cy.wait(5000) // wait for ckeditor to load
            cy.type_ckeditor('Assignment.view_submission_text', '<p>This is my re-submission text</p>')
            cy.get('div.act input.active').first().click()

            // Final resubmit
            cy.get('.act input.active').should('have.value', 'Submit').click()
        })
  
    })
});
