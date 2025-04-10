/**
 * Utility functions for card operations
 */

/**
 * Sort cards by different criteria
 * @param {Array} cards - Array of flashcard objects
 * @param {string} sortBy - Sorting criteria (date, known, alphabetical)
 * @returns {Array} - Sorted array of cards
 */
export const sortCards = (cards, sortBy = 'date') => {
    if (!cards || cards.length === 0) return [];
    
    switch (sortBy) {
      case 'alphabetical':
        return [...cards].sort((a, b) => a.question.localeCompare(b.question));
      case 'known':
        return [...cards].sort((a, b) => (a.known === b.known) ? 0 : a.known ? 1 : -1);
      case 'date':
      default:
        return [...cards].sort((a, b) => {
          return new Date(b.dateCreated || 0) - new Date(a.dateCreated || 0);
        });
    }
  };
  
  /**
   * Filter cards based on search term
   * @param {Array} cards - Array of flashcard objects
   * @param {string} searchTerm - Search term to filter by
   * @returns {Array} - Filtered array of cards
   */
  export const filterCards = (cards, searchTerm) => {
    if (!searchTerm) return cards;
    
    const term = searchTerm.toLowerCase();
    return cards.filter(card => 
      card.question.toLowerCase().includes(term) || 
      card.answer.toLowerCase().includes(term)
    );
  };
  
  /**
   * Generate a unique ID for new cards
   * @returns {string} - Unique ID
   */
  export const generateCardId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };