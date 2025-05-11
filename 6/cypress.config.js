const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // Można tu zarejestrować eventy Cypress (np. do przetwarzania wyników), jeśli potrzebne.
      // W prostym projekcie nie ma dodatkowych zdarzeń do obsłużenia.
    }
  }
});
