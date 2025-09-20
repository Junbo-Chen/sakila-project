describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear any existing sessions
    cy.clearSession()
    
    // Mock successful authentication responses
    cy.intercept('POST', '/auth/login', (req) => {
      const { email, password, role } = req.body
      
      // Mock successful staff login
      if (email === 'staff@test.com' && password === 'password123' && role === 'staff') {
        req.reply({
          statusCode: 302,
          headers: {
            'location': '/staff/dashboard'
          }
        })
      }
      // Mock successful customer login  
      else if (email === 'customer@test.com' && password === 'password123' && role === 'customer') {
        req.reply({
          statusCode: 302,
          headers: {
            'location': '/customer/dashboard'
          }
        })
      }
      // Mock validation errors
      else if (!password) {
        req.reply({
          statusCode: 200,
          body: `
            <html>
              <body>
                <div class="alert-danger">Wachtwoord is verplicht</div>
                <form>
                  <input id="email" required />
                  <input id="password" required />
                  <select id="role" required>
                    <option value="staff">Staff</option>
                    <option value="customer">Customer</option>
                  </select>
                  <button type="submit">Inloggen</button>
                </form>
              </body>
            </html>
          `
        })
      }
      // Mock invalid credentials
      else {
        req.reply({
          statusCode: 200,
          body: `
            <html>
              <body>
                <div class="alert-danger">Invalid credentials</div>
                <form>
                  <input id="email" required />
                  <input id="password" required />
                  <select id="role" required>
                    <option value="staff">Staff</option>
                    <option value="customer">Customer</option>
                  </select>
                  <button type="submit">Inloggen</button>
                </form>
              </body>
            </html>
          `
        })
      }
    }).as('loginRequest')

    // Mock dashboard pages
    cy.intercept('GET', '/staff/dashboard', {
      statusCode: 200,
      body: `
        <html>
          <body>
            <h1>Staff Dashboard</h1>
            <div>Welcome to staff area</div>
          </body>
        </html>
      `
    })

    cy.intercept('GET', '/customer/dashboard', {
      statusCode: 200,
      body: `
        <html>
          <body>
            <h1>Welkom</h1>
            <div>Welcome to customer area</div>
          </body>
        </html>
      `
    })

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
      cy.url().should('include', '/auth/login')
    })
  })

  describe('Staff Login', () => {
    beforeEach(() => {
      cy.get('#role').select('staff')
    })

    it('should login successfully with valid staff credentials', () => {
      const staffEmail = Cypress.env('STAFF_EMAIL')
      const staffPassword = Cypress.env('STAFF_PASSWORD')
      
      expect(staffEmail, 'Staff email should be defined').to.not.be.undefined
      expect(staffPassword, 'Staff password should be defined').to.not.be.undefined
      
      cy.get('#email').type(staffEmail)
      cy.get('#password').type(staffPassword)
      cy.get('form').submit()
      
      cy.wait('@loginRequest')
      cy.url().should('include', '/staff/dashboard')
      cy.get('h1').should('contain', 'Staff Dashboard')
    })

    it('should show error for invalid staff credentials', () => {
      cy.get('#email').type('invalid@email.com')
      cy.get('#password').type('wrongpassword')
      cy.get('form').submit()
      
      cy.wait('@loginRequest')
      cy.get('.alert-danger').should('be.visible')
    })

    it('should require password for staff login', () => {
      const staffEmail = Cypress.env('STAFF_EMAIL')
      expect(staffEmail, 'Staff email should be defined').to.not.be.undefined
      
      cy.get('#email').type(staffEmail)
      cy.get('form').submit()
      
      cy.wait('@loginRequest')
      cy.get('.alert-danger').should('contain', 'Wachtwoord is verplicht')
    })
  })

  describe('Customer Login', () => {
    beforeEach(() => {
      cy.get('#role').select('customer')
    })

    it('should login successfully with valid customer credentials', () => {
      const customerEmail = Cypress.env('CUSTOMER_EMAIL')
      const customerPassword = Cypress.env('CUSTOMER_PASSWORD')
      
      expect(customerEmail, 'Customer email should be defined').to.not.be.undefined
      expect(customerPassword, 'Customer password should be defined').to.not.be.undefined
      
      cy.get('#email').type(customerEmail)
      cy.get('#password').type(customerPassword)
      cy.get('form').submit()
      
      cy.wait('@loginRequest')
      cy.url().should('include', '/customer/dashboard')
      cy.get('h1').should('contain', 'Welkom')
    })

    it('should show error for invalid customer credentials', () => {
      cy.get('#email').type('nonexistent@customer.com')
      cy.get('#password').type('wrongpassword')
      cy.get('form').submit()
      
      cy.wait('@loginRequest')
      cy.get('.alert-danger').should('be.visible')
    })

    it('should require password for customer login', () => {
      const customerEmail = Cypress.env('CUSTOMER_EMAIL')
      expect(customerEmail, 'Customer email should be defined').to.not.be.undefined
      
      cy.get('#email').type(customerEmail)
      cy.get('form').submit()
      
      cy.wait('@loginRequest')
      cy.get('.alert-danger').should('contain', 'Wachtwoord is verplicht')
    })

    it('should show error for wrong customer password', () => {
      const customerEmail = Cypress.env('CUSTOMER_EMAIL')
      expect(customerEmail, 'Customer email should be defined').to.not.be.undefined
      
      cy.get('#email').type(customerEmail)
      cy.get('#password').type('wrongpassword123')
      cy.get('form').submit()
      
      cy.wait('@loginRequest')
      cy.get('.alert-danger').should('be.visible')
    })
  })

  describe('Session Management', () => {
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