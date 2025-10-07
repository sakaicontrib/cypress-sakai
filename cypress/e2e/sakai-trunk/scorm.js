// Exercises the SCORM Player tool by uploading a sample package as an
// instructor and verifying that students can see the published activity.
describe('SCORM Player', () => {
  const instructor = 'instructor1';
  const student = 'student0011';
  const scormZip = 'RuntimeBasicCalls_SCORM20043rdEdition.zip';
  const scormTitle = 'Golf Explained';
  let sakaiUrl;

  it('creates a site with the SCORM Player tool', () => {
    cy.sakaiLogin(instructor);
    if (!sakaiUrl) {
      cy.sakaiCreateCourse(instructor, [
        'sakai\\.scorm\\.tool'
      ]).then((url) => {
        sakaiUrl = url;
      });
    }
  });

  it('uploads a SCORM package as the instructor', () => {
    cy.sakaiLogin(instructor);
    cy.visit(sakaiUrl);
    cy.sakaiToolClick('SCORM Player');

    cy.contains('a, button', 'Upload New Content Package', { timeout: 20000 }).click();

    cy.get('input[type="file"]', { timeout: 20000 })
      .should('exist')
      .selectFile(scormZip, { force: true });

    cy.contains('button, input[type="submit"], a', 'Upload File', { timeout: 20000 })
      .click({ force: true });

    // Uploading the sample package can take a bit, so give it plenty of time.
    cy.contains('a', scormTitle, { timeout: 60000 }).should('be.visible');
  });

  it('shows the SCORM package to enrolled students', () => {
    cy.sakaiLogin(student);
    cy.visit(sakaiUrl);
    cy.sakaiToolClick('SCORM Player');

    cy.contains('a', scormTitle, { timeout: 20000 }).should('be.visible');

    // The launch link opens a new window in the live UI. We simply confirm
    // the link is available so the student can begin the attempt manually.
  });
});
