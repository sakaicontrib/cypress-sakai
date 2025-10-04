// Sign-Up (sakai.signup) – create and publish a sign-up item
describe('Sign-Up (sakai.signup)', () => {
  const instructor = 'instructor1';
  let sakaiUrl;
  const TOOL_ID = 'sakai.signup';
  const TOOL_LABEL = 'Sign-Up';
  const TOOL_ID_ESCAPED = TOOL_ID.replace(/\./g, '\\.');
  const sTitle = `Cypress Sign-Up ${Date.now()}`;
  const sLocation = 'Room 101';
  const sCategory = 'General';
  const sDescription = 'This is a Cypress-created sign-up item.';

  beforeEach(() => {
    cy.intercept('POST', 'https://www.google-analytics.com/j/collect*', (req) => { req.destroy() }).as('ga');
  });

  it('creates a site with Sign-Up', () => {
    cy.sakaiLogin(instructor);
    cy.sakaiCreateCourse(instructor, [TOOL_ID_ESCAPED]).then(url => sakaiUrl = url);
  });

  it('adds and publishes a sign-up', () => {
    cy.sakaiLogin(instructor);
    cy.visit(sakaiUrl);
    // Open via regex in case the casing differs
    cy.get('.site-list-item-collapse.collapse.show a.btn-nav').contains(/Sign-?Up/i).click();
    cy.get('#content, main, .portletBody').should('exist');

    // Click Add
    cy.get('.navIntraTool a, .navIntraTool button').contains(/^Add$/i).first().click({ force: true });

    // Title (prefer explicit name attribute, then fall back to label-based)
    cy.get('body').then($body => {
      if ($body.find('[name="meeting:name"]').length) {
        cy.get('[name="meeting:name"]').clear().type(sTitle);
      } else {
        cy.get('form').within(() => {
          cy.get('label').then($labels => {
            const $t = $labels.filter((_, el) => /title/i.test(el.textContent || ''));
            if ($t.length) {
              const forId = $t.first().attr('for');
              if (forId) cy.get(`[id="${forId}"]`).clear().type(sTitle);
              else cy.get('input[type="text"]').filter(':visible').first().clear().type(sTitle);
            } else {
              cy.get('input[type="text"]').filter(':visible').first().clear().type(sTitle);
            }
          });
        });
      }
    });

    // Location (try known JSF name first)
    cy.get('body').then($body => {
      if ($body.find('[name="meeting:customLocation"]').length) {
        cy.get('[name="meeting:customLocation"]').clear().type(sLocation);
      } else if ($body.find('[name="meeting:location"]').length) {
        cy.get('[name="meeting:location"]').clear().type(sLocation);
      } else if ($body.find('[name="meeting:selectedLocation"]').length) {
        cy.get('[name="meeting:selectedLocation"]').clear().type(sLocation);
      } else {
        cy.get('form').within(() => {
          cy.get('label').then($labels => {
            const $l = $labels.filter((_, el) => /location/i.test(el.textContent || ''));
            if ($l.length) {
              const forId = $l.first().attr('for');
              if (forId) cy.get(`[id="${forId}"]`).clear().type(sLocation);
              else cy.get('input[type="text"]').filter(':visible').eq(1).clear().type(sLocation);
            } else {
              cy.get('input[type="text"]').filter(':visible').eq(1).clear().type(sLocation);
            }
          });
        });
      }
    });

    // Category: prefer explicit JSF names first
    cy.get('body').then($body => {
      if ($body.find('[name="meeting:customCategory"]').length) {
        cy.get('[name="meeting:customCategory"]').then($el => {
          const tag = ($el.prop('tagName') || '').toLowerCase();
          if (tag === 'select') cy.wrap($el).select(sCategory, { force: true });
          else cy.wrap($el).clear().type(sCategory);
        });
      } else if ($body.find('[name="meeting:category"]').length) {
        cy.get('[name="meeting:category"]').then($el => {
          const tag = ($el.prop('tagName') || '').toLowerCase();
          if (tag === 'select') cy.wrap($el).select(sCategory, { force: true });
          else cy.wrap($el).clear().type(sCategory);
        });
      } else {
        // Fallback to label-based or first visible select
        cy.get('form').within(() => {
          cy.get('label').then($labels => {
            const $c = $labels.filter((_, el) => /category/i.test(el.textContent || ''));
            if ($c.length) {
              const forId = $c.first().attr('for');
              if (forId) {
                cy.get(`[id="${forId}"]`).then($el => {
                  const tag = ($el.prop('tagName') || '').toLowerCase();
                  if (tag === 'select') cy.wrap($el).select(sCategory, { force: true });
                  else cy.wrap($el).clear().type(sCategory);
                });
              } else {
                cy.get('select').filter(':visible').first().select(sCategory, { force: true });
              }
            } else {
              cy.get('select').filter(':visible').first().select(sCategory, { force: true });
            }
          });
        });
      }
    });

    // Description via CKEditor or fallback
    cy.window().then((win) => {
      const hasCk = !!(win.CKEDITOR && Object.keys(win.CKEDITOR.instances || {}).length);
      if (hasCk) {
        const editorId = Object.keys(win.CKEDITOR.instances)[0];
        cy.wrap(editorId).window().then((w) => cy.typetype(w, editorId, `<p>${sDescription}</p>`));
      } else {
        cy.get('textarea, [contenteditable="true"], div[role="textbox"]').filter(':visible').first()
          .type(sDescription, { parseSpecialCharSequences: false });
      }
    });

    // Next
    cy.contains('button, input[type="submit"], .act button, .act input', /^Next$/i).first().click({ force: true });

    // Publish on the confirmation step
    cy.contains('button, input[type="submit"], .act button, .act input', /Publish/i)
      .first()
      .click({ force: true });

    // Verify the new sign-up appears
    cy.contains(sTitle).should('exist');
  });
});
