describe('Smoke Tests - Basic Functionality', () => {
  it('should load the home page', () => {
    cy.visit('/')
    cy.get('h1').should('contain', 'Welcome to Sakila Dashboard')
    cy.get('.btn').contains('Login').should('be.visible')
  })

  it('should load the login page', () => {
    cy.visit('/auth/login')
    cy.get('h3').should('contain', 'Login')
    cy.get('#email').should('be.visible')
    cy.get('#password').should('be.visible')
    cy.get('#role').should('be.visible')
  })

  it('should display actors page (requires staff login)', () => {
    cy.loginAsStaff()
    cy.visit('/actor')
    cy.get('h2').should('contain', 'Actors')
  })

  it('should display staff dashboard after login', () => {
    cy.loginAsStaff()
    cy.visit('/staff/dashboard')
    cy.get('h1').should('contain', 'Staff Dashboard')
    cy.get('.card').should('have.length.at.least', 4) // Dashboard stats cards
  })

  it('should protect staff routes from unauthorized access', () => {
    cy.visit('/staff/dashboard')
    cy.url().should('include', '/auth/login')
  })

  it('should handle navigation between pages', () => {
    cy.loginAsStaff()
    cy.visit('/staff/dashboard')
    
    // Navigate to customers
    cy.get('a').contains('Klanten Beheer').click()
    cy.url().should('include', '/staff/customers')
    cy.get('h2').should('contain', 'Klanten Beheer')
    
    // Navigate back to dashboard via navbar
    cy.get('.navbar-brand').click()
    cy.url().should('include', '/staff/dashboard')
  })

  it('should logout successfully', () => {
    cy.loginAsStaff()
    cy.visit('/staff/dashboard')
    
    cy.get('a').contains('Logout').click()
    cy.url().should('include', '/auth/login')
  })
})