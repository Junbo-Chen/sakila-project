const { defineConfig } = require('cypress')
require('dotenv').config()

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    
    // Test files
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    
    // Setup and teardown
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
        table(message) {
          console.table(message)
          return null
        }
      })
    },

    // Environment variables
    env: {
      // Test database credentials (should be separate test DB)
      DB_HOST: process.env.DB_HOST || '',
      DB_USER: process.env.DB_USER || '',
      DB_PASSWORD: process.env.DB_PASSWORD || '',
      DB_DATABASE: process.env.DB_DATABASE || '',
      DB_PORT: 3306,
      
      // Test users
      STAFF_EMAIL: process.env.STAFF_EMAIL,
      STAFF_PASSWORD: process.env.STAFF_PASSWORD,
      CUSTOMER_EMAIL: process.env.CUSTOMER_EMAIL,
      CUSTOMER_PASSWORD: process.env.CUSTOMER_PASSWORD
    }
  },

  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
  },
})