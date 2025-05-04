/// <reference types="cypress" />

describe('Authentication Flow', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/');
  });

  it('Should allow a user to sign up successfully', () => {
    // Navigate to signup page
    cy.get('[data-testid="nav-signup"]').click();
    cy.url().should('include', '/signup');

    // Generate a random email to ensure unique test runs
    const randomEmail = `testuser${Math.floor(Math.random() * 100000)}@example.com`;

    // Fill out the signup form
    cy.get('[data-testid="input-firstName"]').type('Test');
    cy.get('[data-testid="input-lastName"]').type('User');
    cy.get('[data-testid="input-email"]').type(randomEmail);
    cy.get('[data-testid="input-password"]').type('Password123!');
    cy.get('[data-testid="input-confirmPassword"]').type('Password123!');
    cy.get('[data-testid="select-gender"]').select('male');

    // Submit the form
    cy.get('[data-testid="button-signup"]').click();

    // Verify successful signup - should redirect to login or home
    cy.url().should('not.include', '/signup');
    cy.get('[data-testid="signup-success-message"]').should('be.visible');
  });

  it('Should prevent signup with invalid data', () => {
    // Navigate to signup page
    cy.get('[data-testid="nav-signup"]').click();

    // Fill out the form with invalid data (password mismatch)
    cy.get('[data-testid="input-firstName"]').type('Test');
    cy.get('[data-testid="input-lastName"]').type('User');
    cy.get('[data-testid="input-email"]').type('testuser@example.com');
    cy.get('[data-testid="input-password"]').type('Password123!');
    cy.get('[data-testid="input-confirmPassword"]').type('DifferentPassword!');
    cy.get('[data-testid="select-gender"]').select('male');

    // Submit the form
    cy.get('[data-testid="button-signup"]').click();

    // Verify error message
    cy.get('[data-testid="form-error-message"]').should('be.visible');
    cy.get('[data-testid="form-error-message"]').should('contain', 'Passwords do not match');
    cy.url().should('include', '/signup'); // Should stay on signup page
  });

  it('Should allow a user to log in successfully', () => {
    // Navigate to login page
    cy.get('[data-testid="nav-login"]').click();
    cy.url().should('include', '/login');

    // Use test account credentials (would be set up in test fixtures or environment)
    cy.get('[data-testid="input-email"]').type('test@example.com');
    cy.get('[data-testid="input-password"]').type('Password123!');

    // Submit the form
    cy.get('[data-testid="button-login"]').click();

    // Verify successful login
    cy.url().should('not.include', '/login');
    cy.get('[data-testid="user-profile-icon"]').should('be.visible');
    cy.get('[data-testid="welcome-message"]').should('contain', 'Welcome');
  });

  it('Should show appropriate error for invalid login', () => {
    // Navigate to login page
    cy.get('[data-testid="nav-login"]').click();

    // Use invalid credentials
    cy.get('[data-testid="input-email"]').type('wrong@example.com');
    cy.get('[data-testid="input-password"]').type('WrongPassword123!');

    // Submit the form
    cy.get('[data-testid="button-login"]').click();

    // Verify error message
    cy.get('[data-testid="login-error-message"]').should('be.visible');
    cy.get('[data-testid="login-error-message"]').should('contain', 'Invalid credentials');
    cy.url().should('include', '/login'); // Should stay on login page
  });

  it('Should allow a user to log out', () => {
    // First log in
    cy.get('[data-testid="nav-login"]').click();
    cy.get('[data-testid="input-email"]').type('test@example.com');
    cy.get('[data-testid="input-password"]').type('Password123!');
    cy.get('[data-testid="button-login"]').click();

    // Verify login successful
    cy.get('[data-testid="user-profile-icon"]').should('be.visible');

    // Now log out
    cy.get('[data-testid="user-profile-icon"]').click();
    cy.get('[data-testid="logout-button"]').click();

    // Verify logged out - login/signup buttons should be visible again
    cy.get('[data-testid="nav-login"]').should('be.visible');
    cy.get('[data-testid="nav-signup"]').should('be.visible');
    cy.get('[data-testid="user-profile-icon"]').should('not.exist');
  });
});
