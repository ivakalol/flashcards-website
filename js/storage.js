/**
 * Storage Manager for handling localStorage operations
 */
const StorageManager = {
    STORAGE_KEY: 'flashcards_data',
    
    /**
     * Get the entire data structure including folders and cards
     * @returns {Object} Data structure with folders and cards
     */
    getData() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (!data) {
            // Initialize with root folder
            const initialData = {
                folders: {
                    root: {
                        id: 'root',
                        name: 'Root',
                        parentId: null,
                        subfolders: [],
                        cards: []
                    }
                },
                cards: {}
            };
            this.saveData(initialData);
            return initialData;
        }
        return JSON.parse(data);
    },
    
    /**
     * Save the entire data structure
     * @param {Object} data - The data structure to save
     */
    saveData(data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    },
    
    /**
     * Get cards from a specific folder
     * @param {string} folderId - ID of the folder
     * @returns {Array} Array of card objects in that folder
     */
    getCardsInFolder(folderId) {
        const data = this.getData();
        const folder = data.folders[folderId];
        
        if (!folder) return [];
        
        return folder.cards.map(cardId => data.cards[cardId]);
    },
    
    /**
     * Get all subfolders of a folder
     * @param {string} folderId - ID of the parent folder
     * @returns {Array} Array of folder objects
     */
    getSubfolders(folderId) {
        const data = this.getData();
        const folder = data.folders[folderId];
        
        if (!folder) return [];
        
        return folder.subfolders.map(subfolderId => data.folders[subfolderId]);
    },
    
    /**
     * Create a new folder
     * @param {string} name - Name of the new folder
     * @param {string} parentId - ID of the parent folder
     * @returns {string} ID of the new folder
     */
    createFolder(name, parentId) {
        const data = this.getData();
        
        // Check if parent folder exists
        if (!data.folders[parentId]) {
            throw new Error('Parent folder does not exist');
        }
        
        // Generate a unique ID for the new folder
        const folderId = 'folder_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Create the new folder
        data.folders[folderId] = {
            id: folderId,
            name: name,
            parentId: parentId,
            subfolders: [],
            cards: []
        };
        
        // Add to parent's subfolders
        data.folders[parentId].subfolders.push(folderId);
        
        this.saveData(data);
        return folderId;
    },
    
    /**
     * Rename a folder
     * @param {string} folderId - ID of the folder to rename
     * @param {string} newName - New name for the folder
     */
    renameFolder(folderId, newName) {
        if (folderId === 'root') {
            throw new Error('Cannot rename the root folder');
        }
        
        const data = this.getData();
        
        if (!data.folders[folderId]) {
            throw new Error('Folder does not exist');
        }
        
        data.folders[folderId].name = newName;
        this.saveData(data);
    },
    
    /**
     * Delete a folder and all its contents recursively
     * @param {string} folderId - ID of the folder to delete
     */
    deleteFolder(folderId) {
        if (folderId === 'root') {
            throw new Error('Cannot delete the root folder');
        }
        
        const data = this.getData();
        
        if (!data.folders[folderId]) {
            throw new Error('Folder does not exist');
        }
        
        // Function to recursively delete a folder and its contents
        const recursiveDelete = (id) => {
            const folder = data.folders[id];
            
            // Delete all subfolders recursively
            for (const subfolderId of folder.subfolders) {
                recursiveDelete(subfolderId);
            }
            
            // Delete all cards in the folder
            for (const cardId of folder.cards) {
                delete data.cards[cardId];
            }
            
            // Remove folder from parent's subfolders array
            const parentFolder = data.folders[folder.parentId];
            if (parentFolder) {
                const index = parentFolder.subfolders.indexOf(id);
                if (index !== -1) {
                    parentFolder.subfolders.splice(index, 1);
                }
            }
            
            // Delete the folder itself
            delete data.folders[id];
        };
        
        recursiveDelete(folderId);
        this.saveData(data);
    },
    
    /**
     * Move a folder to a different parent
     * @param {string} folderId - ID of the folder to move
     * @param {string} newParentId - ID of the new parent folder
     */
    moveFolder(folderId, newParentId) {
        if (folderId === 'root') {
            throw new Error('Cannot move the root folder');
        }
        
        const data = this.getData();
        
        if (!data.folders[folderId] || !data.folders[newParentId]) {
            throw new Error('Folder does not exist');
        }
        
        // Check for circular references (can't move a folder into its own subtree)
        let current = newParentId;
        while (current !== null) {
            if (current === folderId) {
                throw new Error('Cannot move a folder into its own subtree');
            }
            current = data.folders[current].parentId;
        }
        
        // Remove from current parent's subfolders
        const oldParentId = data.folders[folderId].parentId;
        const oldParent = data.folders[oldParentId];
        const index = oldParent.subfolders.indexOf(folderId);
        if (index !== -1) {
            oldParent.subfolders.splice(index, 1);
        }
        
        // Add to new parent's subfolders
        data.folders[newParentId].subfolders.push(folderId);
        
        // Update folder's parent reference
        data.folders[folderId].parentId = newParentId;
        
        this.saveData(data);
    },
    
    /**
     * Add a card to a folder
     * @param {Object} cardData - Card data
     * @param {string} folderId - ID of the folder to add the card to
     * @returns {string} ID of the new card
     */
    addCard(cardData, folderId) {
        const data = this.getData();
        
        if (!data.folders[folderId]) {
            throw new Error('Folder does not exist');
        }
        
        // Generate a unique ID for the new card
        const cardId = 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Add card with metadata
        data.cards[cardId] = {
            id: cardId,
            front: cardData.front,
            back: cardData.back,
            dateCreated: new Date().toISOString(),
            folderId: folderId
        };
        
        // Add card to folder
        data.folders[folderId].cards.push(cardId);
        
        this.saveData(data);
        return cardId;
    },
    
    /**
     * Update an existing card
     * @param {string} cardId - ID of the card to update
     * @param {Object} updatedCardData - Updated card data
     */
    updateCard(cardId, updatedCardData) {
        const data = this.getData();
        
        if (!data.cards[cardId]) {
            throw new Error('Card does not exist');
        }
        
        // Update card data while preserving metadata
        data.cards[cardId] = {
            ...data.cards[cardId],
            front: updatedCardData.front,
            back: updatedCardData.back,
            dateUpdated: new Date().toISOString()
        };
        
        this.saveData(data);
    },
    
    /**
     * Move a card to a different folder
     * @param {string} cardId - ID of the card to move
     * @param {string} newFolderId - ID of the destination folder
     */
    moveCard(cardId, newFolderId) {
        const data = this.getData();
        
        if (!data.cards[cardId] || !data.folders[newFolderId]) {
            throw new Error('Card or folder does not exist');
        }
        
        const card = data.cards[cardId];
        const oldFolderId = card.folderId;
        
        // Remove card from old folder
        const oldFolder = data.folders[oldFolderId];
        const index = oldFolder.cards.indexOf(cardId);
        if (index !== -1) {
            oldFolder.cards.splice(index, 1);
        }
        
        // Add card to new folder
        data.folders[newFolderId].cards.push(cardId);
        
        // Update card's folder reference
        card.folderId = newFolderId;
        
        this.saveData(data);
    },
    
    /**
     * Delete a card
     * @param {string} cardId - ID of the card to delete
     */
    deleteCard(cardId) {
        const data = this.getData();
        
        if (!data.cards[cardId]) {
            throw new Error('Card does not exist');
        }
        
        // Remove card from its folder
        const folderId = data.cards[cardId].folderId;
        const folder = data.folders[folderId];
        const index = folder.cards.indexOf(cardId);
        if (index !== -1) {
            folder.cards.splice(index, 1);
        }
        
        // Delete the card
        delete data.cards[cardId];
        
        this.saveData(data);
    },
    
    /**
     * Get a folder's path (breadcrumb)
     * @param {string} folderId - ID of the folder
     * @returns {Array} Array of folder objects from root to the current folder
     */
    getFolderPath(folderId) {
        const data = this.getData();
        const path = [];
        
        let currentId = folderId;
        while (currentId !== null) {
            const folder = data.folders[currentId];
            if (!folder) break;
            
            path.unshift(folder);
            currentId = folder.parentId;
        }
        
        return path;
    },
    
    /**
     * Export all data including folder structure
     * @returns {Object} The complete data structure
     */
    exportAllData() {
        return this.getData();
    },
    
    /**
     * Import data with folder structure
     * @param {Object} data - The data structure to import
     */
    importData(data) {
        // Basic validation
        if (!data.folders || !data.cards || !data.folders.root) {
            throw new Error('Invalid data format');
        }
        
        this.saveData(data);
    },
    
    /**
     * Save user preference for theme
     * @param {string} theme - Theme name ('light' or 'dark')
     */
    saveThemePreference(theme) {
        localStorage.setItem('theme', theme);
    },
    
    /**
     * Get user's theme preference
     * @returns {string} Theme name or null if not set
     */
    getThemePreference() {
        return localStorage.getItem('theme');
    }
};