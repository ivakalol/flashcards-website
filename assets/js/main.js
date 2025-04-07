document.addEventListener('DOMContentLoaded', () => {
    const addFolderButton = document.getElementById('add-folder');
    const addFlashcardButton = document.getElementById('add-flashcard');
    const playFlashcardsButton = document.getElementById('play-flashcards');
    const content = document.getElementById('content');
    const breadcrumb = document.getElementById('breadcrumb');
    const contextMenu = document.getElementById('context-menu');
    const deleteItemButton = document.getElementById('delete-item');
    const popup = document.getElementById('popup');
    const popupMessage = document.querySelector('.popup-message');
    const popupClose = document.getElementById('popup-close');
    const infoButton = document.getElementById('info-button');
    const infoModal = document.getElementById('info-modal');
    const infoModalClose = document.getElementById('info-modal-close');
    const dataModal = document.getElementById('data-modal');
    const dataModalTitle = document.getElementById('data-modal-title');
    const dataForm = document.getElementById('data-form');
    
    // Form elements
    const folderFormSection = document.getElementById('folder-form-section');
    const flashcardFormSection = document.getElementById('flashcard-form-section');
    const folderNameInput = document.getElementById('folder-name');
    const flashcardTitleInput = document.getElementById('flashcard-title');
    const flashcardDescriptionInput = document.getElementById('flashcard-description');
    
    const dataModalSave = document.getElementById('data-modal-save');
    const dataModalClose = document.getElementById('data-modal-close');
    
    // Study mode elements
    const studyModal = document.getElementById('study-modal');
    const flashcardContainer = document.getElementById('flashcard-container');
    const flashcardCard = document.querySelector('.flashcard-study-card');
    const flashcardFront = document.getElementById('flashcard-front');
    const flashcardBack = document.getElementById('flashcard-back');
    const prevCardButton = document.getElementById('prev-card');
    const nextCardButton = document.getElementById('next-card');
    const cardCounter = document.getElementById('card-counter');
    const studyModalClose = document.getElementById('study-modal-close');

    // Set the study modal to be wider
    studyModal.classList.add('study-modal');

    // Track current modal type
    let currentModalType = null;

    // Study mode variables
    let studyCards = [];
    let currentCardIndex = 0;

    // Load data from localStorage or use default
    let rootFolder = loadData() || {
        name: 'Home',
        subFolders: [],
        flashcards: [],
        parent: null
    };

    let currentFolder = rootFolder;
    let currentItem = null;

    renderContent(currentFolder);

    // Add folder functionality
    addFolderButton.addEventListener('click', () => {
        openDataModal('folder');
    });

    // Add flashcard functionality
    addFlashcardButton.addEventListener('click', () => {
        openDataModal('flashcard');
    });

    // Play flashcards functionality
    playFlashcardsButton.addEventListener('click', () => {
        startStudyMode();
    });

    // Open data modal
    function openDataModal(type) {
        currentModalType = type;
        
        // Reset form
        dataForm.reset();
        
        // Hide both form sections initially
        folderFormSection.style.display = 'none';
        flashcardFormSection.style.display = 'none';
        
        // Show only the appropriate section based on type
        if (type === 'folder') {
            dataModalTitle.textContent = 'Enter Folder Name';
            folderFormSection.style.display = 'block';
            folderNameInput.focus();
        } else if (type === 'flashcard') {
            dataModalTitle.textContent = 'Enter Flashcard Details';
            flashcardFormSection.style.display = 'block';
            flashcardTitleInput.focus();
        }

        // Show the modal
        dataModal.classList.remove('hidden');
        dataModal.classList.add('show');
    }

    // Close data modal
    dataModalClose.addEventListener('click', () => {
        closeDataModal();
    });

    // Handle form submission
    dataForm.addEventListener('submit', (event) => {
        event.preventDefault();

        if (currentModalType === 'folder') {
            const folderName = folderNameInput.value.trim();
            if (!folderName) {
                showPopup('Folder name cannot be empty');
                return;
            }
            if (currentFolder.subFolders.some(f => f.name === folderName)) {
                showPopup('Folder name already exists');
                return;
            }
            const folder = {
                name: folderName,
                subFolders: [],
                flashcards: [],
                parent: currentFolder
            };
            currentFolder.subFolders.push(folder);
            saveData();
            renderContent(currentFolder);
            showPopup('Folder created successfully');
        } else if (currentModalType === 'flashcard') {
            const flashcardTitle = flashcardTitleInput.value.trim();
            const flashcardDescription = flashcardDescriptionInput.value.trim();
            
            if (!flashcardTitle) {
                showPopup('Flashcard title cannot be empty');
                return;
            }
            
            const flashcard = {
                title: flashcardTitle,
                description: flashcardDescription,
                parent: currentFolder
            };
            currentFolder.flashcards.push(flashcard);
            saveData();
            renderContent(currentFolder);
            showPopup('Flashcard created successfully');
        }

        closeDataModal();
    });

    // Close data modal function
    function closeDataModal() {
        dataModal.classList.remove('show');
        setTimeout(() => {
            dataModal.classList.add('hidden');
            dataForm.reset();
            currentModalType = null;
        }, 300);
    }

    // Render content
    function renderContent(folder) {
        content.innerHTML = '';
        breadcrumb.innerHTML = '';

        // Update breadcrumb
        let tempFolder = folder;
        const path = [];
        while (tempFolder) {
            path.unshift(tempFolder);
            tempFolder = tempFolder.parent;
        }
        path.forEach((f, index) => {
            const link = document.createElement('a');
            link.textContent = f.name;
            link.href = '#';
            link.addEventListener('click', () => {
                currentFolder = f;
                renderContent(f);
            });
            breadcrumb.appendChild(link);
            if (index < path.length - 1) {
                breadcrumb.appendChild(document.createTextNode(' / '));
            }
        });

        // Render subfolders
        folder.subFolders.forEach((subFolder, index) => {
            const folderDiv = document.createElement('div');
            folderDiv.classList.add('folder');
            folderDiv.innerHTML = `<i class="fas fa-folder"></i> <span>${subFolder.name}</span> <button class="delete-button hidden" aria-label="Delete Folder"><i class="fas fa-trash-alt"></i></button>`;
            folderDiv.setAttribute('tabindex', '0');
            folderDiv.setAttribute('role', 'button');
            folderDiv.addEventListener('click', () => {
                currentFolder = subFolder;
                renderContent(subFolder);
            });
            folderDiv.querySelector('.delete-button').addEventListener('click', (event) => {
                event.stopPropagation();
                deleteItem(subFolder);
            });
            folderDiv.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                showContextMenu(event, subFolder, folderDiv);
            });
            folderDiv.addEventListener('touchstart', (event) => handleTouchStart(event, folderDiv), { passive: false });
            folderDiv.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    folderDiv.click();
                }
            });
            content.appendChild(folderDiv);

            // Focus newly added folder
            if (index === folder.subFolders.length - 1) {
                folderDiv.focus();
            }
        });

        // Render flashcards
        folder.flashcards.forEach((flashcard, index) => {
            const flashcardDiv = document.createElement('article');
            flashcardDiv.classList.add('flashcard');
            flashcardDiv.innerHTML = `
                <div class="flashcard-title">${flashcard.title}</div>
                <div class="flashcard-description hidden" aria-label="Flashcard description">${flashcard.description}</div>
                <button class="delete-button hidden" aria-label="Delete Flashcard"><i class="fas fa-trash-alt"></i></button>
            `;
            flashcardDiv.setAttribute('tabindex', '0');
            flashcardDiv.setAttribute('role', 'button');
            flashcardDiv.addEventListener('click', () => {
                flashcardDiv.querySelector('.flashcard-description').classList.toggle('hidden');
            });
            flashcardDiv.querySelector('.delete-button').addEventListener('click', (event) => {
                event.stopPropagation();
                deleteItem(flashcard);
            });
            flashcardDiv.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                showContextMenu(event, flashcard, flashcardDiv);
            });
            flashcardDiv.addEventListener('touchstart', (event) => handleTouchStart(event, flashcardDiv), { passive: false });
            flashcardDiv.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    flashcardDiv.click();
                }
            });
            content.appendChild(flashcardDiv);

            // Focus newly added flashcard
            if (index === folder.flashcards.length - 1) {
                flashcardDiv.focus();
            }
        });

        // Enable or disable buttons based on content
        addFlashcardButton.disabled = false;
        playFlashcardsButton.disabled = folder.flashcards.length === 0;
    }

    // Show context menu
    function showContextMenu(event, item, element) {
        currentItem = item;
        const deleteButton = element.querySelector('.delete-button');
        deleteButton.classList.remove('hidden');
        contextMenu.classList.add('show'); // Add show class for animation
        deleteButton.style.top = `${Math.min(event.clientY, window.innerHeight - 40)}px`;
        deleteButton.style.left = `${Math.min(event.clientX, window.innerWidth - 100)}px`;

        deleteButton.addEventListener('click', () => {
            if (currentItem.subFolders !== undefined) {
                // It's a folder
                const index = currentItem.parent.subFolders.indexOf(currentItem);
                if (index > -1) {
                    currentItem.parent.subFolders.splice(index, 1);
                }
            } else {
                // It's a flashcard
                const index = currentItem.parent.flashcards.indexOf(currentItem);
                if (index > -1) {
                    currentItem.parent.flashcards.splice(index, 1);
                }
            }
            saveData();
            renderContent(currentFolder);
            showPopup('Item deleted successfully');
        });
    }

    // Hide context menu when clicking outside
    document.addEventListener('click', (event) => {
        if (!contextMenu.contains(event.target)) {
            hideContextMenu();
        }
    });

    // Hide context menu
    function hideContextMenu() {
        const deleteButtons = document.querySelectorAll('.delete-button');
        deleteButtons.forEach(button => button.classList.add('hidden'));
        contextMenu.classList.remove('show'); // Remove show class for animation
    }

    // Handle touchstart for mobile
    let touchTimeout;
    function handleTouchStart(event, element) {
        touchTimeout = setTimeout(() => {
            event.preventDefault();
            showContextMenu(event, event.currentTarget, element);
        }, 500);
        element.addEventListener('touchend', handleTouchEnd);
    }

    // Handle touchend for mobile
    function handleTouchEnd(event) {
        clearTimeout(touchTimeout);
        event.currentTarget.removeEventListener('touchend', handleTouchEnd);
    }

    // Delete item function
    function deleteItem(item) {
        if (item.subFolders !== undefined) {
            // It's a folder
            const index = item.parent.subFolders.indexOf(item);
            if (index > -1) {
                item.parent.subFolders.splice(index, 1);
            }
        } else {
            // It's a flashcard
            const index = item.parent.flashcards.indexOf(item);
            if (index > -1) {
                item.parent.flashcards.splice(index, 1);
            }
        }
        saveData();
        renderContent(currentFolder);
        showPopup('Item deleted successfully');
    }

    // Show popup message
    function showPopup(message) {
        popupMessage.textContent = message;
        popup.classList.remove('hidden');
        popup.classList.add('show');
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => {
                popup.classList.add('hidden');
            }, 300);
        }, 2500);
    }

    // Close popup message
    popupClose.addEventListener('click', () => {
        popup.classList.remove('show');
        setTimeout(() => {
            popup.classList.add('hidden');
        }, 300);
    });

    // Show info modal
    infoButton.addEventListener('click', () => {
        infoModal.classList.remove('hidden');
        infoModal.classList.add('show');
    });

    // Close info modal
    infoModalClose.addEventListener('click', () => {
        infoModal.classList.remove('show');
        setTimeout(() => {
            infoModal.classList.add('hidden');
        }, 300);
    });

    // Focus newly added item
    function focusNewItem() {
        const newItem = content.lastElementChild;
        if (newItem) {
            newItem.focus();
        }
    }

    // Start study mode
    function startStudyMode() {
        if (currentFolder.flashcards.length === 0) {
            showPopup('No flashcards to study in this folder');
            return;
        }

        studyCards = [...currentFolder.flashcards];
        currentCardIndex = 0;
        
        // Display the first card
        displayCurrentCard();
        
        // Show the study modal
        studyModal.classList.remove('hidden');
        studyModal.classList.add('show');
        
        // Reset the card flip
        flashcardCard.classList.remove('flipped');
    }

    // Display current card in study mode
    function displayCurrentCard() {
        const card = studyCards[currentCardIndex];
        
        // Update card content
        flashcardFront.textContent = card.title;
        flashcardBack.textContent = card.description;
        
        // Reset the card flip
        flashcardCard.classList.remove('flipped');
        
        // Update counter
        cardCounter.textContent = `Card ${currentCardIndex + 1} of ${studyCards.length}`;
        
        // Enable/disable prev/next buttons
        prevCardButton.disabled = currentCardIndex === 0;
        nextCardButton.disabled = currentCardIndex === studyCards.length - 1;
    }

    // Flip card when clicked
    flashcardContainer.addEventListener('click', () => {
        flashcardCard.classList.toggle('flipped');
    });

    // Previous card button
    prevCardButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent triggering the flashcard flip
        if (currentCardIndex > 0) {
            currentCardIndex--;
            displayCurrentCard();
        }
    });

    // Next card button
    nextCardButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent triggering the flashcard flip
        if (currentCardIndex < studyCards.length - 1) {
            currentCardIndex++;
            displayCurrentCard();
        }
    });

    // Close study modal
    studyModalClose.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent triggering the flashcard flip
        studyModal.classList.remove('show');
        setTimeout(() => {
            studyModal.classList.add('hidden');
        }, 300);
    });

    // Save data to localStorage
    function saveData() {
        // Create a deep copy of the data structure without circular references
        const cleanData = cleanDataForStorage(rootFolder);
        localStorage.setItem('flashcardsData', JSON.stringify(cleanData));
    }

    // Clean data for storage by removing parent references to avoid circular structure
    function cleanDataForStorage(folder) {
        const cleanFolder = {
            name: folder.name,
            subFolders: [],
            flashcards: []
        };
        
        // Copy and clean subfolders
        folder.subFolders.forEach(subFolder => {
            cleanFolder.subFolders.push(cleanDataForStorage(subFolder));
        });
        
        // Copy flashcards (without parent reference)
        folder.flashcards.forEach(flashcard => {
            cleanFolder.flashcards.push({
                title: flashcard.title,
                description: flashcard.description
            });
        });
        
        return cleanFolder;
    }

    // Load data from localStorage
    function loadData() {
        const savedData = localStorage.getItem('flashcardsData');
        if (!savedData) return null;
        
        try {
            const parsedData = JSON.parse(savedData);
            return restoreParentReferences(parsedData, null);
        } catch (error) {
            console.error('Failed to load data:', error);
            return null;
        }
    }

    // Restore parent references in the loaded data
    function restoreParentReferences(folder, parent) {
        folder.parent = parent;
        
        // Restore parent references for subfolders
        folder.subFolders.forEach(subFolder => {
            restoreParentReferences(subFolder, folder);
        });
        
        // Restore parent references for flashcards
        folder.flashcards.forEach(flashcard => {
            flashcard.parent = folder;
        });
        
        return folder;
    }
});