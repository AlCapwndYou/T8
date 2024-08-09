let filterPreference = 'all';
let isAutoPlayEnabled = false;
let isSortableEnabled = false;
let currentPage = 1;
let rows = 3;
let columns = 3;
let currentCharacter = 'Alisa'; // Default character

const characters = ['Alisa', 'Azucena', 'Asuka', 'Bryan', 'Claudio', 'Devil Jin', 'Dragunov', 'Eddy', 'Feng','Heihachi', 'Hwoarang', 'Jin', 'Jack-8', 'Kazuya', 'King', 'Kuma', 'Lars', 'Law', 'Lee', 'Lidia', 'Lili', 'Nina', 'Panda','Paul', 'Raven', 'Reina', 'Shaheen', 'Steve', 'Victor','Xiaoyu', 'Yoshimitsu', 'Zafina'];

const iconMap = {
    punishable: '👊',
    sidestepRight: '👟➡️',
    sidestepLeft: '👟⬅️',
    sidewalkRight: '🚶➡️',
    sidewalkLeft: '🚶⬅️',
    heat: '<img src="media/heat4-small.png" alt="Heat" width="32" height="32">',
    launcher: '⚠️',
    keyMove: '🔑',
    duckable: '🦆',
    mixup: '🎰',
    plusOnBlock: '🛑',
    parryable: '⚔️',
    sabaki: '🔄',
    extensionSingle: '➡️',
    extensionMultiple: '🔀'
};

// Function to load character data from JSON and apply filtering, pagination, and rendering
function loadCharacterData(character) {
    fetch(`json/${character}.json`)
        .then(response => response.json())
        .then(data => {
            let filteredMoves = filterMoves(data.moves);
            renderMoves(filteredMoves);
        })
        .catch(error => {
            console.error('Error loading character data:', error);
            document.getElementById('move-list').innerHTML = '<p>Error loading character data. Please try again later.</p>';
        });
}

// Function to filter moves based on the filter preference
function filterMoves(moves) {
    return moves.filter(move => 
        filterPreference === 'favorites' ? localStorage.getItem(`${currentCharacter}-${move.name}`) :
        filterPreference === 'all' ? true :
        move.properties.includes(filterPreference)
    );
}

// Function to render the moves on the grid with pagination
function renderMoves(moves) {
    const moveList = document.getElementById('move-list');
    moveList.innerHTML = '';

    const totalItems = rows * columns;
    const paginatedMoves = moves.slice((currentPage - 1) * totalItems, currentPage * totalItems);

    paginatedMoves.forEach(move => {
        const moveDiv = document.createElement('div');
        moveDiv.classList.add('move');
        moveDiv.dataset.move = move.input;

        const moveVideo = document.createElement('video');
        moveVideo.src = `media/${currentCharacter}/${move.input}.mp4`;
        moveVideo.controls = true;
        moveVideo.muted = true;
        moveVideo.loop = true;
        if (isAutoPlayEnabled) moveVideo.autoplay = true;
        moveDiv.appendChild(moveVideo);

        const moveName = document.createElement('h3');
        moveName.textContent = move.name;
        moveDiv.appendChild(moveName);

        const favoriteIcon = document.createElement('span');
        favoriteIcon.classList.add('favorite');
        favoriteIcon.textContent = '❤️';
        if (localStorage.getItem(`${currentCharacter}-${move.name}`)) {
            favoriteIcon.classList.add('active');
        }
        favoriteIcon.addEventListener('click', () => toggleFavorite(move.name, favoriteIcon));
        moveDiv.appendChild(favoriteIcon);

        const legendDiv = document.createElement('div');
        legendDiv.classList.add('legend');
        move.properties.forEach(property => {
            if (iconMap[property]) {
                const legendItem = document.createElement('div');
                legendItem.classList.add('legend-item');
                const iconSpan = document.createElement('span');
                iconSpan.innerHTML = iconMap[property];
                iconSpan.classList.add('icon-tooltip');
                iconSpan.title = property.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                legendItem.appendChild(iconSpan);
                legendDiv.appendChild(legendItem);
            }
        });
        moveDiv.appendChild(legendDiv);

        moveList.appendChild(moveDiv);
    });

    document.getElementById('current-page').textContent = currentPage;
    document.getElementById('total-pages').textContent = Math.ceil(moves.length / totalItems);
    enableSorting(); 
    loadCustomPlaylist();
}

