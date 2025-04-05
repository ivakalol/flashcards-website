document.addEventListener('DOMContentLoaded', () => {
    const addFolderButton = document.getElementById('add-folder');
    const addFlashcardButton = document.getElementById('add-flashcard');
    const content = document.getElementById('content');
    const breadcrumb = document.getElementById('breadcrumb');
    const contextMenu = document.getElementById('context-menu');
    const deleteItemButton = document.getElementById('delete-item');

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
            folderDiv.innerHTML = `<i class="fas fa-folder"></i> <span>${subFolder.name}</span>`;
            folderDiv.addEventListener('click', () => {
                currentFolder = subFolder;
                renderContent(subFolder);
            });
            folderDiv.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                showContextMenu(event, subFolder, folderDiv);
            });
            folderDiv.addEventListener('touchstart', handleTouchStart, { passive: false });
            content.appendChild(folderDiv);
        });

        // Render flashcards
        folder.flashcards.forEach(flashcard => {
            const flashcardDiv = document.createElement('div');
            flashcardDiv.classList.add('flashcard');
            flashcardDiv.innerHTML = `
                <div class="flashcard-title">${flashcard.title}</div>
                <div class="flashcard-description hidden">${flashcard.description}</div>
                <button class="delete-button hidden">Delete</button>
            `;
            flashcardDiv.addEventListener('click', () => {
                flashcardDiv.querySelector('.flashcard-description').classList.toggle('hidden');
            });
            flashcardDiv.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                showContextMenu(event, flashcard, flashcardDiv);
            });
            flashcardDiv.addEventListener('touchstart', handleTouchStart, { passive: false });
            content.appendChild(flashcardDiv);
        });

        addFlashcardButton.disabled = false;
    }

    // Show context menu
    function showContextMenu(event, item, element) {
        currentItem = item;
        const deleteButton = element.querySelector('.delete-button');
        deleteButton.classList.remove('hidden');
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
    }

    // Handle touchstart for mobile
    let touchTimeout;
    function handleTouchStart(event) {
        touchTimeout = setTimeout(() => {
            event.preventDefault();
            showContextMenu(event, event.currentTarget, event.currentTarget);
        }, 500);
        event.currentTarget.addEventListener('touchend', handleTouchEnd);
    }

    // Handle touchend for mobile
    function handleTouchEnd(event) {
        clearTimeout(touchTimeout);
        event.currentTarget.removeEventListener('touchend', handleTouchEnd);
    }
});