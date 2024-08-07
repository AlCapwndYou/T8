// Define icon map for move properties
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

let currentCharacter = 'Alisa'; // Default character
const characters = ['Alisa', 'Bryan', 'Hwoarang']; // Example character list

// Function to initialize the navigation menu
function initializeCharacterNav() {
    const nav = document.getElementById('character-nav');
    characters.forEach(character => {
        const characterItem = document.createElement('div');
        characterItem.classList.add('character-item');
        characterItem.textContent = character;

        // Load character icon
        const characterIcon = document.createElement('img');
        characterIcon.classList.add('character-icon');
        
        // Array of possible formats
        const formats = ['webp', 'png', 'jpeg'];
        
        // Function to try each format
        function tryLoadImage(index = 0) {
            if (index >= formats.length) {
                console.error(`No valid image format found for character: ${character}`);
                return;
            }
            
            const format = formats[index];
            const imgSrc = `media/${character}/${character}.${format}`;
            const img = new Image();
            img.src = imgSrc;
            img.onload = () => {
                characterIcon.src = imgSrc;
            };
            img.onerror = () => {
                tryLoadImage(index + 1);
            };
        }
        
        tryLoadImage(); // Start checking formats

        characterItem.appendChild(characterIcon);

        characterItem.addEventListener('click', () => {
            currentCharacter = character;
            loadCharacterData(character);
        });

        nav.appendChild(characterItem);
    });
}


// Function to load character data from JSON file
function loadCharacterData(character) {
    fetch(`${character}.json`) // Using exact character name
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            renderMoves(data.moves, character);
        })
        .catch(error => {
            console.error('Error loading character data:', error);
            // Optionally, you can display a user-friendly message or handle the error gracefully
            document.getElementById('move-list').innerHTML = '<p>Error loading character data. Please try again later.</p>';
        });
}

// Function to render moves in the grid
function renderMoves(moves, character) {
    const moveList = document.getElementById('move-list');
    moveList.innerHTML = '';

    moves.forEach(move => {
        const moveDiv = document.createElement('div');
        moveDiv.classList.add('move');
        moveDiv.dataset.move = move.input;

        const moveVideo = document.createElement('video');
        moveVideo.src = `media/${character}/${move.input}.mp4`; // Using exact character name
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
        } else {
            favoriteIcon.classList.add('inactive');
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

    enableSorting(); // Initialize sortable functionality after rendering
    loadCustomPlaylist(); // Load custom playlist if exists
}

// Function to toggle favorite state
function toggleFavorite(character, moveName, icon) {
    const isFavorited = localStorage.getItem(`${character}-${moveName}`);
    if (isFavorited) {
        localStorage.removeItem(`${character}-${moveName}`);
        icon.classList.remove('active');
        icon.classList.add('inactive');
    } else {
        localStorage.setItem(`${character}-${moveName}`, 'true');
        icon.classList.remove('inactive');
        icon.classList.add('active');
    }
}

// Function to enable sorting functionality
function enableSorting() {
    Sortable.create(document.getElementById('move-list'), {
        animation: 150,
        onEnd: function (evt) {
            // Save the new order to custom playlist
            saveCustomPlaylist();
        }
    });
}

// Function to save custom playlist
function saveCustomPlaylist() {
    const moveList = document.getElementById('move-list');
    const moves = Array.from(moveList.children).map(moveDiv => moveDiv.dataset.move);
    localStorage.setItem('customPlaylist', JSON.stringify(moves));
}

// Function to load custom playlist
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
    loadCharacterData(currentCharacter); // Reload character data to reflect changes
}

// Initialize the navigation menu and load default character data
initializeCharacterNav();
loadCharacterData(currentCharacter);

// Event listeners for playlist controls
document.getElementById('save-playlist').addEventListener('click', saveCustomPlaylist);
document.getElementById('load-playlist').addEventListener('click', loadCustomPlaylist);
document.getElementById('clear-playlist').addEventListener('click', clearCustomPlaylist);