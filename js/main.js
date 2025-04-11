/**
 * Main application entry point
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all managers
    StorageManager; // Already initialized by its definition
    CardManager.init();
    ThemeManager.init();
    FolderManager.init();
    ImportExportManager.init();
    UIController.init();
    
    console.log('Flashcards application initialized');
});