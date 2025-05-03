/// <reference types="cypress" />

describe('Like Functionality', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/');
    
    // Set up login fixture
    cy.fixture('user').then((user) => {
      this.user = user;
    });
  });
  
  it('Should prompt unauthenticated users to login when trying to like a destination', () => {
    // Navigate to destinations page
    cy.get('[data-testid="nav-destinations"]').click();
    
    // Try to like a destination without being logged in
    cy.get('[data-testid="destination-card"]').first().within(() => {
      cy.get('[data-testid="like-button"]').click();
    });
    
    // Verify login prompt appears
    cy.get('[data-testid="login-prompt-modal"]').should('be.visible');
    cy.get('[data-testid="login-prompt-message"]').should('contain', 'Please log in to like destinations');
    cy.get('[data-testid="login-prompt-login-button"]').should('be.visible');
  });
  
  it('Should allow logged in users to like a destination', () => {
    // Log in first
    cy.get('[data-testid="nav-login"]').click();
    cy.get('[data-testid="input-email"]').type(this.user.email);
    cy.get('[data-testid="input-password"]').type(this.user.password);
    cy.get('[data-testid="button-login"]').click();
    
    // Navigate to destinations page
    cy.get('[data-testid="nav-destinations"]').click();
    
    // Find a destination that is not liked and like it
    cy.get('[data-testid="destination-card"]').first().within(() => {
      // Check current like status
      cy.get('[data-testid="like-button"]').then(($btn) => {
        const isLiked = $btn.hasClass('liked');
        
        if (!isLiked) {
          // Like the destination if not already liked
          cy.get('[data-testid="like-button"]').click();
          
          // Verify it's now liked
          cy.get('[data-testid="like-button"]').should('have.class', 'liked');
        } else {
          // Unlike first, then like again to test the toggle
          cy.get('[data-testid="like-button"]').click();
          cy.wait(500); // Wait for state to update
          cy.get('[data-testid="like-button"]').should('not.have.class', 'liked');
          
          // Now like it
          cy.get('[data-testid="like-button"]').click();
          cy.get('[data-testid="like-button"]').should('have.class', 'liked');
        }
      });
    });
  });
  
  it('Should allow users to unlike a destination', () => {
    // Log in first
    cy.get('[data-testid="nav-login"]').click();
    cy.get('[data-testid="input-email"]').type(this.user.email);
    cy.get('[data-testid="input-password"]').type(this.user.password);
    cy.get('[data-testid="button-login"]').click();
    
    // Navigate to destinations page
    cy.get('[data-testid="nav-destinations"]').click();
    
    // Find a destination that is liked and unlike it
    cy.get('[data-testid="destination-card"]').first().within(() => {
      cy.get('[data-testid="like-button"]').then(($btn) => {
        const isLiked = $btn.hasClass('liked');
        
        if (isLiked) {
          // Unlike the destination
          cy.get('[data-testid="like-button"]').click();
          
          // Verify it's now unliked
          cy.get('[data-testid="like-button"]').should('not.have.class', 'liked');
        } else {
          // Like it first, then unlike
          cy.get('[data-testid="like-button"]').click();
          cy.wait(500); // Wait for state to update
          cy.get('[data-testid="like-button"]').should('have.class', 'liked');
          
          // Now unlike it
          cy.get('[data-testid="like-button"]').click();
          cy.get('[data-testid="like-button"]').should('not.have.class', 'liked');
        }
      });
    });
  });
  
  it('Should display liked destinations in user profile', () => {
    // Log in first
    cy.get('[data-testid="nav-login"]').click();
    cy.get('[data-testid="input-email"]').type(this.user.email);
    cy.get('[data-testid="input-password"]').type(this.user.password);
    cy.get('[data-testid="button-login"]').click();
    
    // Navigate to destinations and like one if none are liked
    cy.get('[data-testid="nav-destinations"]').click();
    cy.get('[data-testid="destination-card"]').first().within(() => {
      cy.get('[data-testid="like-button"]').then(($btn) => {
        if (!$btn.hasClass('liked')) {
          cy.get('[data-testid="like-button"]').click();
          cy.get('[data-testid="like-button"]').should('have.class', 'liked');
        }
      });
    });
    
    // Get the name of the liked destination
    let likedDestinationName;
    cy.get('[data-testid="destination-card"]').first().within(() => {
      cy.get('[data-testid="destination-name"]').invoke('text').then(text => {
        likedDestinationName = text;
      });
    });
    
    // Navigate to user profile
    cy.get('[data-testid="user-profile-icon"]').click();
    cy.get('[data-testid="view-profile"]').click();
    
    // Verify liked destinations section is visible
    cy.get('[data-testid="liked-destinations-section"]').should('be.visible');
    
    // Verify the liked destination appears in the profile
    cy.get('[data-testid="liked-destinations-section"]').within(() => {
      cy.contains(likedDestinationName).should('be.visible');
    });
  });
  
  it('Should allow liking restaurants', () => {
    // Log in first
    cy.get('[data-testid="nav-login"]').click();
    cy.get('[data-testid="input-email"]').type(this.user.email);
    cy.get('[data-testid="input-password"]').type(this.user.password);
    cy.get('[data-testid="button-login"]').click();
    
    // Navigate to restaurants page
    cy.get('[data-testid="nav-restaurants"]').click();
    
    // Like a restaurant
    cy.get('[data-testid="restaurant-card"]').first().within(() => {
      cy.get('[data-testid="like-button"]').then(($btn) => {
        const isLiked = $btn.hasClass('liked');
        
        if (!isLiked) {
          // Like the restaurant
          cy.get('[data-testid="like-button"]').click();
          cy.get('[data-testid="like-button"]').should('have.class', 'liked');
        } else {
          // Unlike first, then like
          cy.get('[data-testid="like-button"]').click();
          cy.wait(500); // Wait for state update
          cy.get('[data-testid="like-button"]').click();
          cy.get('[data-testid="like-button"]').should('have.class', 'liked');
        }
      });
    });
  });
  
  it('Should allow liking hotels', () => {
    // Log in first
    cy.get('[data-testid="nav-login"]').click();
    cy.get('[data-testid="input-email"]').type(this.user.email);
    cy.get('[data-testid="input-password"]').type(this.user.password);
    cy.get('[data-testid="button-login"]').click();
    
    // Navigate to hotels page
    cy.get('[data-testid="nav-hotels"]').click();
    
    // Like a hotel
    cy.get('[data-testid="hotel-card"]').first().within(() => {
      cy.get('[data-testid="like-button"]').then(($btn) => {
        const isLiked = $btn.hasClass('liked');
        
        if (!isLiked) {
          // Like the hotel
          cy.get('[data-testid="like-button"]').click();
          cy.get('[data-testid="like-button"]').should('have.class', 'liked');
        } else {
          // Unlike first, then like
          cy.get('[data-testid="like-button"]').click();
          cy.wait(500); // Wait for state update
          cy.get('[data-testid="like-button"]').click();
          cy.get('[data-testid="like-button"]').should('have.class', 'liked');
        }
      });
    });
  });
  
  it('Should show aggregated likes from all categories in user profile', () => {
    // Log in first
    cy.get('[data-testid="nav-login"]').click();
    cy.get('[data-testid="input-email"]').type(this.user.email);
    cy.get('[data-testid="input-password"]').type(this.user.password);
    cy.get('[data-testid="button-login"]').click();
    
    // Navigate to user profile
    cy.get('[data-testid="user-profile-icon"]').click();
    cy.get('[data-testid="view-profile"]').click();
    
    // Verify all liked categories are visible
    cy.get('[data-testid="liked-destinations-section"]').should('be.visible');
    cy.get('[data-testid="liked-restaurants-section"]').should('be.visible');
    cy.get('[data-testid="liked-hotels-section"]').should('be.visible');
    
    // Verify there is at least one liked item across all categories
    cy.get('body').then($body => {
      const hasLikedDestination = $body.find('[data-testid="liked-destination-item"]').length > 0;
      const hasLikedRestaurant = $body.find('[data-testid="liked-restaurant-item"]').length > 0;
      const hasLikedHotel = $body.find('[data-testid="liked-hotel-item"]').length > 0;
      
      expect(hasLikedDestination || hasLikedRestaurant || hasLikedHotel).to.be.true;
    });
  });
});
