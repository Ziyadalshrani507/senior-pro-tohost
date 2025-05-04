// ***********************************************
// This file defines custom commands for Cypress
// https://on.cypress.io/custom-commands
// ***********************************************

// Add safety check command to verify we're using the test database
Cypress.Commands.add('verifyTestEnvironment', () => {
  // Call a special endpoint that confirms we're using the in-memory database
  cy.request('/api/test-environment-check')
    .its('body')
    .then((response) => {
      if (!response.isTestEnvironment) {
        throw new Error('⛔ SAFETY VIOLATION: Not using isolated test environment');
      } else {
        cy.log('✅ Confirmed using isolated test environment');
      }
    });
});

// Login command for test user
Cypress.Commands.add('login', (email = 'user@test.com', password = 'Password123!') => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type(email);
    cy.get('[data-testid="input-password"]').type(password);
    cy.get('[data-testid="button-login"]').click();
    cy.url().should('not.include', '/login');
  });
});

// Simulate authentication via local storage
Cypress.Commands.add('loginByLocalStorage', () => {
  cy.fixture('user').then((user) => {
    window.localStorage.setItem('user', JSON.stringify(user));
    window.localStorage.setItem('token', user.token);
  });
  cy.reload();
});