// Function to toggle favorite state
function toggleFavorite(moveName, icon) {
    const key = `${currentCharacter}-${moveName}`;
    if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        icon.classList.remove('active');
    } else {
        localStorage.setItem(key, 'true');
        icon.classList.add('active');
    }
}

// Function to initialize character navigation
function initializeCharacterNav() {
    const nav = document.getElementById('character-nav');
    characters.forEach(character => {
        const characterItem = document.createElement('div');
        characterItem.classList.add('character-item');
        characterItem.textContent = character;

        const characterIcon = document.createElement('img');
        characterIcon.classList.add('character-icon');
        loadCharacterIcon(character, characterIcon);

        characterItem.appendChild(characterIcon);
        characterItem.addEventListener('click', () => {
            currentCharacter = character;
            loadCharacterData(character);
        });
        nav.appendChild(characterItem);
    });
}

// Function to load character icon
function loadCharacterIcon(character, iconElement) {
    const formats = ['webp', 'png', 'jpeg'];
    function tryLoadImage(index = 0) {
        if (index >= formats.length) {
            console.error(`No valid image format found for character: ${character}`);
            return;
        }
        const format = formats[index];
        const imgSrc = `media/${character}.${format}`;
        const img = new Image();
        img.src = imgSrc;
        img.onload = () => { iconElement.src = imgSrc; };
        img.onerror = () => { tryLoadImage(index + 1); };
    }
    tryLoadImage();
}

// Function to enable sorting functionality
let sortableInstance = null;
function enableSorting() {
    const moveList = document.getElementById('move-list');
    if (isSortableEnabled) {
        if (!sortableInstance) {
            sortableInstance = Sortable.create(moveList, {
                animation: 150,
                onEnd: () => saveCustomPlaylist()
            });
        }
    } else {
        if (sortableInstance) {
            sortableInstance.destroy();
            sortableInstance = null;
        }
    }
}

// Function to save and load custom playlists
function saveCustomPlaylist() {
    const moveList = document.getElementById('move-list');
    const moves = Array.from(moveList.children).map(moveDiv => moveDiv.dataset.move);
    localStorage.setItem('customPlaylist', JSON.stringify(moves));
}

function loadCustomPlaylist() {
    const savedPlaylist = JSON.parse(localStorage.getItem('customPlaylist'));
    if (savedPlaylist) {
        const moveList = document.getElementById('move-list');
        const moveDivs = Array.from(moveList.children);
        const moveMap = moveDivs.reduce((map, div) => {
            map[div.dataset.move] = div;
            return map;
        }, {});
        moveList.innerHTML = '';
        savedPlaylist.forEach(moveInput => {
            if (moveMap[moveInput]) {
                moveList.appendChild(moveMap[moveInput]);
            }
        });
    }
}

// Function to clear custom playlist
function clearCustomPlaylist() {
    localStorage.removeItem('customPlaylist');
    loadCharacterData(currentCharacter);
}

// Setup pagination controls
function setupPaginationControls() {
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadCharacterData(currentCharacter);
        }
    });
    document.getElementById('next-page').addEventListener('click', () => {
        const totalItems = rows * columns;
        if (currentPage * totalItems < filterMoves(moves).length) {
            currentPage++;
            loadCharacterData(currentCharacter);
        }
    });
}

// Setup grid settings
function setupGridSettings() {
    document.getElementById('apply-grid-settings').addEventListener('click', () => {
        rows = parseInt(document.getElementById('rows').value, 10);
        columns = parseInt(document.getElementById('columns').value, 10);
        currentPage = 1;
        loadCharacterData(currentCharacter);
    });
}

// Populate filter dropdown based on iconMap keys
function populateFilterOptions() {
    const filterSelect = document.getElementById('filter-select');
    for (const property in iconMap) {
        const option = document.createElement('option');
        option.value = property;
        option.textContent = `Show ${property}`;
        filterSelect.appendChild(option);
    }
}
// Toggle autoplay state
function toggleAutoPlay() {
    isAutoPlayEnabled = !isAutoPlayEnabled;
    loadCharacterData();
}

// Toggle sortable state
function toggleSortable() {
    isSortableEnabled = !isSortableEnabled;
    enableSorting();
}

// Clear custom playlist
function clearCustomPlaylist() {
    localStorage.removeItem('customPlaylist');
    loadCharacterData();
}

// Initialize the page
function initializePage() {
    initializeCharacterNav();
    setupControls();
    loadCharacterData();
}

// Call initializePage when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializePage);