const iconMap = {
    SSL: '⬅️👟',
    SSR: '➡️👟',
    BLK: '✊',
    HEAT: '🔥',
    LAUNCHER: '⚠️',
    KEY: '🔑',
    DUCK: '🦆',
    MIXUP: '🎰',
    PLUS: '🛑',
    PARRY: '⚔️',
    SABAKI: '🔄',
    EXT_SINGLE: '🔗',
    EXT_MULTI: '🔍'
};

let sortable;
let allMoves = []; // Moves data will be populated here
let currentCharacter = 'Alisa'; // Default character for example

// Fetch and load moves for the selected character
function loadCharacterData(character) {
    fetch(`${character}.json`)
        .then(response => response.json())
        .then(data => {
            allMoves = data.moves;
            renderMoves(allMoves, character);
        })
        .catch(error => console.error('Error loading character data:', error));
}

function enableSorting() {
    sortable = new Sortable(document.getElementById('move-list'), {
        animation: 150,
        onEnd: function () {
            saveCustomPlaylist();
        }
    });
}

function saveCustomPlaylist() {
    const moveItems = document.querySelectorAll('.move');
    const playlist = Array.from(moveItems).map(item => item.dataset.move);
    localStorage.setItem('customPlaylist', JSON.stringify(playlist));
}

function loadCustomPlaylist() {
    const playlist = JSON.parse(localStorage.getItem('customPlaylist'));
    if (playlist) {
        const moveList = document.getElementById('move-list');
        playlist.forEach(move => {
            const moveItem = document.querySelector(`.move[data-move="${move}"]`);
            if (moveItem) {
                moveList.appendChild(moveItem);
            }
        });
    }
}

function clearCustomPlaylist() {
    localStorage.removeItem('customPlaylist');
    renderMoves(allMoves, currentCharacter); // Reload the default moves
}

function renderMoves(moves, character) {
    const moveList = document.getElementById('move-list');
    moveList.innerHTML = '';

    moves.forEach(move => {
        const moveDiv = document.createElement('div');
        moveDiv.classList.add('move');
        moveDiv.dataset.move = move.input; // Set data attribute for sorting and playlist

        const moveVideo = document.createElement('video');
        moveVideo.src = `media/${character}/${move.input}.mp4`;
        moveVideo.controls = true;
        moveDiv.appendChild(moveVideo);

        const moveName = document.createElement('h3');
        moveName.textContent = move.name;
        moveDiv.appendChild(moveName);

        const favoriteIcon = document.createElement('span');
        favoriteIcon.classList.add('favorite');
        favoriteIcon.textContent = '❤️';
        const isFavorited = localStorage.getItem(`${character}-${move.name}`);
        if (isFavorited) {
            favoriteIcon.classList.add('active');
        }
        favoriteIcon.addEventListener('click', () => toggleFavorite(character, move.name, favoriteIcon));
        moveDiv.appendChild(favoriteIcon);

        const legendDiv = document.createElement('div');
        legendDiv.classList.add('legend');

        move.properties.forEach(property => {
            if (iconMap[property]) {
                const legendItem = document.createElement('div');
                legendItem.classList.add('legend-item');

                const iconSpan = document.createElement('span');
                iconSpan.textContent = iconMap[property];
                iconSpan.classList.add('icon-tooltip');
                iconSpan.title = property.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()); // Add tooltip text

                legendItem.appendChild(iconSpan);
                legendDiv.appendChild(legendItem);
            }
        });

        moveDiv.appendChild(legendDiv);
        moveList.appendChild(moveDiv);
    });

    enableSorting(); // Enable sorting after moves are rendered
    loadCustomPlaylist(); // Load custom playlist if exists
}

function toggleFavorite(character, moveName, iconElement) {
    const key = `${character}-${moveName}`;
    if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        iconElement.classList.remove('active');
    } else {
        localStorage.setItem(key, true);
        iconElement.classList.add('active');
    }
}

// Initialize the page
function init() {
    loadCharacterData(currentCharacter);

    // Event listeners for playlist management
    document.getElementById('save-playlist').addEventListener('click', saveCustomPlaylist);
    document.getElementById('load-playlist').addEventListener('click', loadCustomPlaylist);
    document.getElementById('clear-playlist').addEventListener('click', clearCustomPlaylist);
}

// Call the init function when the page loads
window.onload = init;
