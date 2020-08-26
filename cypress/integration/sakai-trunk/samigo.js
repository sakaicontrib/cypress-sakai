
describe('Samigo', function () {
    const instructor = 'instructor1'
    let sakaiUrl

    beforeEach(function() {

    })

    context('Create a Quiz', function () {

        it ('can create a new course', function() {
            cy.sakaiLogin(instructor)
            cy.sakaiCreateCourse(instructor, "sakai\\.samigo").then(
                returnUrl => sakaiUrl = returnUrl
            )
        })

        it('can create a quiz from scratch', function () {
            cy.sakaiLogin(instructor)
            cy.visit(sakaiUrl)
            cy.get('.Mrphs-toolsNav__menuitem--link').contains('Tests').click()

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

            // Add a second part
            cy.get('#assessmentForm\\:addPart').click()
            cy.get('#modifyPartForm\\:title').type('Second Part')
            cy.get('input[type="submit"]').contains('Save').click()

            // Delete the second part
            cy.get('#assessmentForm\\:parts a[title="Remove Part"]').contains('Remove').last().click()
            cy.get('input[type="submit"]').contains('Remove').click()
            cy.get('label[for="assessmentForm\\:parts\\:1\\:number"]').should('not.exist')
            cy.contains('Second Part').should('not.exist')

            // Delete the first question and confirm we only have one question
            cy.get('#assessmentForm\\:parts\\:0\\:parts\\:0\\:deleteitem').click()
            cy.get('input[type="submit"]').contains('Remove').click()
            cy.get('#assessmentForm\\:parts').find('.samigo-question-callout').should('have.length', 1)

            // Publish the quiz
            cy.get('a').contains('Settings').click()
            cy.get('body').then(($body) => {
              if ($body.text().includes('not after due date')) {
                cy.get('#assessmentSettingsAction\\:lateHandling\\:0').click()
              }
            })
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
            cy.get('#assessmentForm\\:parts').find('.samigo-question-callout').should('have.length', 1)
            cy.get('input[type="submit"]').contains('Republish').click()
            cy.get('input[type="submit"]').contains('Republish').click()
        })
    })

    context('Create a Pool', function () {
        it('can add and edit question pools', function () {
            const uuid = Cypress._.random(0, 1e6)

            // Create a new pool
            cy.get('#authorIndexForm a').contains('Question Pools').click()
            cy.get('#questionpool\\:add').click()
            cy.get('#questionpool\\:namefield').type(uuid)
            cy.get('#questionpool\\:submit').click()
            cy.get('#questionpool\\:TreeTable a').contains(uuid).click()

            // Add a question to the pool
            cy.get('a').contains('Add Question').click()
            cy.get('#content form select').select('Multiple Choice')
            cy.get('input[type="submit"]').contains('Save').click()
            cy.get('#itemForm\\:answerptr').clear().type('100.00')
            cy.get('#itemForm textarea').first().type('What is the main reason so many people moved to California in 1849?')
            cy.get('#itemForm\\:mcchoices textarea').first().type('California land was fertile, plentiful, and inexpensive.')
            cy.get('#itemForm\\:mcchoices textarea').eq(1).type('Gold was discovered in central California.')
            cy.get('#itemForm\\:mcchoices textarea').eq(2).type('The east was preparing for a civil war.')
            cy.get('#itemForm\\:mcchoices textarea').eq(3).type('They wanted to establish religious settlements.')
            cy.get('#itemForm\\:mcchoices input[type="radio"]').eq(1).click()
            cy.get('input[type="submit"]').contains('Save').click()

            // Edit the question
            cy.get('#editform\\:questionpool-questions\\:0\\:modify').click()
            cy.get('#itemForm textarea').first().clear().type('Edited question text')
            cy.get('input[type="submit"]').contains('Save').click()
            cy.get('#editform\\:questionpool-questions').find('a[title="Edit Question"]').should('have.length', 1)
        })

    })
});
