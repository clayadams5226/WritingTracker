// app.js - Main application initialization

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize data from localStorage
    window.dataManager.initialize();
    
    // Initialize avatar if needed
    initializeAvatarIfNeeded();
    
    // Set up UI event handlers
    window.uiManager.setupTabs();
    window.uiManager.setupForms();
    window.uiManager.setupModals();
    window.uiManager.setDefaultDate();
    
    // Update UI with current data
    window.uiManager.update();
    
    console.log('WriterQuest initialized successfully!');
});

// Initialize and update avatar when first running the app
function initializeAvatarIfNeeded() {
    const data = window.dataManager.getData();
    
    // Make sure base items are unlocked for new users
    if (data.avatar.unlockedItems.length === 0) {
        data.avatar.unlockedItems.push('base');
        data.avatar.equippedItems.push('base');
        
        // Check for items that should be unlocked based on current level
        window.dataManager.checkAvatarUnlocks();
    }
}