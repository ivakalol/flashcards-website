// Navigation related functions can be added here

// Example function to update breadcrumb navigation
function updateBreadcrumb(folder) {
    const breadcrumb = document.getElementById('breadcrumb');
    breadcrumb.innerHTML = '';

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
}