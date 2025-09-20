// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Cypress Axe for accessibility testing
import 'cypress-axe'

// Global configuration
beforeEach(() => {
  // Ignore uncaught exceptions that might occur in the application
  cy.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from failing the test
    console.log('Uncaught exception:', err.message)
    return false
  })
  
  // Set viewport for consistent testing
  cy.viewport(1280, 720)
  
  // Clear cookies and local storage before each test
  cy.clearCookies()
  cy.clearLocalStorage()
})

// Global after hook
afterEach(() => {
  // Take screenshot on failure (automatically handled by Cypress but can be customized)
  if (cy.state('runnable').state === 'failed') {
    const testName = Cypress.spec.name
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    cy.screenshot(`failed-${testName}-${timestamp}`)
  }
})

// Custom terminal logging for accessibility tests
Cypress.Commands.add('terminalLog', (violations) => {
  cy.task(
    'log',
    `${violations.length} accessibility violation${
      violations.length === 1 ? '' : 's'
    } ${violations.length === 1 ? 'was' : 'were'} detected`
  )
  
  // pluck specific keys to keep the table readable
  const violationData = violations.map(
    ({ id, impact, description, nodes }) => ({
      id,
      impact,
      description,
      nodes: nodes.length
    })
  )

  cy.task('table', violationData)
})