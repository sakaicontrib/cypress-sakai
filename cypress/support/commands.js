// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//

Cypress.Commands.add('sakaiLogin', (username) => {

  Cypress.log({
    name: 'sakaiLogin',
    message: `${username}`,
  })

  return cy.request({
    method: 'POST',
    url: '/portal/xlogin',
    form: true,
    body: {
      eid: username,
      pw: (username === 'admin' ? 'admin' : 'sakai'),
    },
  })
});

Cypress.Commands.add('sakaiUuid', () => {

  let uuid = Cypress.env('TRAVIS_BUILD_NUMBER')
  if (Cypress._.isEmpty(uuid)) {
    uuid = Cypress._.floor(Date.now() / 1000)
  }
  return Cypress._.toString(uuid);
})

Cypress.Commands.add('iframeLoaded', { prevSubject: 'element' },
  ($iframe) => {
    const contentWindow = $iframe.prop('contentWindow')
    return new Promise(resolve => {
        if (
            contentWindow &&
            contentWindow.document.readyState === 'complete'
        ) {
            resolve(contentWindow)
        } else {
            $iframe.on('load', () => {
                resolve(contentWindow)
            })
        }
    })
})

function setCkeditorContent(elem, content)  {
  elem.setData(content);
}

Cypress.Commands.add("type_ckeditor", (element, content) => {
    cy.window()
      .then(win => {
        cy.get('#cke_' + element.replace(/\./g, '\\.') + ' iframe.cke_wysiwyg_frame').its('0.contentWindow').should('exist')
          if (content != win.CKEDITOR.instances[element].getData()) {
            cy.wait(1000)
            setCkeditorContent(win.CKEDITOR.instances[element], content)
            cy.log(win.CKEDITOR.instances[element])
          }
      });

    cy.get('#cke_' + element.replace(/\./g, '\\.') + ' iframe.cke_wysiwyg_frame')  // "cke_wysiwyg_frame" class is used here
      .iframeLoaded()
      .then($frameWindow => {
        // Verify
        cy.wrap($frameWindow)
          .its('document')
          .its('body')
          .invoke('html')
          .should('contain', content)
      })
});

Cypress.Commands.add('sakaiCreateCourse', (username, toolNames) => {
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
    } else {
      cy.get('form[name="addCourseForm"] input[type="checkbox"]').first().click()
    }
  })

  cy.get('input#continueButton').click()
  cy.get('textarea').last().type('Cypress Testing')
  cy.get('.act input[name="continue"]').click()
  toolNames.forEach(tn => cy.get(`input#${tn}`).check().should('be.checked'));
  cy.get('.act input[name="Continue"]').click()
  cy.get('input#continueButton').click()
  cy.get('input#addSite').click()
  cy.get('#flashNotif').contains('has been created')
  cy.get('#flashNotif a')
    .should('have.attr', 'href').and('include', '/portal/site/')
    .then((href) => { return href })
})

Cypress.Commands.add("createRubric", (instructor, sakaiUrl) => {

  cy.sakaiLogin(instructor);
  cy.visit(sakaiUrl);
  cy.get('.Mrphs-toolsNav__menuitem--link').contains('Rubrics').click();

  // Create new rubric
  cy.get('.add-rubric').click();
})

Cypress.Commands.add("isNotInViewport", { prevSubject: true }, (element) => {
  const message = `Did not expect to find ${element[0].outerHTML} in viewport`;

  cy.get(element).should(($el) => {
    const bottom = Cypress.$(cy.state("window")).height();
    const rect = $el[0].getBoundingClientRect();

    if (rect.top > 0) {
      expect(rect.top).to.be.greaterThan(bottom, message);
      expect(rect.bottom).to.be.greaterThan(bottom, message);
    }
    else {
      expect(rect.top).to.be.lte(0, message);
      expect(rect.bottom).to.be.lte(0, message);
    }
  });
});

Cypress.Commands.add("isInViewport", { prevSubject: true }, (element) => {
  const message = `Expected to find ${element[0].outerHTML} in viewport`;

  cy.get(element).should(($el) => {
    const bottom = Cypress.$(cy.state("window")).height();
    const rect = $el[0].getBoundingClientRect();

    expect(rect.top).not.to.be.greaterThan(bottom, message);
    expect(rect.bottom).not.to.be.greaterThan(bottom, message);

  });
});

//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
