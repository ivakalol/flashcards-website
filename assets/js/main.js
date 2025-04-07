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
    const infoButton = document.getElementById('info-button');
    const infoModal = document.getElementById('info-modal');
    const infoModalClose = document.getElementById('info-modal-close');
    const dataModal = document.getElementById('data-modal');
    const dataModalTitle = document.getElementById('data-modal-title');
    const dataForm = document.getElementById('data-form');
    const folderNameLabel = document.getElementById('folder-name-label');
    const folderNameInput = document.getElementById('folder-name');
    const flashcardTitleLabel = document.getElementById('flashcard-title-label');
    const flashcardTitleInput = document.getElementById('flashcard-title');
    const flashcardDescriptionLabel = document.getElementById('flashcard-description-label');
    const flashcardDescriptionInput = document.getElementById('flashcard-description');
    const dataModalSave = document.getElementById('data-modal-save');
    const dataModalClose = document.getElementById('data-modal-close');

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
        openDataModal('folder');
    });

    // Add flashcard functionality
    addFlashcardButton.addEventListener('click', () => {
        openDataModal('flashcard');
    });

    // Open data modal
    function openDataModal(type) {
        dataModalTitle.textContent = `Enter ${type === 'folder' ? 'Folder Name' : 'Flashcard Details'}`;
        folderNameLabel.classList.toggle('hidden', type !== 'folder');
        folderNameInput.classList.toggle('hidden', type !== 'folder');
        flashcardTitleLabel.classList.toggle('hidden', type !== 'flashcard');
        flashcardTitleInput.classList.toggle('hidden', type !== 'flashcard');
        flashcardDescriptionLabel.classList.toggle('hidden', type !== 'flashcard');
        flashcardDescriptionInput.classList.toggle('hidden', type !== 'flashcard');

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

        if (!folderNameInput.classList.contains('hidden')) {
            const folderName = folderNameInput.value;
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
            renderContent(currentFolder);
            showPopup('Folder created successfully');
        } else {
            const flashcardTitle = flashcardTitleInput.value;
            const flashcardDescription = flashcardDescriptionInput.value;
            const flashcard = {
                title: flashcardTitle,
                description: flashcardDescription,
                parent: currentFolder
            };
            currentFolder.flashcards.push(flashcard);
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

        addFlashcardButton.disabled = false;
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
        popup.classList.remove('hidden');
        popup.classList.add('show');
        setTimeout(() => {
            popup.classList.remove('show');
            popup.classList.add('hidden');
        }, 2500);
    }

    // Close popup message
    popupClose.addEventListener('click', () => {
        popup.classList.remove('show');
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
});