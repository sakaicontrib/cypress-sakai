
describe('Gradebook', function () {
    const username = 'instructor1'
    let siteUrl = ''

    context('Create site and add gradebook', function () {

        before(function () {
            cy.sakaiLogin(username)

            // Go to user Home and create new course site
            cy.visit('/portal/site/~' + username)
            cy.get('a').contains('Worksite Setup').click()
            cy.get('a').contains('Create New Site').click({ force: true })
            cy.get('input#course').click()
            cy.get('select > option').eq(1).then(element => cy.get('select').select(element.val()))
            cy.get('input#submitBuildOwn').click()

            // See if site has already been created
            cy.get('form[name="addCourseForm"]').then(($html) => {
                if ($html.text().includes('select anyway')) {
                    cy.get('a').contains('select anyway').click()
                }
                else {
                    cy.get('form[name="addCourseForm"] input[type="checkbox"]').first().click()
                }
            })

            cy.get('input#continueButton').click()
            cy.get('textarea').last().type('Cypress Testing')
            cy.get('.act input[name="continue"]').click()
            cy.get('input#sakai\\.gradebookng').check().should('be.checked')
            cy.get('.act input[name="Continue"]').click()
            cy.get('input#continueButton').click()
            cy.get('input#addSite').click()
            cy.get('#flashNotif').contains('has been created')
            cy.get('#flashNotif a')
                .should('have.attr', 'href').and('include', '/portal/site/')
                .then((href) => {
                    siteUrl = href;
                    cy.visit(href)
                })
            cy.get('.Mrphs-toolsNav__menuitem--link').contains('Gradebook').click()
        })

        it('Create categories and items', function() {
            cy.get('a[title="Settings"]').click({ force: true})
            cy.get('a').contains('Categories').click()
            cy.get('input[type="radio"]').last().click()
            for (let i = 0; i < 4; i++) {
                cy.get('#gradebookSettings button').contains('Add a category').click()
                cy.wait(200)
                cy.get('#settingsCategories table').find('tr.gb-category-row').should('have.length', (i+2))
            }
            cy.get('.gb-category-row input[name$="name"]').first().type('A')
            cy.get('.gb-category-weight input[name$="weight"]').first().clear().type('10')
            cy.get('.gb-category-row input[name$="name"]').eq(1).type('B')
            cy.get('.gb-category-weight input[name$="weight"]').eq(1).clear().type('35')
            cy.get('.gb-category-row input[name$="name"]').eq(2).type('C')
            cy.get('.gb-category-weight input[name$="weight"]').eq(2).clear().type('10')
            cy.get('.gb-category-row input[name$="name"]').eq(3).type('D')
            cy.get('.gb-category-weight input[name$="weight"]').eq(3).clear().type('15')
            cy.get('.gb-category-row input[name$="name"]').eq(4).type('E')
            cy.get('.gb-category-weight input[name$="weight"]').eq(4).clear().type('30')
            cy.get('.act input[type="button"]').should('have.class', 'active').click()

            // Now create the gb items
            cy.reload()
            cy.get('input[name="cancel"]').click()

            for (let i = 0; i < 5; i++) {
                cy.get('button').contains('Add Gradebook Item').click()
                cy.get('.wicket-modal input[name$="title"]').type(1 + i)
                cy.get('.wicket-modal input[name$="points"]').type(100)
                cy.get('.wicket-modal select[name$="category"] > option').eq(1 + i).then(element => cy.get('.wicket-modal select[name$="category"]').select(element.val()))
                cy.get('.wicket-modal button[name$="submit"]').click()
                cy.wait(200)
            }
        })
    })
})