const gridContainer = document.getElementById('gridContainer');
const gridSizeInput = document.getElementById('gridSize');
const applySizeButton = document.getElementById('applySize');
const saveLayoutButton = document.getElementById('saveLayout');
const loadLayoutButton = document.getElementById('loadLayout');
const videoFileInput = document.getElementById('videoFileInput');

applySizeButton.addEventListener('click', createGrid);
saveLayoutButton.addEventListener('click', saveLayout);
loadLayoutButton.addEventListener('click', loadLayout);

function createGrid() {
    const gridSize = parseInt(gridSizeInput.value);
    gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 100px)`;
    gridContainer.style.gridTemplateRows = `repeat(${gridSize}, 100px)`;
    
    // Clear previous grid items
    gridContainer.innerHTML = '';
    
    // Create new grid items
    for (let i = 1; i <= gridSize * gridSize; i++) {
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';
        gridItem.contentEditable = 'true';
        gridItem.textContent = i;
        gridItem.addEventListener('dblclick', () => selectVideoFile(gridItem));
        gridContainer.appendChild(gridItem);
    }
    
    applyDragAndDrop();
}

function applyDragAndDrop() {
    const gridItems = document.querySelectorAll('.grid-item');
    let draggedItem = null;

    gridItems.forEach(item => {
        item.addEventListener('dragstart', () => {
            draggedItem = item;
            setTimeout(() => item.style.display = 'none', 0);
        });

        item.addEventListener('dragend', () => {
            setTimeout(() => {
                draggedItem.style.display = 'block';
                draggedItem = null;
            }, 0);
        });

        item.addEventListener('dragover', e => {
            e.preventDefault();
        });

        item.addEventListener('dragenter', e => {
            e.preventDefault();
            item.style.border = '2px dashed #000';
        });

        item.addEventListener('dragleave', () => {
            item.style.border = '1px solid #ccc';
        });

        item.addEventListener('drop', () => {
            item.style.border = '1px solid #ccc';
            if (draggedItem !== item) {
                let currentItemContent = item.innerHTML;
                item.innerHTML = draggedItem.innerHTML;
                draggedItem.innerHTML = currentItemContent;

                // Swap video elements if any
                let draggedVideo = draggedItem.querySelector('video');
                let targetVideo = item.querySelector('video');

                if (draggedVideo) {
                    draggedItem.appendChild(targetVideo);
                    item.appendChild(draggedVideo);
                }
            }
        });
    });

    gridItems.forEach(item => {
        item.setAttribute('draggable', 'true');
    });
}

function selectVideoFile(gridItem) {
    videoFileInput.onchange = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'video/mp4') {
            const videoURL = URL.createObjectURL(file);
            populateGridItemWithVideo(gridItem, videoURL);
        }
    };
    videoFileInput.click();
}

function populateGridItemWithVideo(gridItem, videoURL) {
    gridItem.innerHTML = ''; // Clear previous content
    const video = document.createElement('video');
    video.src = videoURL;
    video.controls = true;
    video.loop = true;
    gridItem.classList.add('playing');
    gridItem.appendChild(video);
}

function saveLayout() {
    const gridItems = document.querySelectorAll('.grid-item');
    const layout = Array.from(gridItems).map(item => {
        const video = item.querySelector('video');
        if (video) {
            return { type: 'video', content: video.src };
        } else {
            return { type: 'text', content: item.textContent };
        }
    });
    localStorage.setItem('gridLayout', JSON.stringify(layout));
}

function loadLayout() {
    const savedLayout = JSON.parse(localStorage.getItem('gridLayout'));
    if (savedLayout) {
        const gridSize = Math.sqrt(savedLayout.length);
        gridSizeInput.value = gridSize;
        createGrid();
        const gridItems = document.querySelectorAll('.grid-item');
        savedLayout.forEach((item, index) => {
            if (item.type === 'video') {
                populateGridItemWithVideo(gridItems[index], item.content);
            } else {
                gridItems[index].innerHTML = item.content;
                gridItems[index].classList.remove('playing');
            }
        });
    } else {
        alert('No saved layout found');
    }
}

// Initialize default grid on page load
window.onload = createGrid;
