
describe('Logging In - Instructor', function () {
  // we can use these values to log in
  const username = 'instructor1'
  const password = 'sakai'

  context('Unauthorized', function () {
    it('is forced to auth when no session', function () {
      // we must have a valid session cookie to be logged
      // in else we are redirected to /unauthorized
      cy.visit('/portal/site/!admin')
      cy.get('h1').should(
        'contain',
        'Login Required'
      )
    })
  })

  context('HTML form submission', function () {
    beforeEach(function () {
      cy.visit('/portal/')
    })

    it('displays errors on login', function () {
      // incorrect username on purpose
      cy.get('input[name=eid]').type('jane.lae')
      cy.get('input[name=pw]').type('password123{enter}')

      // we should have visible errors now
      cy.get('div.alertMessage')
      .should('be.visible')
      .and('contain', 'Invalid login')

      // and still be on the same URL
      cy.url().should('include', '/portal')
    })

    it('redirects to /portal on success', function () {
      cy.get('input[name=eid]').type(username)
      cy.get('input[name=pw]').type(password + '{enter}')

      // we should be redirected to /portal
      cy.url().should('include', '/portal')
      cy.get('.Mrphs-userNav__subnav').should('contain', username)

      // and our cookie should be set to SAKAIID
      cy.getCookie('SAKAIID').should('exist')
    })
  })

  context('HTML form submission with cy.request', function () {
    it('can bypass the UI and yet still test log in', function () {
      // oftentimes once we have a proper e2e test around logging in
      // there is NO more reason to actually use our UI to log in users
      // doing so wastes is slow because our entire page has to load,
      // all associated resources have to load, we have to fill in the
      // form, wait for the form submission and redirection process
      //
      // with cy.request we can bypass this because it automatically gets
      // and sets cookies under the hood. This acts exactly as if the requests
      // came from the browser
      cy.request({
        method: 'POST',
        url: '/portal/', // baseUrl will be prepended to this url
        form: true, // indicates the body should be form urlencoded and sets Content-Type: application/x-www-form-urlencoded headers
        body: {
          username,
          password,
        },
      })

      // just to prove we have a session
      cy.getCookie('SAKAIID').should('exist')
    })
  })

  context('Reusable "login" custom command', function () {
    // typically we'd put this in cypress/support/commands.js
    // but because this custom command is specific to this example
    // we'll keep it here
    Cypress.Commands.add('loginByForm', (username, password) => {
      Cypress.log({
        name: 'loginByForm',
        message: `${username} | ${password}`,
      })

      return cy.request({
        method: 'POST',
        url: '/portal/xlogin',
        form: true,
        body: {
          eid: username,
          pw: password,
        },
      })
    })

    beforeEach(function () {
      // login before each test
      cy.loginByForm(username, password)
    })

    it('can visit /portal', function () {
      // after cy.request, the session cookie has been set
      // and we can visit a protected page
      cy.visit('/portal/')
      cy.get('.Mrphs-userNav__subnav').should('contain', username)
    })

    it('can visit /portal/site', function () {
      // or another protected page
      cy.visit('/portal/site/~' + username)
      cy.get('.Mrphs-toolsNav__menuitem--title').should('contain', 'Preferences')
    })

  })
})
