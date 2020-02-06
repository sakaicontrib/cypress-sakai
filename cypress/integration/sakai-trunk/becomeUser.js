
describe('Become User', function () {
    const username = 'admin'

    context('From admin to instructor1 and back', function () {

        beforeEach(function () {
            cy.sakaiLogin(username)
        })

        it('Administration Workspace - Become User', function () {
            cy.visit('/portal/site/!admin')
            cy.get('.is-selected > .link-container > span').should('contain', 'Administration')
            cy.get('a.Mrphs-toolsNav__menuitem--link').contains('Become User').click()
            cy.get('#su\\:username').type('instructor1{enter}')
            cy.visit('/portal/site/!admin')
            cy.get('.Mrphs-breadcrumb--toolNameText').contains('Site Unavailable')
            cy.get('#loginUser a').click()
            cy.get('#loginLinks a').contains('Return to').click()
            cy.visit('/portal/site/!admin')
            cy.get('.Mrphs-breadcrumb--toolNameText').contains('Administration  ')
        })
    })
});