describe('Customer Management', () => {
  beforeEach(() => {
    cy.loginAsStaff()
    cy.navigateToCustomers()
  })

  describe('Customers List Page', () => {
    it('should display customers page correctly', () => {
      cy.get('h2').should('contain', 'Klanten Beheer')
      cy.get('.btn-success').should('exist')
      cy.get('#customer_search').should('be.visible')
    })

    it('should display customers table when customers exist', () => {
      cy.get('body').then($body => {
        if ($body.find('table').length > 0) {
          cy.get('table').should('be.visible')
          cy.get('thead th').should('contain', 'ID')
          cy.get('thead th').should('contain', 'Naam')
          cy.get('thead th').should('contain', 'Email')
          cy.get('thead th').should('contain', 'Adres')
          cy.get('thead th').should('contain', 'Status')
          cy.get('thead th').should('contain', 'Totaal Verhuur')
          cy.get('thead th').should('contain', 'Laatste Verhuur')
          cy.get('thead th').should('contain', 'Acties')
        }
      })
    })

    it('should show customer status badges correctly', () => {
      cy.get('.badge.bg-success').should('contain', 'Actief')
      cy.get('.badge.bg-danger').should('contain', 'Inactief')
    })

    it('should display rental count badges', () => {
      cy.get('.badge.bg-info').should('exist')
    })

    it('should show appropriate message when no customers exist', () => {
      cy.get('body').then($body => {
        if ($body.find('.alert-info').length > 0) {
          cy.get('.alert-info').should('contain', 'Geen klanten gevonden')
        }
      })
    })
  })

  describe('Customer Search', () => {
    it('should search customers by name', () => {
      cy.get('#customer_search').type('Smith')
      cy.get('button[onclick="searchCustomers()"]').click()
      
      cy.get('#search_results').should('be.visible')
    })

    it('should search customers by email', () => {
      cy.get('#customer_search').type('mary@example.com')
      cy.get('button[onclick="searchCustomers()"]').click()
      
      cy.get('#search_results').should('be.visible')
    })

    it('should show search results', () => {
      cy.get('#customer_search').type('Mary')
      cy.get('button[onclick="searchCustomers()"]').click()
      
      cy.get('#search_results .list-group-item').should('exist')
    })

    it('should support enter key for search', () => {
      cy.get('#customer_search').type('Smith{enter}')
      cy.get('#search_results').should('be.visible')
    })

    it('should show no results message when appropriate', () => {
      cy.get('#customer_search').type('NonexistentCustomer123')
      cy.get('button[onclick="searchCustomers()"]').click()
      
      cy.get('#search_results').should('contain', 'Geen klanten gevonden')
    })
  })

  describe('Customer Details Modal', () => {
    it('should open customer details modal', () => {
      cy.get('tbody tr').first().then($row => {
        if ($row.find('.btn-info').length > 0) {
          cy.wrap($row).find('.btn-info').click()
          cy.get('#customerDetailsModal').should('be.visible')
          cy.get('.modal-title').should('contain', 'Klant Details')
        }
      })
    })

    it('should display customer information in modal', () => {
      cy.get('tbody tr').first().then($row => {
        if ($row.find('.btn-info').length > 0) {
          cy.wrap($row).find('.btn-info').click()
          cy.get('#customerDetailsContent').should('be.visible')
          cy.get('#customerDetailsContent').should('contain', 'ID:')
          cy.get('#customerDetailsContent').should('contain', 'Naam:')
          cy.get('#customerDetailsContent').should('contain', 'Email:')
        }
      })
    })


    it('should handle customer details loading error', () => {
      cy.intercept('GET', '/staff/customer/*', { statusCode: 500 }).as('getCustomerError')
      
      cy.get('tbody tr').first().then($row => {
        if ($row.find('.btn-info').length > 0) {
          cy.wrap($row).find('.btn-info').click()
          cy.wait('@getCustomerError')
          cy.get('#customerDetailsContent').should('contain', 'Kon klantgegevens niet laden')
        }
      })
    })
  })

  describe('Create New Customer', () => {
    it('should open create customer modal', () => {
      cy.get('[data-bs-target="#createCustomerModal"]').click()
      cy.get('#createCustomerModal').should('be.visible')
      cy.get('.modal-title').should('contain', 'Nieuwe Klant')
    })

    it('should display all required form fields', () => {
      cy.get('[data-bs-target="#createCustomerModal"]').click()
      cy.get('input[name="first_name"]').should('be.visible')
      cy.get('input[name="last_name"]').should('be.visible')
      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="password"]').should('be.visible')
      cy.get('input[name="address"]').should('be.visible')
      cy.get('input[name="city"]').should('be.visible')
      cy.get('input[name="country"]').should('be.visible')
    })

    it('should create customer successfully', () => {
      const customerData = {
        firstName: `Test${Date.now()}`,
        lastName: `Customer${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password: 'testpassword',
        address: '123 Test Street',
        city: 'Test City',
        country: 'Test Country'
      }

      cy.createCustomer(customerData)
      cy.url().should('include', '/staff/customers')
    })

    it('should validate required fields', () => {
      cy.get('[data-bs-target="#createCustomerModal"]').click()
      cy.get('button[type="submit"]').click()
      
      // Form validation should prevent submission
      cy.get('#createCustomerModal').should('be.visible')
    })
  })

  describe('Edit Customer', () => {
    it('should navigate to customer edit page', () => {
      cy.get('tbody tr').first().then($row => {
        if ($row.find('.btn-warning').length > 0) {
          cy.wrap($row).find('.btn-warning').click()
          cy.url().should('include', '/staff/customer/')
          cy.url().should('include', '/edit')
          cy.get('h2').should('contain', 'Klant Bewerken')
        }
      })
    })

    it('should display customer edit form', () => {
      cy.visit('/staff/customer/1/edit')
      
      cy.get('input[name="first_name"]').should('be.visible')
      cy.get('input[name="last_name"]').should('be.visible')
      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="address"]').should('be.visible')
      cy.get('input[name="city"]').should('be.visible')
      cy.get('input[name="country"]').should('be.visible')
      cy.get('input[name="active"]').should('be.visible')
    })

    it('should navigate back to customers list', () => {
      cy.visit('/staff/customer/1/edit')
      cy.get('.btn-secondary').contains('Terug naar Klanten').click()
      cy.url().should('include', '/staff/customers')
    })

  })

  describe('Customer Status Management', () => {

    it('should display correct status badge in list', () => {
      cy.get('.badge.bg-success').should('contain', 'Actief')
      cy.get('.badge.bg-danger').should('contain', 'Inactief')
    })
  })

  describe('Search Results Interaction', () => {
    it('should show customer details from search results', () => {
      cy.get('#customer_search').type('Mary')
      cy.get('button[onclick="searchCustomers()"]').click()
      
      cy.get('#search_results .btn-info').first().then($btn => {
        if ($btn.length > 0) {
          cy.wrap($btn).click()
          cy.get('#customerDetailsModal').should('be.visible')
        }
      })
    })

    it('should navigate to edit from search results', () => {
      cy.get('#customer_search').type('Mary')
      cy.get('button[onclick="searchCustomers()"]').click()
      
      cy.get('#search_results .btn-warning').first().then($btn => {
        if ($btn.length > 0) {
          cy.wrap($btn).click()
          cy.url().should('include', '/staff/customer/')
          cy.url().should('include', '/edit')
        }
      })
    })
  })

  describe('Data Validation', () => {
    beforeEach(() => {
      cy.get('[data-bs-target="#createCustomerModal"]').click()
    })

    it('should validate email format', () => {
      cy.get('input[name="email"]').type('invalid-email')
      cy.get('button[type="submit"]').click()
      
      // Browser validation should catch invalid email
      cy.get('#createCustomerModal').should('be.visible')
    })

    it('should require all mandatory fields', () => {
      cy.get('input[name="first_name"]').should('have.attr', 'required')
      cy.get('input[name="last_name"]').should('have.attr', 'required')
      cy.get('input[name="email"]').should('have.attr', 'required')
      cy.get('input[name="password"]').should('have.attr', 'required')
    })
  })

  describe('Responsive Design', () => {
    it('should be responsive on mobile', () => {
      cy.viewport('iphone-6')
      cy.get('.table-responsive').should('exist')
      cy.get('.btn-group').should('exist')
    })

    it('should stack form elements on small screens', () => {
      cy.viewport('iphone-6')
      cy.visit('/staff/customer/1/edit')
      cy.get('.col-md-6').should('exist')
    })

    it('should handle modal on mobile', () => {
      cy.viewport('iphone-6')
      cy.get('[data-bs-target="#createCustomerModal"]').click()
      cy.get('#createCustomerModal').should('be.visible')
      cy.get('.modal-dialog').should('be.visible')
    })
  })

  describe('Performance', () => {
    it('should load customers list efficiently', () => {
      const startTime = Date.now()
      cy.visit('/staff/customers').then(() => {
        const loadTime = Date.now() - startTime
        expect(loadTime).to.be.lessThan(5000) // 5 seconds max
      })
    })

    it('should debounce search input', () => {
      let searchCount = 0
      cy.intercept('GET', '/staff/customers/search*', (req) => {
        searchCount++
      }).as('search')
      
      cy.get('#customer_search').type('test', { delay: 100 })
      cy.wait(1000) // Wait for debounce
      
      // Should make fewer requests than characters typed
      expect(searchCount).to.be.lessThan(4)
    })
  })

})