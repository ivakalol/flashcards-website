/**
 * Import/Export Manager for handling flashcard data import and export
 */
const ImportExportManager = {
    /**
     * Initialize import/export functionality
     */
    init() {
        this.exportBtn = document.getElementById('exportBtn');
        this.importBtn = document.getElementById('importBtn');
        this.importFileInput = document.getElementById('importFile');
        
        this.exportBtn.addEventListener('click', () => this.exportData());
        this.importBtn.addEventListener('click', () => this.importFileInput.click());
        this.importFileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    },
    
    /**
     * Export all data including folder structure to a JSON file
     */
    exportData() {
        const data = StorageManager.exportAllData();
        
        // Check if there's any data to export
        if (Object.keys(data.cards).length === 0 && 
            Object.keys(data.folders).length <= 1) { // Just the root folder
            alert('No data to export.');
            return;
        }
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileName = `flashcards_export_${new Date().toISOString().slice(0, 10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.style.display = 'none';
        
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);
    },
    
    /**
     * Handle file selection for import
     * @param {Event} event - File input change event
     */
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Basic validation
                if (!importedData.folders || !importedData.cards || !importedData.folders.root) {
                    throw new Error('Invalid data format. Expected a valid flashcards data structure.');
                }
                
                this.processImport(importedData);
            } catch (error) {
                alert(`Import failed: ${error.message}`);
            }
            
            // Reset file input
            event.target.value = '';
        };
        
        reader.onerror = () => {
            alert('Error reading file');
            event.target.value = '';
        };
        
        reader.readAsText(file);
    },
    
    /**
     * Process the imported data
     * @param {Object} importedData - Data structure to import
     */
    processImport(importedData) {
        const currentData = StorageManager.exportAllData();
        
        const cardCount = Object.keys(importedData.cards).length;
        const folderCount = Object.keys(importedData.folders).length - 1; // Exclude root folder
        
        const userChoice = confirm(
            `Found ${cardCount} cards and ${folderCount} folders to import. ` +
            `Would you like to merge with your existing data (${Object.keys(currentData.cards).length} cards, ${Object.keys(currentData.folders).length - 1} folders)?` +
            '\n\nClick OK to merge, or Cancel to replace all existing data.'
        );
        
        if (userChoice === null) {
            return; // User canceled
        }
        
        let resultingData;
        
        if (userChoice) {
            // Merge data
            resultingData = this.mergeData(currentData, importedData);
        } else {
            // Replace all data
            resultingData = importedData;
        }
        
        try {
            // Save the resulting data
            StorageManager.importData(resultingData);
            
            // Reload the UI
            CardManager.navigateToFolder('root');
            FolderManager.renderFolderPath();
            FolderManager.renderFolderList();
            UIController.renderCardList();
            
            alert(`Successfully imported ${cardCount} cards and ${folderCount} folders.`);
        } catch (error) {
            alert(`Error during import: ${error.message}`);
        }
    },
    
    /**
     * Merge imported data with existing data
     * @param {Object} currentData - Existing data structure
     * @param {Object} importedData - Imported data structure
     * @returns {Object} Merged data structure
     */
    mergeData(currentData, importedData) {
        // Create a deep copy of current data to avoid mutations
        const result = JSON.parse(JSON.stringify(currentData));
        
        // Create a map for generated IDs to avoid conflicts
        const idMap = {};
        
        // First, process folders (except root which is preserved)
        Object.entries(importedData.folders).forEach(([oldId, folder]) => {
            if (oldId === 'root') return; // Skip root folder
            
            // Generate a new ID for the folder
            const newId = 'folder_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            idMap[oldId] = newId;
            
            // Store folder with new ID
            result.folders[newId] = {
                ...folder,
                id: newId,
                // Parent ID will be updated in a second pass
                subfolders: [], // Clear subfolders, they'll be added in second pass
                cards: [] // Clear cards, they'll be added when processing cards
            };
        });
        
        // Second pass to update parent IDs and populate subfolders
        Object.entries(importedData.folders).forEach(([oldId, folder]) => {
            if (oldId === 'root') {
                // For root, just add the top-level imported folders to root's subfolders
                folder.subfolders.forEach(subfolderId => {
                    const newSubfolderId = idMap[subfolderId];
                    if (newSubfolderId && !result.folders.root.subfolders.includes(newSubfolderId)) {
                        result.folders.root.subfolders.push(newSubfolderId);
                        // Update parent ID for the subfolder
                        result.folders[newSubfolderId].parentId = 'root';
                    }
                });
            } else {
                const newId = idMap[oldId];
                
                // Update parent ID
                if (folder.parentId === 'root') {
                    result.folders[newId].parentId = 'root';
                } else {
                    result.folders[newId].parentId = idMap[folder.parentId] || 'root';
                }
                
                // Add to parent's subfolders
                const parentId = result.folders[newId].parentId;
                if (parentId && result.folders[parentId]) {
                    result.folders[parentId].subfolders.push(newId);
                }
            }
        });
        
        // Process cards
        Object.entries(importedData.cards).forEach(([oldCardId, card]) => {
            // Generate a new ID for the card
            const newCardId = 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            // Determine the folder ID
            let folderId;
            if (card.folderId === 'root') {
                folderId = 'root';
            } else {
                folderId = idMap[card.folderId] || 'root';
            }
            
            // Store card with new ID
            result.cards[newCardId] = {
                ...card,
                id: newCardId,
                folderId: folderId
            };
            
            // Add to folder's cards
            if (result.folders[folderId]) {
                result.folders[folderId].cards.push(newCardId);
            }
        });
        
        return result;
    }
};