// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- Login Commands --
Cypress.Commands.add('loginAsStaff', (email = Cypress.env('STAFF_EMAIL'), password = Cypress.env('STAFF_PASSWORD')) => {
  cy.session([email, password, 'staff'], () => {
    cy.visit('/auth/login')
    cy.get('#email').type(email)
    cy.get('#password').type(password)
    cy.get('#role').select('staff')
    cy.get('form').submit()
    cy.url().should('include', '/staff/dashboard')
  })
})

Cypress.Commands.add('loginAsCustomer', (email = Cypress.env('CUSTOMER_EMAIL')) => {
  cy.session([email, 'customer'], () => {
    cy.visit('/auth/login')
    cy.get('#email').type(email)
    cy.get('#role').select('customer')
    cy.get('form').submit()
    cy.url().should('include', '/customer/dashboard')
  })
})

// -- Navigation Commands --
Cypress.Commands.add('navigateToActors', () => {
  cy.visit('/actor')
  cy.get('h2').should('contain', 'Actors')
})

Cypress.Commands.add('navigateToStaffDashboard', () => {
  cy.visit('/staff/dashboard')
  cy.get('h1').should('contain', 'Staff Dashboard')
})

Cypress.Commands.add('navigateToRentals', () => {
  cy.visit('/staff/rentals')
  cy.get('h2').should('contain', 'Actieve Verhuur')
})

Cypress.Commands.add('navigateToCustomers', () => {
  cy.visit('/staff/customers')
  cy.get('h2').should('contain', 'Klanten Beheer')
})

// -- Actor Commands --
Cypress.Commands.add('createActor', (firstName, lastName) => {
  cy.get('[data-bs-toggle="modal"]').contains('Nieuwe Actor').click()
  cy.get('#firstName').type(firstName)
  cy.get('#lastName').type(lastName)
  cy.get('form[action="/actor/add"]').submit()
})

Cypress.Commands.add('editActor', (actorId, newFirstName, newLastName) => {
  cy.get(`button[onclick*="editActor(${actorId}"]`).click()
  cy.get('#editFirstName').clear().type(newFirstName)
  cy.get('#editLastName').clear().type(newLastName)
  cy.get('#editActorForm').submit()
})

Cypress.Commands.add('deleteActor', (actorId) => {
  cy.get(`form[action="/actor/delete/${actorId}"] button`).click()
})

// -- Customer Commands --
Cypress.Commands.add('createCustomer', (customerData) => {
  cy.get('[data-bs-target="#createCustomerModal"]').click()
  cy.get('input[name="first_name"]').type(customerData.firstName)
  cy.get('input[name="last_name"]').type(customerData.lastName)
  cy.get('input[name="email"]').type(customerData.email)
  cy.get('input[name="password"]').type(customerData.password)
  cy.get('input[name="address"]').type(customerData.address)
  cy.get('input[name="city"]').type(customerData.city)
  cy.get('input[name="country"]').type(customerData.country)
  cy.get('form[action="/staff/customers/create"]').submit()
})

Cypress.Commands.add('searchCustomer', (searchTerm) => {
  cy.get('#customer_search').clear().type(searchTerm)
  cy.get('button[onclick="searchCustomers()"]').click()
})

// -- Rental Commands --
Cypress.Commands.add('createRental', (customerName, filmTitle) => {
  cy.visit('/staff/rentalCreate')
  
  // Search and select customer
  cy.get('#customer_search').type(customerName)
  cy.get('.list-group-item').contains(customerName).click()
  
  // Select film
  cy.get('.film-card').contains(filmTitle).parents('.film-card').find('button').contains('Selecteer').click()
  
  // Submit form
  cy.get('#submit_btn').should('not.be.disabled').click()
})

// -- Database Commands --
Cypress.Commands.add('resetDatabase', () => {
  cy.task('log', 'Resetting test database...')
  // In a real scenario, you'd implement database reset logic here
})

// -- Assertion Commands --
Cypress.Commands.add('shouldShowSuccessMessage', (message) => {
  cy.get('.alert-success, .swal2-success').should('contain', message)
})

Cypress.Commands.add('shouldShowErrorMessage', (message) => {
  cy.get('.alert-danger, .swal2-error').should('contain', message)
})

// -- Utility Commands --
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible')
  cy.document().should('have.property', 'readyState', 'complete')
})

Cypress.Commands.add('closeModal', (modalId) => {
  cy.get(`#${modalId} .btn-close, #${modalId} [data-bs-dismiss="modal"]`).first().click()
})

// -- Accessibility Commands --
Cypress.Commands.add('checkA11y', () => {
  cy.injectAxe()
  cy.checkA11y(null, null, cy.terminalLog)
})