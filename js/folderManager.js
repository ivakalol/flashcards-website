/**
 * Folder Manager for handling folder operations in the UI
 */
const FolderManager = {
    /**
     * Initialize the folder manager
     */
    init() {
        this.folderPath = document.getElementById('folderPath');
        this.folderList = document.getElementById('folderList');
        this.addFolderBtn = document.getElementById('addFolderBtn');
        this.addFolderSection = document.getElementById('addFolderSection');
        this.folderNameInput = document.getElementById('folderName');
        this.saveFolderBtn = document.getElementById('saveFolderBtn');
        this.cancelFolderBtn = document.getElementById('cancelFolderBtn');
        
        // Attach event listeners
        this.addFolderBtn.addEventListener('click', () => this.showAddFolderForm());
        this.saveFolderBtn.addEventListener('click', () => this.saveFolder());
        this.cancelFolderBtn.addEventListener('click', () => this.hideAddFolderForm());
        
        // Editing state
        this.editingFolderId = null;
        
        // Initially render folder structure
        this.renderFolderPath();
        this.renderFolderList();
    },
    
    /**
     * Show the add folder form
     */
    showAddFolderForm() {
        this.editingFolderId = null;
        this.folderNameInput.value = '';
        this.addFolderSection.style.display = 'block';
        this.folderNameInput.focus();
    },
    
    /**
     * Hide the add folder form
     */
    hideAddFolderForm() {
        this.addFolderSection.style.display = 'none';
        this.editingFolderId = null;
    },
    
    /**
     * Save a new folder or update an existing one
     */
    saveFolder() {
        const folderName = this.folderNameInput.value.trim();
        
        if (!folderName) {
            alert('Please enter a folder name.');
            return;
        }
        
        if (this.editingFolderId) {
            // Rename existing folder
            try {
                CardManager.renameFolder(this.editingFolderId, folderName);
            } catch (error) {
                alert(`Could not rename folder: ${error.message}`);
                return;
            }
        } else {
            // Create new folder
            try {
                CardManager.createFolder(folderName);
            } catch (error) {
                alert(`Could not create folder: ${error.message}`);
                return;
            }
        }
        
        this.hideAddFolderForm();
        this.renderFolderList();
    },
    
    /**
     * Show form to edit a folder's name
     * @param {string} folderId - ID of the folder to edit
     * @param {string} currentName - Current name of the folder
     */
    showEditFolderForm(folderId, currentName) {
        this.editingFolderId = folderId;
        this.folderNameInput.value = currentName;
        this.addFolderSection.style.display = 'block';
        this.folderNameInput.focus();
    },
    
    /**
     * Delete a folder after confirmation
     * @param {string} folderId - ID of the folder to delete
     * @param {string} folderName - Name of the folder (for confirmation message)
     */
    deleteFolder(folderId, folderName) {
        if (confirm(`Are you sure you want to delete the folder "${folderName}" and all its contents? This cannot be undone.`)) {
            try {
                CardManager.deleteFolder(folderId);
                this.renderFolderList();
            } catch (error) {
                alert(`Could not delete folder: ${error.message}`);
            }
        }
    },
    
    /**
     * Navigate to a folder
     * @param {string} folderId - ID of the folder to navigate to
     */
    navigateToFolder(folderId) {
        CardManager.navigateToFolder(folderId);
        this.renderFolderPath();
        this.renderFolderList();
        UIController.renderCardList();
    },
    
    /**
     * Render the folder path (breadcrumb navigation)
     */
    renderFolderPath() {
        const path = CardManager.getCurrentPath();
        this.folderPath.innerHTML = '';
        
        path.forEach((folder, index) => {
            const pathItem = document.createElement('span');
            pathItem.className = 'path-item';
            
            // Make each part of the path clickable
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = folder.name;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToFolder(folder.id);
            });
            
            pathItem.appendChild(link);
            this.folderPath.appendChild(pathItem);
            
            // Add separator except for the last item
            if (index < path.length - 1) {
                const separator = document.createElement('span');
                separator.className = 'path-separator';
                separator.textContent = ' > ';
                this.folderPath.appendChild(separator);
            }
        });
    },
    
    /**
     * Render the list of subfolders in the current folder
     */
    renderFolderList() {
        this.folderList.innerHTML = '';
        const subfolders = CardManager.getSubfolders();
        
        if (subfolders.length === 0) {
            this.folderList.innerHTML = '<p class="empty-state">No folders yet.</p>';
        } else {
            subfolders.forEach(folder => {
                const folderElement = document.createElement('div');
                folderElement.className = 'folder-item';
                
                folderElement.innerHTML = `
                    <div class="folder-actions">
                        <button class="edit-folder-btn" data-id="${folder.id}" data-name="${this.escapeHtml(folder.name)}">
                            <span class="action-icon">📝</span>
                        </button>
                        <button class="delete-folder-btn" data-id="${folder.id}" data-name="${this.escapeHtml(folder.name)}">
                            <span class="action-icon delete-icon">❌</span>
                        </button>
                    </div>
                    <div class="folder-content" data-id="${folder.id}">
                        <span class="folder-icon">📁</span>
                        <span class="folder-name" title="${this.escapeHtml(folder.name)}">${this.escapeHtml(folder.name)}</span>
                    </div>
                `;
                
                this.folderList.appendChild(folderElement);
                
                // Add event listeners
                folderElement.querySelector('.folder-content').addEventListener('click', (e) => {
                    const folderId = e.currentTarget.dataset.id;
                    this.navigateToFolder(folderId);
                });
                
                folderElement.querySelector('.edit-folder-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const folderId = e.currentTarget.dataset.id;
                    const folderName = e.currentTarget.dataset.name;
                    this.showEditFolderForm(folderId, folderName);
                });
                
                folderElement.querySelector('.delete-folder-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const folderId = e.currentTarget.dataset.id;
                    const folderName = e.currentTarget.dataset.name;
                    this.deleteFolder(folderId, folderName);
                });
            });
        }
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
    }
};