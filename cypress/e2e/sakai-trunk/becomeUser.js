
describe('Become User', function () {
    const username = 'admin'

    context('From admin to instructor1 and back', function () {

        beforeEach(function () {
            cy.sakaiLogin(username)
        })

        it('Administration Workspace - Become User', function () {
            cy.visit('/portal/site/!admin')
            cy.get('.btn-site > span').should('contain', 'Administration')
            cy.get('a.btn-nav').contains('Become User').click({ force: true })
            cy.get('#su\\:username').type('instructor1{enter}')
            cy.visit('/portal/site/!admin')
            cy.get('.btn-site > span').contains('Site Unavailable')
            cy.get('a.sak-sysInd-account').click()
            cy.get('a#loginLink1').contains('Return to').click()
            cy.visit('/portal/site/!admin')
            cy.get('.btn-site > span').should('not.contain', 'Site Unavailable')
            cy.get('a.btn-nav').contains('Become User')
        })
    })
});