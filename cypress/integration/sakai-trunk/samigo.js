
describe('Samigo', function () {
    const username = 'instructor1'

    before(function() {
        cy.sakaiLogin(username)
        cy.sakaiCreateCourse(username, "sakai\\.samigo")
        cy.get('.Mrphs-toolsNav__menuitem--link').contains('Tests').click()
    })

    context('Create a Quiz', function () {

        it('can create a quiz from scratch', function () {
            cy.get('#authorIndexForm a').contains('Add').click()
            cy.get('#authorIndexForm\\:title').type('Cypress Quiz')
            cy.get('#authorIndexForm\\:createnew').click()

            // Add a multiple choice question
            cy.get('#assessmentForm\\:parts\\:0\\:changeQType').select('Multiple Choice')
            cy.get('#itemForm\\:answerptr').clear().type('99.99')
            cy.get('#itemForm textarea').first().type('What is chiefly responsible for the increase in the average length of life in the USA during the last fifty years?')
            cy.get('#itemForm\\:mcchoices textarea').first().type('Compulsory health and physical education courses in public schools.')
            cy.get('#itemForm\\:mcchoices textarea').eq(1).type('The reduced death rate among infants and young children.')
            cy.get('#itemForm\\:mcchoices textarea').eq(2).type('The substitution of machines for human labor.')
            cy.get('#itemForm\\:mcchoices input[type="radio"]').eq(1).click()
            cy.get('input[type="submit"]').contains('Save').click()

            // Edit the first question
            cy.get('#assessmentForm\\:parts\\:0\\:parts\\:0\\:answerptr').should('have.value', '99.99')
            cy.get('#assessmentForm\\:parts\\:0\\:parts\\:0\\:modify').click()
            cy.get('#itemForm\\:answerptr').clear().type('100.00')
            cy.get('#itemForm\\:mcchoices textarea').eq(3).type('Safer cars.')
            cy.get('input[type="submit"]').contains('Save').click()

            // Add a second question
            cy.get('#assessmentForm\\:parts\\:0\\:changeQType').select('Multiple Choice')
            cy.get('#itemForm\\:answerptr').clear().type('100.00')
            cy.get('#itemForm textarea').first().type('What is the main reason so many people moved to California in 1849?')
            cy.get('#itemForm\\:mcchoices textarea').first().type('California land was fertile, plentiful, and inexpensive.')
            cy.get('#itemForm\\:mcchoices textarea').eq(1).type('Gold was discovered in central California.')
            cy.get('#itemForm\\:mcchoices textarea').eq(2).type('The east was preparing for a civil war.')
            cy.get('#itemForm\\:mcchoices textarea').eq(3).type('They wanted to establish religious settlements.')
            cy.get('#itemForm\\:mcchoices input[type="radio"]').eq(1).click()
            cy.get('input[type="submit"]').contains('Save').click()
            cy.get('#assessmentForm\\:parts').find('.samigo-question-callout').should('have.length', 2)

            // Delete the first question and confirm we only have one question
            // cy.get('#assessmentForm\\:parts\\:0\\:parts\\:0\\:deleteitem').click()
            // cy.get('input[type="submit"]').contains('Remove').click()
            //cy.get('#assessmentForm\\:parts').find('.samigo-question-callout').should('have.length', 1)

            // Publish the quiz
            cy.get('a').contains('Publish').click()
            cy.get('#assessmentSettingsAction\\:lateHandling\\:0').click()
            cy.get('#assessmentSettingsAction\\:endDate').type('12/31/2034 12:30 pm')
            cy.get('input[type="submit"]').contains('Publish').click()
            cy.get('input[type="submit"]').contains('Publish').click()

            // Edit the published quiz
            cy.get('#authorIndexForm\\:coreAssessments button.dropdown-toggle').first().click()
            cy.get('ul li a').contains('Edit').click()
            cy.get('input[type="submit"]').contains('Edit').click()
            cy.get('#assessmentForm\\:parts\\:0\\:parts\\:0\\:modify').click()
            cy.get('#itemForm textarea').first().type('This is edited question text')
            cy.get('input[type="submit"]').contains('Save').click()
            cy.get('#assessmentForm\\:parts').find('.samigo-question-callout').should('have.length', 2)
            cy.get('input[type="submit"]').contains('Republish').click()
            cy.get('input[type="submit"]').contains('Republish').click()
        })
    })
});