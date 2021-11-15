describe('Accessibility', function () {
    const instructor = 'instructor1'
    const student11 = 'student0011'
    const student12 = 'student0012'
    let sakaiUrl = ''

    context('Login and use jump to content', function () {

        it ('can jump to new content via keyboard only', function() {
            cy.sakaiLogin(instructor)
            cy.visit('/portal')

            cy.get('.Mrphs-skipNav__menu a[href="#tocontent"]').isNotInViewport()
            cy.get('body').tab().focus()
            cy.focused().should('have.attr', 'title').and('eq', 'jump to content')
            cy.get('.Mrphs-skipNav__menu a').contains('jump to content')
        })
    })

        it('Has no detectable a11y violations on load', () => {
            cy.sakaiLogin(instructor)
            cy.visit('/portal/')

            // Turn on aXe and look for critical a11y issues
            cy.injectAxe()

            // This allSites popout has many difficult a11y issues
            cy.get('#viewAllSites').click()
            cy.get('#allSites').contains('View All Sites').should('be.visible')
            cy.get('body').type('{esc}')
            cy.get('#allSites').isNotInViewport()

            // This is the profile popout in the upper right
            cy.get('#loginUser').click()
            cy.get('.Mrphs-userNav__subnav').find('a').contains('My Connections').isInViewport()
            cy.get('body').type('{esc}')
            cy.get('.Mrphs-userNav__subnav').find('a').contains('My Connections').isNotInViewport()

            // This will fail the test if any critical issues found
            cy.checkA11y(null, {
                includedImpacts: ['critical']
            })
        })

})