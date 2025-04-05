document.addEventListener('DOMContentLoaded', () => {
    const addFolderButton = document.getElementById('add-folder');
    const addFlashcardButton = document.getElementById('add-flashcard');
    const content = document.getElementById('content');
    const breadcrumb = document.getElementById('breadcrumb');
    const contextMenu = document.getElementById('context-menu');
    const deleteItemButton = document.getElementById('delete-item');
    const popup = document.getElementById('popup');
    const popupMessage = document.querySelector('.popup-message');
    const popupClose = document.getElementById('popup-close');

    let currentFolder = {
        name: 'Home',
        subFolders: [],
        flashcards: [],
        parent: null
    };

    let currentItem = null;

    renderContent(currentFolder);

    // Add folder functionality
    addFolderButton.addEventListener('click', () => {
        const folderName = prompt('Enter folder name:');
        if (folderName) {
            const folder = {
                name: folderName,
                subFolders: [],
                flashcards: [],
                parent: currentFolder
            };
            currentFolder.subFolders.push(folder);
            renderContent(currentFolder);
            showPopup('Folder created successfully');
        }
    });

    // Add flashcard functionality
    addFlashcardButton.addEventListener('click', () => {
        const flashcardTitle = prompt('Enter flashcard title:');
        const flashcardDescription = prompt('Enter flashcard description:');
        if (flashcardTitle && flashcardDescription) {
            const flashcard = {
                title: flashcardTitle,
                description: flashcardDescription,
                parent: currentFolder
            };
            currentFolder.flashcards.push(flashcard);
            renderContent(currentFolder);
            showPopup('Flashcard created successfully');
        }
    });

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
        folder.subFolders.forEach(subFolder => {
            const folderDiv = document.createElement('div');
            folderDiv.classList.add('folder');
            folderDiv.innerHTML = `<i class="fas fa-folder"></i> <span>${subFolder.name}</span> <button class="delete-button hidden"><i class="fas fa-trash-alt"></i></button>`;
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
        });

        // Render flashcards
        folder.flashcards.forEach(flashcard => {
            const flashcardDiv = document.createElement('article');
            flashcardDiv.classList.add('flashcard');
            flashcardDiv.innerHTML = `
                <div class="flashcard-title">${flashcard.title}</div>
                <div class="flashcard-description hidden" aria-label="Flashcard description">${flashcard.description}</div>
                <button class="delete-button hidden"><i class="fas fa-trash-alt"></i></button>
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
        });

        addFlashcardButton.disabled = false;
    }

    // Show context menu
    function showContextMenu(event, item, element) {
        currentItem = item;
        const deleteButton = element.querySelector('.delete-button');
        deleteButton.classList.remove('hidden');
        contextMenu.classList.add('show'); // Add show class for animation
        deleteButton.style.top = `${event.clientY}px`;
        deleteButton.style.left = `${event.clientX}px`;

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
        renderContent(currentFolder);
    }

    // Show popup message
    function showPopup(message) {
        popupMessage.textContent = message;
        popup.classList.add('show');
    }

    // Close popup message
    popupClose.addEventListener('click', () => {
        popup.classList.remove('show');
    });
});