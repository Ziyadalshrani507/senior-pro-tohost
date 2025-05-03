/// <reference types="cypress" />

describe('Destination Browsing', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/');
    
    // If we need to log in for some tests
    cy.fixture('user').then((user) => {
      cy.window().then((win) => {
        win.localStorage.setItem('user', JSON.stringify(user));
        win.localStorage.setItem('token', user.token);
      });
    });
    cy.reload(); // Reload to apply the authentication
  });
  
  it('Should display destinations on the homepage', () => {
    // Check for destination section
    cy.get('[data-testid="featured-destinations"]').should('be.visible');
    cy.get('[data-testid="destination-card"]').should('have.length.at.least', 1);
    
    // Check basic destination card elements
    cy.get('[data-testid="destination-card"]').first().within(() => {
      cy.get('[data-testid="destination-name"]').should('be.visible');
      cy.get('[data-testid="destination-image"]').should('be.visible');
      cy.get('[data-testid="destination-city"]').should('be.visible');
      cy.get('[data-testid="destination-type"]').should('be.visible');
    });
  });
  
  it('Should allow filtering destinations by city', () => {
    // Navigate to destinations page
    cy.get('[data-testid="nav-destinations"]').click();
    cy.url().should('include', '/destinations');
    
    // Select a city from the filter
    cy.get('[data-testid="city-filter"]').click();
    cy.get('[data-testid="city-option-Riyadh"]').click();
    
    // Verify filtered results
    cy.get('[data-testid="destination-card"]').should('have.length.at.least', 1);
    cy.get('[data-testid="destination-city"]').each(($city) => {
      expect($city.text()).to.include('Riyadh');
    });
  });
  
  it('Should allow filtering destinations by type', () => {
    // Navigate to destinations page
    cy.get('[data-testid="nav-destinations"]').click();
    
    // Select a type from the filter
    cy.get('[data-testid="type-filter"]').click();
    cy.get('[data-testid="type-option-Cultural"]').click();
    
    // Verify filtered results
    cy.get('[data-testid="destination-card"]').should('have.length.at.least', 1);
    cy.get('[data-testid="destination-type"]').each(($type) => {
      expect($type.text()).to.include('Cultural');
    });
  });
  
  it('Should allow filtering destinations by multiple criteria', () => {
    // Navigate to destinations page
    cy.get('[data-testid="nav-destinations"]').click();
    
    // Apply multiple filters
    cy.get('[data-testid="city-filter"]').click();
    cy.get('[data-testid="city-option-Jeddah"]').click();
    
    cy.get('[data-testid="type-filter"]').click();
    cy.get('[data-testid="type-option-Adventure"]').click();
    
    // Verify filtered results contain both criteria
    cy.get('[data-testid="destination-card"]').should('have.length.at.least', 1);
    cy.get('[data-testid="destination-card"]').first().within(() => {
      cy.get('[data-testid="destination-city"]').should('contain', 'Jeddah');
      cy.get('[data-testid="destination-type"]').should('contain', 'Adventure');
    });
  });
  
  it('Should allow viewing destination details', () => {
    // Navigate to destinations page
    cy.get('[data-testid="nav-destinations"]').click();
    
    // Click on a destination card
    cy.get('[data-testid="destination-card"]').first().click();
    
    // Verify destination details page
    cy.url().should('include', '/destination/');
    cy.get('[data-testid="destination-detail-name"]').should('be.visible');
    cy.get('[data-testid="destination-detail-description"]').should('be.visible');
    cy.get('[data-testid="destination-detail-price"]').should('be.visible');
    cy.get('[data-testid="destination-detail-location"]').should('be.visible');
    cy.get('[data-testid="destination-detail-images"]').should('be.visible');
  });
  
  it('Should display the map with destination location', () => {
    // Navigate to destinations page and select a destination
    cy.get('[data-testid="nav-destinations"]').click();
    cy.get('[data-testid="destination-card"]').first().click();
    
    // Check map is visible
    cy.get('[data-testid="destination-map"]').should('be.visible');
    cy.get('[data-testid="destination-map-marker"]').should('be.visible');
  });
});
