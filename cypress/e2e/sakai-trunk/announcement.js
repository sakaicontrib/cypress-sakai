describe('Announcements', function () {
    const instructor = 'instructor1'
    const student11 = 'student0011'
    const student12 = 'student0012'
    const announcementTitle = 'Cypress Announcement'
    let sakaiUrl

    beforeEach(function() {
      cy.intercept('POST', 'https://www.google-analytics.com/j/collect*', (req) => { req.destroy() }).as('googleanalytics')
    })

    context('Create a new Announcement', function () {

        it('can create a new course', function() {
            cy.sakaiLogin(instructor)

            if (sakaiUrl == null) {
              cy.sakaiCreateCourse(instructor, [
                "sakai\\.announcements",
                "sakai\\.schedule"
              ]).then(url => sakaiUrl = url);
            }
        });

        it('can create a normal announcement', () => {
            cy.sakaiLogin(instructor);
            cy.visit(sakaiUrl);
            cy.sakaiToolClick('Announcements');
  
            // Create new announcement
            cy.get('.navIntraTool a').contains('Add').click();
  
            // Add a title
            cy.get('#subject').click().type(announcementTitle);
  
            // Type into the ckeditor instructions field
            cy.type_ckeditor("body", 
                "<p>What is chiefly responsible for the increase in the average length of life in the USA during the last fifty years?</p>")
    
            // Save
            cy.get('.act input.active').first().click();

            // Now edit it
            cy.get('table .itemAction a').contains('Edit').click({force: true})

            // Modify the the title
            cy.get('#subject').click().type(announcementTitle + ' - Edited')
            cy.get('.act input.active').first().click();

            // Edit and put a date on it 
            cy.get('table .itemAction a').contains('Edit').click({force: true})
            cy.get('#hidden_specify').click()
            cy.get('#use_start_date').click()
            cy.sakaiDateSelect('#opendate', '06/01/2035 08:30 am')
            cy.get('#use_end_date').click()
            cy.sakaiDateSelect('#closedate', '06/03/2035 08:30 am')
            cy.get('.act input.active').first().click();

            // Confirm there is one inactive row
            cy.get('table tr.inactive').should('have.length', 1)
        });
  
    })
});
