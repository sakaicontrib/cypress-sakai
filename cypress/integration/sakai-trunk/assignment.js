
describe('Assignments', function () {
    const username = 'instructor1'

    beforeEach(function() {
        /*
        cy.on('uncaught:exception', (err) => {
            expect(err.message).to.include('Ignoring error for now');
            return false;
          });
          */

        cy.sakaiLogin(username)
        cy.sakaiCreateCourse(username, "sakai\\.assignment\\.grades")
        cy.get('.Mrphs-toolsNav__menuitem--link').contains('Assignments').click()
    })

    context('Create a new Assignment', function () {

        it('can create an assignment', function () {
            cy.get('.navIntraTool a').contains('Add').click()
            cy.get('#new_assignment_title').type('Cypress Assignment')
            // Use the command
            cy.type_ckeditor("new_assignment_instructions", "<p>What is chiefly responsible for the increase in the average length of life in the USA during the last fifty years?</p>");

            // Honor pledge
            cy.get('#new_assignment_check_add_honor_pledge').click()

            cy.get('div.act input.active').first().click()

            // Now edit
            cy.get('.itemAction').contains('Edit').click()
            cy.get('#new_assignment_check_add_honor_pledge').click()
            cy.get('div.act input.active').first().click();
        })

    })
});
