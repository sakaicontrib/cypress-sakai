
describe('Samigo', function () {
    const username = 'instructor1'

    before(function() {
        cy.sakaiLogin(username)
        cy.sakaiCreateCourse(username, "sakai\\.samigo")
        cy.get('.Mrphs-toolsNav__menuitem--link').contains('Tests').click()
    })

    context('Create a Quiz', function () {


        it('create the site', function () {
            cy.get('#authorIndexForm a').contains('Add').click()
        })
    })
});