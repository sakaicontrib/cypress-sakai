describe('Accessibility', function () {
    const instructor = 'instructor1'
    const student11 = 'student0011'
    const student12 = 'student0012'
    let sakaiUrl = ''

    beforeEach(() => {
        cy.sakaiLogin(instructor)
        cy.visit('/portal')
        cy.injectAxe()
      })

    context('Login and use jump to content', function () {

        it ('can jump to new content via keyboard only', () => {
            cy.get('.Mrphs-skipNav__menu a[href="#tocontent"]').isNotInViewport()
            cy.get('body').tab().focus()
            cy.focused().should('have.attr', 'title').and('eq', 'jump to content')
            cy.get('.Mrphs-skipNav__menu a').contains('jump to content')
            cy.checkForCriticalA11yIssues()
        })

        it('has no detectable a11y violations on View All Sites', () => {
            // This allSites popout has many difficult a11y issues
            cy.get('#viewAllSites').click()
            cy.get('#allSites').contains('View All Sites').should('be.visible')
            cy.checkForCriticalA11yIssues()
            cy.get('body').type('{esc}')
            cy.get('#allSites').isNotInViewport()
        })

        it('has no a11y violations from Profile popout', () => {
            cy.get('#loginUser').click()
            cy.get('.Mrphs-userNav__subnav').find('a').contains('My Connections').isInViewport()
            cy.checkForCriticalA11yIssues()
            cy.get('body').type('{esc}')
            cy.get('.Mrphs-userNav__subnav').find('a').contains('My Connections').isNotInViewport()
        })

    })
})