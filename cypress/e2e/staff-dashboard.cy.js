describe('Staff Dashboard', () => {
  beforeEach(() => {
    cy.loginAsStaff()
    cy.navigateToStaffDashboard()
  })

  describe('Dashboard Layout', () => {
    it('should display the main dashboard elements', () => {
      cy.get('h1').should('contain', 'Staff Dashboard')
      cy.get('.lead').should('contain', 'Welkom terug')
    })

    it('should display all statistics cards', () => {
      cy.get('.card.bg-primary').should('contain', 'Actieve Verhuur')
      cy.get('.card.bg-success').should('contain', 'Vandaag Verhuurd')
      cy.get('.card.bg-info').should('contain', 'Omzet Vandaag')
      cy.get('.card.bg-warning').should('contain', 'Totaal Klanten')
    })

    it('should display statistics with proper formatting', () => {
      // Check that statistics are numbers
      cy.get('.card.bg-primary h2').invoke('text').should('match', /^\d+$/)
      cy.get('.card.bg-success h2').invoke('text').should('match', /^\d+$/)
      cy.get('.card.bg-info h2').invoke('text').should('match', /^€\d+\.\d{2}$/)
      cy.get('.card.bg-warning h2').invoke('text').should('match', /^\d+$/)
    })
  })

  describe('Quick Actions Section', () => {
    it('should display all quick action buttons', () => {
      cy.get('.card-header').contains('Snelle Acties').should('be.visible')
      cy.get('a.btn').contains('Nieuwe Verhuur').should('be.visible')
      cy.get('a.btn').contains('Actieve Verhuur').should('be.visible')
      cy.get('a.btn').contains('Klanten Beheer').should('be.visible')
    })

    it('should navigate to new rental page', () => {
      cy.get('a.btn').contains('Nieuwe Verhuur').click()
      cy.url().should('include', '/staff/rentalCreate')
      cy.get('h4').should('contain', 'Nieuwe Verhuur Aanmaken')
    })

    it('should navigate to active rentals page', () => {
      cy.get('a.btn').contains('Actieve Verhuur').click()
      cy.url().should('include', '/staff/rentals')
      cy.get('h2').should('contain', 'Actieve Verhuur')
    })

    it('should navigate to customers management', () => {
      cy.get('a.btn').contains('Klanten Beheer').click()
      cy.url().should('include', '/staff/customers')
      cy.get('h2').should('contain', 'Klanten Beheer')
    })
  })

  describe('System Information', () => {
    it('should display system information card', () => {
      cy.get('.card-header').contains('Systeeminformatie').should('be.visible')
    })

    it('should show system status badges', () => {
      cy.get('.badge.bg-success').contains('Online').should('be.visible')
      cy.get('.badge.bg-primary').contains('MySQL').should('be.visible')
      cy.get('.badge.bg-secondary').contains('v1.0').should('be.visible')
      cy.get('.badge.bg-info').should('contain.text', '1') // Store ID
    })
  })

  describe('Recent Activity Section', () => {
    it('should display recent activity placeholder', () => {
      cy.get('.card-header').contains('Recente Activiteiten').should('be.visible')
      cy.get('.text-muted').contains('Hier worden binnenkort').should('be.visible')
    })

    it('should show loading indicator', () => {
      cy.get('.bi-hourglass-split').should('be.visible')
      cy.get('.text-muted').contains('Activiteiten laden').should('be.visible')
    })
  })

  describe('Navigation', () => {

    it('should redirect to appropriate dashboard on navbar brand click', () => {
      cy.get('.navbar-brand').click()
      cy.url().should('include', '/staff/dashboard')
    })
  })

  describe('Responsive Design', () => {
    it('should be responsive on mobile devices', () => {
      cy.viewport('iphone-6')
      cy.get('.card').should('be.visible')
      cy.get('.row.g-4').should('exist')
    })

    it('should be responsive on tablet', () => {
      cy.viewport('ipad-2')
      cy.get('.col-lg-3').should('exist')
      cy.get('.card.bg-primary').should('be.visible')
    })

    it('should stack cards properly on small screens', () => {
      cy.viewport(576, 768)
      cy.get('.col-lg-3.col-md-6').should('exist')
    })
  })

  describe('Data Loading', () => {
    it('should handle dashboard data loading', () => {
      cy.intercept('GET', '/staff/dashboard').as('getDashboard')
      cy.reload()
      cy.wait('@getDashboard')
      cy.get('h1').should('contain', 'Staff Dashboard')
    })
  })

  describe('Icons and Visual Elements', () => {
    it('should display proper icons for each statistic', () => {
      cy.get('.bi-film').should('be.visible')
      cy.get('.bi-calendar-check').should('be.visible')
      cy.get('.bi-cash').should('be.visible')
      cy.get('.bi-people').should('be.visible')
    })

    it('should have proper Bootstrap icons in quick actions', () => {
      cy.get('.bi-plus-circle').should('be.visible')
      cy.get('.bi-list').should('be.visible')
      cy.get('.bi-people').should('be.visible')
    })
  })

  describe('Performance', () => {
    it('should load dashboard within acceptable time', () => {
      const startTime = Date.now()
      cy.visit('/staff/dashboard').then(() => {
        const loadTime = Date.now() - startTime
        expect(loadTime).to.be.lessThan(3000) // 3 seconds max
      })
    })
  })

  describe('Accessibility', () => {

    it('should have proper heading hierarchy', () => {
      cy.get('h1').should('have.length', 1)
      cy.get('h5').should('have.length.at.least', 2)
    })

    it('should support keyboard navigation', () => {
      cy.get('a.btn').first().focus()
      cy.focused().should('have.class', 'btn')
    })

    it('should have proper color contrast', () => {
      cy.get('.card.bg-primary').should('have.css', 'color', 'rgb(255, 255, 255)')
      cy.get('.card.bg-success').should('have.css', 'color', 'rgb(255, 255, 255)')
    })
  })
})