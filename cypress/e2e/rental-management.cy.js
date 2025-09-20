describe('Rental Management', () => {
  beforeEach(() => {
    cy.loginAsStaff()
  })

  describe('Active Rentals Page', () => {
    beforeEach(() => {
      cy.navigateToRentals()
    })

    it('should display the rentals page correctly', () => {
      cy.get('h2').should('contain', 'Actieve Verhuur')
      cy.get('.btn-success').should('contain', 'Nieuwe Verhuur')
    })

    it('should display rentals table when rentals exist', () => {
      cy.get('body').then($body => {
        if ($body.find('table').length > 0) {
          cy.get('table').should('be.visible')
          cy.get('thead th').should('contain', 'Rental ID')
          cy.get('thead th').should('contain', 'Klant')
          cy.get('thead th').should('contain', 'Film')
          cy.get('thead th').should('contain', 'Verhuur Datum')
          cy.get('thead th').should('contain', 'Dagen Verhuurd')
          cy.get('thead th').should('contain', 'Tarief')
          cy.get('thead th').should('contain', 'Status')
          cy.get('thead th').should('contain', 'Acties')
        }
      })
    })

    it('should show appropriate message when no rentals exist', () => {
      cy.get('body').then($body => {
        if ($body.find('.alert-info').length > 0) {
          cy.get('.alert-info').should('contain', 'Geen actieve verhuur')
          cy.get('.btn-primary').should('contain', 'Start nieuwe verhuur')
        }
      })
    })

    it('should highlight overdue rentals', () => {
      cy.get('tbody tr.table-warning').each($row => {
        cy.wrap($row).find('.badge.bg-warning').should('contain', 'Te laat')
      })
    })

    it('should have pagination when needed', () => {
      cy.get('body').then($body => {
        if ($body.find('.pagination').length > 0) {
          cy.get('.pagination').should('be.visible')
          cy.get('.page-link').should('exist')
        }
      })
    })
  })

  describe('Return Rental Functionality', () => {
    beforeEach(() => {
      cy.navigateToRentals()
    })

    it('should show confirmation dialog before returning', () => {
      cy.get('tbody tr').first().then($row => {
        if ($row.find('.btn-success').length > 0) {
          // Mock SweetAlert confirmation
          cy.window().then(win => {
            cy.stub(win, 'Swal').returns({
              fire: cy.stub().resolves({ isConfirmed: false })
            })
          })
          
          cy.get('tbody tr').first().find('.btn-success').click()
        }
      })
    })

    it('should return rental successfully when confirmed', () => {
      cy.get('tbody tr').first().then($row => {
        if ($row.find('.btn-success').length > 0) {
          const rentalId = $row.find('td').first().text().trim()
          
          // Mock successful return API call
          cy.intercept('POST', `/staff/rentals/${rentalId}/return`, { 
            statusCode: 200, 
            body: { success: true } 
          }).as('returnRental')

          // Mock SweetAlert confirmation
          cy.window().then(win => {
            cy.stub(win, 'Swal').returns({
              fire: cy.stub().resolves({ isConfirmed: true })
            })
          })

          cy.get('tbody tr').first().find('.btn-success').click()
        }
      })
    })

    it('should handle return errors gracefully', () => {
      cy.get('tbody tr').first().then($row => {
        if ($row.find('.btn-success').length > 0) {
          const rentalId = $row.find('td').first().text().trim()
          
          // Mock failed return API call
          cy.intercept('POST', `/staff/rentals/${rentalId}/return`, { 
            statusCode: 500, 
            body: { success: false, error: 'Database error' } 
          }).as('returnRentalError')

          // Mock SweetAlert
          cy.window().then(win => {
            cy.stub(win, 'Swal').returns({
              fire: cy.stub().resolves({ isConfirmed: true })
            })
          })

          cy.get('tbody tr').first().find('.btn-success').click()
        }
      })
    })
  })

  describe('New Rental Creation', () => {
    beforeEach(() => {
      cy.visit('/staff/rentalCreate')
    })

    it('should display the new rental form', () => {
      cy.get('h4').should('contain', 'Nieuwe Verhuur Aanmaken')
      cy.get('#customer_search').should('be.visible')
      cy.get('input[name="customer_id"]').should('exist')
      cy.get('input[name="inventory_id"]').should('exist')
    })

    it('should search customers correctly', () => {
      cy.get('#customer_search').type('Smith')
      cy.get('button[onclick="searchCustomers()"]').click()
      
      cy.get('#customer_results').should('be.visible')
    })

    it('should select customer from search results', () => {
      cy.get('#customer_search').type('Mary')
      cy.get('button[onclick="searchCustomers()"]').click()
      
      cy.get('.list-group-item').first().then($item => {
        if ($item.length > 0) {
          cy.wrap($item).click()
          cy.get('#selected_customer').should('not.have.class', 'd-none')
        }
      })
    })

    it('should display available films', () => {
      cy.get('.card-header').contains('Beschikbare Films').should('be.visible')
      cy.get('#films-container').should('be.visible')
    })

    it('should filter films by search', () => {
      cy.get('#searchInput').type('Action')
      cy.wait(1000) // Wait for debounced search
      cy.url().should('include', 'search=Action')
    })

    it('should filter films by category', () => {
      cy.get('#filterCategory').select('Comedy')
      cy.url().should('include', 'category=Comedy')
    })

    it('should reset filters', () => {
      cy.get('#searchInput').type('Test')
      cy.get('#filterCategory').select('Action')
      cy.get('button').contains('Reset Filters').click()
      cy.get('#searchInput').should('have.value', '')
      cy.get('#filterCategory').should('have.value', '')
    })

    it('should select film from card', () => {
      cy.get('.film-card').first().then($card => {
        if ($card.length > 0) {
          const filmTitle = $card.find('.card-title').text().trim()
          cy.wrap($card).find('.btn-primary').click()
          
          cy.get('#selected_film').should('not.have.class', 'd-none')
          cy.get('#film_info').should('contain', filmTitle)
        }
      })
    })

    it('should create rental successfully', () => {
      // Mock a successful rental creation
      cy.intercept('POST', '/staff/rentals/create', { 
        statusCode: 302, 
        headers: { location: '/staff/rentals' }
      }).as('createRental')

      cy.get('input[name="customer_id"]').invoke('val', '1')
      cy.get('input[name="inventory_id"]').invoke('val', '1')
      cy.get('form').submit()
      
      cy.wait('@createRental')
    })
  })

  describe('Film Pagination', () => {
    beforeEach(() => {
      cy.visit('/staff/rentalCreate')
    })

    it('should maintain filters during pagination', () => {
      cy.get('#searchInput').type('Action')
      cy.wait(1000)
      
      cy.get('.pagination').then($pagination => {
        if ($pagination.length > 0) {
          cy.get('.page-link').contains('2').click()
          cy.url().should('include', 'page=2')
          cy.url().should('include', 'search=Action')
        }
      })
    })
  })

  describe('Responsive Design', () => {
    it('should be responsive on mobile', () => {
      cy.viewport('iphone-6')
      cy.visit('/staff/rentals')
      cy.get('.table-responsive').should('exist')
    })

    it('should stack form elements on small screens', () => {
      cy.viewport('iphone-6')
      cy.visit('/staff/rentalCreate')
      cy.get('.col-md-6').should('exist')
    })
  })
})