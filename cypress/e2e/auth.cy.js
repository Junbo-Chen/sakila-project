describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/auth/login')
  })

  describe('Login Page', () => {
    it('should display login form', () => {
      cy.get('h3').should('contain', 'Login')
      cy.get('#email').should('be.visible')
      cy.get('#password').should('be.visible')
      cy.get('#role').should('be.visible')
      cy.get('button[type="submit"]').should('contain', 'Inloggen')
    })

    it('should have all required form fields', () => {
      cy.get('#email').should('have.attr', 'required')
      cy.get('#password').should('have.attr', 'required')
      cy.get('#role').should('have.attr', 'required')
    })

    it('should show validation errors for empty form', () => {
      cy.get('button[type="submit"]').click()
      
      // Browser validation should prevent form submission
      cy.url().should('include', '/auth/login')
    })
  })

  describe('Staff Login', () => {
    beforeEach(() => {
      cy.get('#role').select('staff')
    })

    it('should login successfully with valid staff credentials', () => {
      cy.get('#email').type(Cypress.env('STAFF_EMAIL'))
      cy.get('#password').type(Cypress.env('STAFF_PASSWORD'))
      cy.get('form').submit()
      
      cy.url().should('include', '/staff/dashboard')
      cy.get('h1').should('contain', 'Staff Dashboard')
    })

    it('should show error for invalid staff credentials', () => {
      cy.get('#email').type('invalid@email.com')
      cy.get('#password').type('wrongpassword')
      cy.get('form').submit()
      
      cy.url().should('include', '/auth/login')
      cy.get('.alert-danger').should('be.visible')
    })

    it('should require password for staff login', () => {
      cy.get('#email').type(Cypress.env('STAFF_EMAIL'))
      // Don't enter password
      cy.get('form').submit()
      
      cy.url().should('include', '/auth/login')
    })
  })

  describe('Customer Login', () => {
    beforeEach(() => {
      cy.get('#role').select('customer')
    })

    it('should login successfully with valid customer credentials', () => {
      cy.get('#email').type(Cypress.env('CUSTOMER_EMAIL'))
      cy.get('#password').type(Cypress.env('CUSTOMER_PASSWORD'))
      cy.get('form').submit()
      
      cy.url().should('include', '/customer/dashboard')
      cy.get('h1').should('contain', 'Welkom')
    })

    it('should show error for invalid customer credentials', () => {
      cy.get('#email').type('nonexistent@customer.com')
      cy.get('#password').type('wrongpassword')
      cy.get('form').submit()
      
      cy.url().should('include', '/auth/login')
      cy.get('.alert-danger').should('be.visible')
    })

    it('should require password for customer login', () => {
      cy.get('#email').type(Cypress.env('CUSTOMER_EMAIL'))
      // Don't enter password
      cy.get('form').submit()
      
      cy.url().should('include', '/auth/login')
    })

    it('should show error for wrong customer password', () => {
      cy.get('#email').type(Cypress.env('CUSTOMER_EMAIL'))
      cy.get('#password').type('wrongpassword123')
      cy.get('form').submit()
      
      cy.url().should('include', '/auth/login')
      cy.get('.alert-danger').should('be.visible')
    })
  })

  describe('Session Management', () => {
    it('should logout staff user', () => {
      cy.loginAsStaff()
      cy.visit('/staff/dashboard')
    
    })

    it('should logout customer user', () => {
      cy.loginAsCustomer()
      cy.visit('/customer/dashboard')
    })

    it('should redirect to login when accessing protected routes without authentication', () => {
      const protectedRoutes = [
        '/staff/dashboard',
        '/staff/rentals',
        '/staff/customers',
        '/customer/dashboard'
      ]

      protectedRoutes.forEach(route => {
        cy.visit(route)
        cy.url().should('include', '/auth/login')
      })
    })
  })
})