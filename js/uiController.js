/**
 * UI Controller for managing the user interface
 */
const UIController = {
    /**
     * Initialize the UI
     */
    init() {
        this.initElements();
        this.attachEventListeners();
        this.renderCardList();
    },
    
    /**
     * Initialize element references
     */
    initElements() {
        // Sections
        this.addCardSection = document.getElementById('addCardSection');
        this.addFolderSection = document.getElementById('addFolderSection');
        this.learningSection = document.getElementById('learningSection');
        this.folderContentSection = document.getElementById('folderContentSection');
        
        // Add card form
        this.frontTextInput = document.getElementById('frontText');
        this.backTextInput = document.getElementById('backText');
        this.saveCardBtn = document.getElementById('saveCardBtn');
        this.cancelAddBtn = document.getElementById('cancelAddBtn');
        
        // Card list
        this.cardList = document.getElementById('cardList');
        
        // Control buttons
        this.addCardBtn = document.getElementById('addCardBtn');
        this.startLearningBtn = document.getElementById('startLearningBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        // Learning mode elements
        this.cardFrontText = document.getElementById('cardFrontText');
        this.cardBackText = document.getElementById('cardBackText');
        this.cardInner = document.querySelector('.card-inner');
        this.prevCardBtn = document.getElementById('prevCardBtn');
        this.nextCardBtn = document.getElementById('nextCardBtn');
        this.flipCardBtn = document.getElementById('flipCardBtn');
        this.cardProgress = document.getElementById('cardProgress');
        this.exitLearningBtn = document.getElementById('exitLearningBtn');
        
        // Edit mode state
        this.editingCardId = null;
    },
    
    /**
     * Attach event listeners to UI elements
     */
    attachEventListeners() {
        // Add card form
        this.addCardBtn.addEventListener('click', () => this.showAddCardForm());
        this.saveCardBtn.addEventListener('click', () => this.saveCard());
        this.cancelAddBtn.addEventListener('click', () => this.hideAddCardForm());
        
        // Learning mode
        this.startLearningBtn.addEventListener('click', () => this.startLearningMode());
        this.flipCardBtn.addEventListener('click', () => this.flipCard());
        this.prevCardBtn.addEventListener('click', () => this.showPreviousCard());
        this.nextCardBtn.addEventListener('click', () => this.showNextCard());
        this.exitLearningBtn.addEventListener('click', () => this.exitLearningMode());
        
        // Reset cards
        this.resetBtn.addEventListener('click', () => this.resetCards());
    },
    
    /**
     * Render the list of cards in the current folder
     */
    renderCardList() {
        this.cardList.innerHTML = '';
        const cards = CardManager.loadCardsInCurrentFolder();
        
        if (cards.length === 0) {
            this.cardList.innerHTML = '<p class="empty-state">No cards in this folder. Add some cards to get started!</p>';
            this.startLearningBtn.disabled = true;
        } else {
            this.startLearningBtn.disabled = false;
            cards.forEach(card => {
                const cardElement = document.createElement('div');
                cardElement.className = 'card-item';
                
                cardElement.innerHTML = `
                    <div class="card-actions">
                        <button class="edit-btn" data-id="${card.id}">
                            <span class="action-icon">📝</span>
                        </button>
                        <button class="delete-btn" data-id="${card.id}">
                            <span class="action-icon delete-icon">❌</span>
                        </button>
                    </div>
                    <div class="card-content">
                        <div class="card-front-text">${this.escapeHtml(card.front)}</div>
                        <div class="card-back-text">${this.escapeHtml(card.back)}</div>
                    </div>
                `;
                
                this.cardList.appendChild(cardElement);
                
                // Add event listeners for edit and delete buttons
                cardElement.querySelector('.edit-btn').addEventListener('click', (e) => {
                    const cardId = e.target.closest('.edit-btn').dataset.id;
                    this.editCard(cardId);
                });
                
                cardElement.querySelector('.delete-btn').addEventListener('click', (e) => {
                    const cardId = e.target.closest('.delete-btn').dataset.id;
                    this.deleteCard(cardId);
                });
            });
        }
        
        // Update button states
        this.updateStartLearningButtonState();
    },
    
    /**
     * Escape HTML special characters to prevent XSS
     * @param {string} html - String to escape
     * @returns {string} Escaped HTML string
     */
    escapeHtml(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    },
    
    /**
     * Show the add card form
     */
    showAddCardForm() {
        this.editingCardId = null;
        this.frontTextInput.value = '';
        this.backTextInput.value = '';
        this.addCardSection.style.display = 'block';
        this.addFolderSection.style.display = 'none';
        this.learningSection.style.display = 'none';
        this.frontTextInput.focus();
    },
    
    /**
     * Hide the add card form
     */
    hideAddCardForm() {
        this.addCardSection.style.display = 'none';
        this.editingCardId = null;
    },
    
    /**
     * Save a new or edited card
     */
    saveCard() {
        const frontText = this.frontTextInput.value.trim();
        const backText = this.backTextInput.value.trim();
        
        if (!frontText || !backText) {
            alert('Please fill in both sides of the card.');
            return;
        }
        
        if (this.editingCardId) {
            // Editing existing card
            CardManager.editCard(this.editingCardId, frontText, backText);
        } else {
            // Adding new card
            CardManager.addCard(frontText, backText);
        }
        
        this.hideAddCardForm();
        this.renderCardList();
    },
    
    /**
     * Edit an existing card
     * @param {string} cardId - ID of the card to edit
     */
    editCard(cardId) {
        const card = CardManager.currentCards.find(card => card.id === cardId);
        if (!card) return;
        
        this.frontTextInput.value = card.front;
        this.backTextInput.value = card.back;
        this.editingCardId = cardId;
        this.addCardSection.style.display = 'block';
        this.addFolderSection.style.display = 'none';
        this.frontTextInput.focus();
    },
    
    /**
     * Delete a card
     * @param {string} cardId - ID of the card to delete
     */
    deleteCard(cardId) {
        if (confirm('Are you sure you want to delete this card?')) {
            CardManager.removeCard(cardId);
            this.renderCardList();
        }
    },
    
    /**
     * Start learning mode with cards from the current folder
     */
    startLearningMode() {
        if (CardManager.getCardCount() === 0) {
            alert('Add some cards first before starting learning mode.');
            return;
        }
        
        CardManager.resetToFirst();
        this.learningSection.style.display = 'block';
        this.addCardSection.style.display = 'none';
        this.addFolderSection.style.display = 'none';
        this.updateCardDisplay();
    },
    
    /**
     * Exit learning mode
     */
    exitLearningMode() {
        this.learningSection.style.display = 'none';
    },
    
    /**
     * Update the card display in learning mode
     */
    updateCardDisplay() {
        const currentCard = CardManager.getCurrentCard();
        
        if (!currentCard) {
            this.exitLearningMode();
            return;
        }
        
        this.cardFrontText.textContent = currentCard.front;
        this.cardBackText.textContent = currentCard.back;
        
        // Reset card flip state
        this.cardInner.classList.remove('flipped');
        
        // Update progress display
        this.cardProgress.textContent = `Card ${CardManager.getCurrentCardNumber()} of ${CardManager.getCardCount()}`;
        
        // Update button states
        this.prevCardBtn.disabled = CardManager.currentCardIndex === 0;
        this.nextCardBtn.disabled = CardManager.currentCardIndex === CardManager.getCardCount() - 1;
    },
    
    /**
     * Flip the current card
     */
    flipCard() {
        CardManager.flipCard();
        this.cardInner.classList.toggle('flipped');
    },
    
    /**
     * Show the next card
     */
    showNextCard() {
        CardManager.nextCard();
        this.updateCardDisplay();
    },
    
    /**
     * Show the previous card
     */
    showPreviousCard() {
        CardManager.previousCard();
        this.updateCardDisplay();
    },
    
    /**
     * Reset all cards after confirmation
     */
    resetCards() {
        const currentFolderId = CardManager.getCurrentFolderId();
        
        if (CardManager.getCardCount() === 0) {
            alert('No cards to reset in this folder.');
            return;
        }
        
        if (confirm('Are you sure you want to delete all cards in the current folder? This cannot be undone.')) {
            // Get all cards in current folder and delete them one by one
            CardManager.currentCards.forEach(card => {
                CardManager.removeCard(card.id);
            });
            
            this.renderCardList();
        }
    },
    
    /**
     * Update the state of the Start Learning button
     */
    updateStartLearningButtonState() {
        this.startLearningBtn.disabled = CardManager.getCardCount() === 0;
    }
};