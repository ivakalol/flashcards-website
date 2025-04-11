/**
 * Card Manager for handling flashcard operations
 */
const CardManager = {
  currentFolderId: 'root',
  currentCardIndex: 0,
  currentCards: [],
  isFlipped: false,
  
  /**
   * Initialize the card manager
   */
  init() {
      this.loadCardsInCurrentFolder();
  },
  
  /**
   * Load cards from the current folder
   */
  loadCardsInCurrentFolder() {
      this.currentCards = StorageManager.getCardsInFolder(this.currentFolderId);
      this.currentCardIndex = 0;
      this.isFlipped = false;
      return this.currentCards;
  },
  
  /**
   * Get subfolders in the current folder
   * @returns {Array} Array of folder objects
   */
  getSubfolders() {
      return StorageManager.getSubfolders(this.currentFolderId);
  },
  
  /**
   * Navigate to a different folder
   * @param {string} folderId - ID of the folder to navigate to
   */
  navigateToFolder(folderId) {
      this.currentFolderId = folderId;
      this.loadCardsInCurrentFolder();
  },
  
  /**
   * Get the current folder path (breadcrumb)
   * @returns {Array} Array of folder objects from root to current folder
   */
  getCurrentPath() {
      return StorageManager.getFolderPath(this.currentFolderId);
  },
  
  /**
   * Create a new folder in the current folder
   * @param {string} name - Name of the new folder
   * @returns {string} ID of the new folder
   */
  createFolder(name) {
      return StorageManager.createFolder(name, this.currentFolderId);
  },
  
  /**
   * Rename a folder
   * @param {string} folderId - ID of the folder to rename
   * @param {string} newName - New name for the folder
   */
  renameFolder(folderId, newName) {
      StorageManager.renameFolder(folderId, newName);
  },
  
  /**
   * Delete a folder
   * @param {string} folderId - ID of the folder to delete
   */
  deleteFolder(folderId) {
      StorageManager.deleteFolder(folderId);
  },
  
  /**
   * Add a new card to the current folder
   * @param {string} frontText - Text for the front of the card
   * @param {string} backText - Text for the back of the card
   * @returns {string} ID of the new card
   */
  addCard(frontText, backText) {
      const newCard = {
          front: frontText,
          back: backText
      };
      
      const cardId = StorageManager.addCard(newCard, this.currentFolderId);
      this.loadCardsInCurrentFolder(); // Reload cards to include the new one
      return cardId;
  },
  
  /**
   * Remove a card by ID
   * @param {string} cardId - ID of the card to remove
   */
  removeCard(cardId) {
      StorageManager.deleteCard(cardId);
      this.loadCardsInCurrentFolder(); // Reload cards to reflect the removal
      
      // Adjust current card index if needed
      if (this.currentCardIndex >= this.currentCards.length) {
          this.currentCardIndex = Math.max(0, this.currentCards.length - 1);
      }
  },
  
  /**
   * Edit an existing card
   * @param {string} cardId - ID of the card to edit
   * @param {string} frontText - New front text
   * @param {string} backText - New back text
   */
  editCard(cardId, frontText, backText) {
      const updatedCard = {
          front: frontText,
          back: backText
      };
      
      StorageManager.updateCard(cardId, updatedCard);
      this.loadCardsInCurrentFolder(); // Reload cards to reflect the update
  },
  
  /**
   * Move a card to a different folder
   * @param {string} cardId - ID of the card to move
   * @param {string} targetFolderId - ID of the destination folder
   */
  moveCardToFolder(cardId, targetFolderId) {
      StorageManager.moveCard(cardId, targetFolderId);
      this.loadCardsInCurrentFolder(); // Reload cards to reflect the change
  },
  
  /**
   * Get the current card during learning mode
   * @returns {Object|null} The current card or null if no cards
   */
  getCurrentCard() {
      if (this.currentCards.length === 0) return null;
      return this.currentCards[this.currentCardIndex];
  },
  
  /**
   * Move to the next card
   * @returns {Object|null} The next card or null if at the end
   */
  nextCard() {
      if (this.currentCardIndex < this.currentCards.length - 1) {
          this.currentCardIndex++;
          this.isFlipped = false;
          return this.getCurrentCard();
      }
      return null;
  },
  
  /**
   * Move to the previous card
   * @returns {Object|null} The previous card or null if at the beginning
   */
  previousCard() {
      if (this.currentCardIndex > 0) {
          this.currentCardIndex--;
          this.isFlipped = false;
          return this.getCurrentCard();
      }
      return null;
  },
  
  /**
   * Reset to the first card
   */
  resetToFirst() {
      this.currentCardIndex = 0;
      this.isFlipped = false;
  },
  
  /**
   * Flip the current card
   * @returns {boolean} New flip state
   */
  flipCard() {
      this.isFlipped = !this.isFlipped;
      return this.isFlipped;
  },
  
  /**
   * Get the total number of cards in the current folder
   * @returns {number} Number of cards
   */
  getCardCount() {
      return this.currentCards.length;
  },
  
  /**
   * Get the current card index (1-based for display)
   * @returns {number} Current card number
   */
  getCurrentCardNumber() {
      return this.currentCards.length > 0 ? this.currentCardIndex + 1 : 0;
  },
  
  /**
   * Get the current folder ID
   * @returns {string} Current folder ID
   */
  getCurrentFolderId() {
      return this.currentFolderId;
  }
};