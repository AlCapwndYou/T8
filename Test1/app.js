// Initialize Sortable.js
let sortable;

// Define the icon map for move properties
const iconMap = {
    punishable: '👊',
    sidestepRight: '👟➡️',
    sidestepLeft: '👟⬅️',
    sidewalkRight: '🚶➡️',
    sidewalkLeft: '🚶⬅️',
    heat: '🔥',
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

// Possible image formats for character icons
const imageFormats = ['webp', 'png', 'jpeg'];

// Function to load and display characters in the navigation bar
function loadCharacters() {
    const characterNav = document.getElementById('character-nav');
    const characters = ['Alisa', 'Asuka', 'Law']; // Add more character names as needed

    characters.forEach(character => {
        const charLink = document.createElement('a');
        charLink.href = "#";
        charLink.dataset.character = character;

        // Dynamically determine the correct image format for the character icon
        const charImg = document.createElement('img');
        charImg.src = getImagePath(character);
        charImg.alt = character;

        charLink.appendChild(charImg);
        charLink.appendChild(document.createTextNode(character));
        characterNav.appendChild(charLink);

        charLink.addEventListener('click', () => loadCharacterMoves(character));
    });
}

// Function to determine the correct image path for a character
function getImagePath(character) {
    for (let format of imageFormats) {
        let imagePath = `media/${character}.${format}`;
        if (imageExists(imagePath)) {
            return imagePath;
        }
    }
    // Fallback to a default image if none found
    return `media/default-character-icon.png`;
}

// Helper function to check if an image exists
function imageExists(path) {
    const http = new XMLHttpRequest();
    http.open('HEAD', path, false);
    http.send();
    return http.status !== 404;
}

function loadCharacterMoves(character) {
    fetch(`${character}.json`)
        .then(response => response.json())
        .then(data => renderMoves(data.moves, character)) // Access the 'moves' array within the JSON
        .catch(error => console.error('Error loading character JSON:', error));
}

function enableSorting() {
    sortable = new Sortable(document.getElementById('move-list'), {
        animation: 150,
        onEnd: function (evt) {
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
                iconSpan.title = property.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

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

// Call renderMoves function with your data to initialize the page
renderMoves(allMoves, currentCharacter);

// Playlist management functions
document.getElementById('save-playlist').addEventListener('click', saveCustomPlaylist);
document.getElementById('load-playlist').addEventListener('click', loadCustomPlaylist);
document.getElementById('clear-playlist').addEventListener('click', clearCustomPlaylist);

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

// Function to initialize the legend
function initializeLegend() {
    const legendContainer = document.getElementById('legend');
    legendContainer.innerHTML = '';

    Object.keys(iconMap).forEach(key => {
        const legendItem = document.createElement('div');
        legendItem.classList.add('legend-item');

        const iconSpan = document.createElement('span');
        iconSpan.textContent = iconMap[key];

        const textSpan = document.createElement('span');
        textSpan.textContent = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

        legendItem.appendChild(iconSpan);
        legendItem.appendChild(textSpan);
        legendContainer.appendChild(legendItem);
    });
}

// Initialize the page
loadCharacters();
initializeLegend();
