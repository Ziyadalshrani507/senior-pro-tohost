/// <reference types="cypress" />

describe('Search and Filtering', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/');
    
    // Login if needed
    cy.fixture('user').then((user) => {
      cy.window().then((win) => {
        win.localStorage.setItem('user', JSON.stringify(user));
        win.localStorage.setItem('token', user.token);
      });
    });
    cy.reload(); // Reload to apply the authentication
  });
  
  it('Should allow searching destinations by keyword', () => {
    // Navigate to destinations page
    cy.get('[data-testid="nav-destinations"]').click();
    
    // Enter a search term
    cy.get('[data-testid="search-input"]').type('Museum{enter}');
    
    // Verify search results contain the term
    cy.get('[data-testid="search-results-count"]').should('be.visible');
    cy.get('[data-testid="destination-card"]').should('have.length.at.least', 1);
    
    // Check that results contain the search term in name or description
    cy.get('[data-testid="destination-card"]').each(($card) => {
      cy.wrap($card).within(() => {
        cy.get('body').then($body => {
          const nameContainsTerm = $body.find('[data-testid="destination-name"]').text().toLowerCase().includes('museum');
          const descriptionContainsTerm = $body.find('[data-testid="destination-description"]').text().toLowerCase().includes('museum');
          expect(nameContainsTerm || descriptionContainsTerm).to.be.true;
        });
      });
    });
  });
  
  it('Should allow filtering destinations by price range', () => {
    // Navigate to destinations page
    cy.get('[data-testid="nav-destinations"]').click();
    
    // Apply price filter
    cy.get('[data-testid="price-filter"]').click();
    cy.get('[data-testid="price-range-slider"]').invoke('val', 100).trigger('change');
    cy.get('[data-testid="apply-filters-button"]').click();
    
    // Verify filtered results
    cy.get('[data-testid="destination-card"]').should('have.length.at.least', 1);
    cy.get('[data-testid="destination-card"]').each(($card) => {
      cy.wrap($card).within(() => {
        cy.get('[data-testid="destination-price"]').invoke('text').then(text => {
          // Extract price number from text
          const priceMatch = text.match(/\d+/);
          if (priceMatch) {
            const price = parseInt(priceMatch[0]);
            expect(price).to.be.at.most(100);
          }
        });
      });
    });
  });
  
  it('Should allow filtering destinations by category', () => {
    // Navigate to destinations page
    cy.get('[data-testid="nav-destinations"]').click();
    
    // Apply category filter
    cy.get('[data-testid="category-filter"]').click();
    cy.get('[data-testid="category-option-Family-friendly"]').click();
    
    // Verify filtered results
    cy.get('[data-testid="destination-card"]').should('have.length.at.least', 1);
    cy.get('[data-testid="destination-card"]').each(($card) => {
      cy.wrap($card).within(() => {
        cy.get('[data-testid="destination-categories"]').should('contain', 'Family-friendly');
      });
    });
  });
  
  it('Should allow searching restaurants by cuisine', () => {
    // Navigate to restaurants page
    cy.get('[data-testid="nav-restaurants"]').click();
    
    // Apply cuisine filter
    cy.get('[data-testid="cuisine-filter"]').click();
    cy.get('[data-testid="cuisine-option-Italian"]').click();
    
    // Verify filtered results
    cy.get('[data-testid="restaurant-card"]').should('have.length.at.least', 1);
    cy.get('[data-testid="restaurant-card"]').each(($card) => {
      cy.wrap($card).within(() => {
        cy.get('[data-testid="restaurant-cuisine"]').should('contain', 'Italian');
      });
    });
  });
  
  it('Should allow filtering hotels by star rating', () => {
    // Navigate to hotels page
    cy.get('[data-testid="nav-hotels"]').click();
    
    // Apply star rating filter
    cy.get('[data-testid="star-rating-filter"]').click();
    cy.get('[data-testid="star-rating-5"]').click();
    
    // Verify filtered results
    cy.get('[data-testid="hotel-card"]').should('have.length.at.least', 1);
    cy.get('[data-testid="hotel-card"]').each(($card) => {
      cy.wrap($card).within(() => {
        cy.get('[data-testid="hotel-stars"]').should('contain', '5');
      });
    });
  });
  
  it('Should combine multiple filters correctly', () => {
    // Navigate to destinations page
    cy.get('[data-testid="nav-destinations"]').click();
    
    // Apply multiple filters
    cy.get('[data-testid="city-filter"]').click();
    cy.get('[data-testid="city-option-Riyadh"]').click();
    
    cy.get('[data-testid="type-filter"]').click();
    cy.get('[data-testid="type-option-Cultural"]').click();
    
    cy.get('[data-testid="price-filter"]').click();
    cy.get('[data-testid="price-range-slider"]').invoke('val', 200).trigger('change');
    
    cy.get('[data-testid="apply-filters-button"]').click();
    
    // Verify filtered results meet all criteria
    cy.get('[data-testid="destination-card"]').each(($card) => {
      cy.wrap($card).within(() => {
        cy.get('[data-testid="destination-city"]').should('contain', 'Riyadh');
        cy.get('[data-testid="destination-type"]').should('contain', 'Cultural');
        cy.get('[data-testid="destination-price"]').invoke('text').then(text => {
          // Extract price number from text
          const priceMatch = text.match(/\d+/);
          if (priceMatch) {
            const price = parseInt(priceMatch[0]);
            expect(price).to.be.at.most(200);
          }
        });
      });
    });
  });
  
  it('Should clear filters when reset button is clicked', () => {
    // Navigate to destinations page
    cy.get('[data-testid="nav-destinations"]').click();
    
    // Count initial number of results
    cy.get('[data-testid="destination-card"]').its('length').then((initialCount) => {
      
      // Apply a restrictive filter
      cy.get('[data-testid="city-filter"]').click();
      cy.get('[data-testid="city-option-Medina"]').click();
      cy.get('[data-testid="apply-filters-button"]').click();
      
      // Verify fewer results than before
      cy.get('[data-testid="destination-card"]').its('length').should('be.lte', initialCount);
      
      // Clear filters
      cy.get('[data-testid="reset-filters-button"]').click();
      
      // Verify all results are visible again
      cy.get('[data-testid="destination-card"]').its('length').should('eq', initialCount);
    });
  });
});
