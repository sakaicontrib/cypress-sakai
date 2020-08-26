
describe('Assignments', function () {
    const instructor = 'instructor1'
    const student = 'student0011'
    const assignTitle = 'Cypress Assignment'
    let sakaiUrl

    beforeEach(function() {

    })

    context('Create a new Assignment', function () {
        it ('can create a new course', function() {
            cy.sakaiLogin(instructor)
            cy.sakaiCreateCourse(instructor, "sakai\\.assignment\\.grades").then(
                returnUrl => sakaiUrl = returnUrl
            )
        })

        it('can create an assignment', function () {
            cy.sakaiLogin(instructor)
            cy.visit(sakaiUrl)
            cy.get('.Mrphs-toolsNav__menuitem--link').contains('Assignments').click()

            // Create new assignment
            cy.get('.navIntraTool a').contains('Add').click()

            // Add a title
            cy.get('#new_assignment_title').type(assignTitle)

            // Type into the ckeditor instructions field
            cy.type_ckeditor("new_assignment_instructions", 
                "<p>What is chiefly responsible for the increase in the average length of life in the USA during the last fifty years?</p>");

            // Honor pledge
            cy.get('#new_assignment_check_add_honor_pledge').click()

            // Save it
            cy.get('div.act input.active').first().click()

            // Now edit
            cy.get('.itemAction').contains('Edit').click()
            cy.get('#new_assignment_check_add_honor_pledge').click()
            cy.get('div.act input.active').first().click();
        })

        it('can login as student', function() {
            cy.sakaiLogin(student)
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

    })
});
