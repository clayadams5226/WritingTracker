// app.js - Main application initialization

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize data from localStorage
    window.dataManager.initialize();
    
    // Set up UI event handlers
    window.uiManager.setupTabs();
    window.uiManager.setupForms();
    window.uiManager.setupModals(); // Added this line
    window.uiManager.setDefaultDate();
    
    // Update UI with current data
    window.uiManager.update();
    
    console.log('WriterQuest initialized successfully!');
});