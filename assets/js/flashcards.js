// Flashcards related functions can be added here

// Example function to add a new flashcard
function addFlashcard(title, description, parentFolder) {
    const flashcard = {
        title: title,
        description: description,
        parent: parentFolder
    };
    parentFolder.flashcards.push(flashcard);
    renderContent(parentFolder);
}