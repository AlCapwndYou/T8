let filterPreference = 'all'; // Default filter preference
let isAutoPlayEnabled = false; // Default auto-play state
let isSortableEnabled = false; // Default sortable state

// Character list
let currentCharacter = 'Alisa'; // Default character
const characters = ['Alisa', 'Azucena', 'Asuka', 'Bryan', 'Claudio', 'Devil Jin', 'Dragunov', 'Eddy',
    'Feng', 'Heihachi', 'Hwoarang', 'Jack-8', 'Jin', 'Jun', 'Kazuya', 'King',
    'Kuma', 'Lars', 'Law', 'Lee', 'Leo', 'Leroy', 'Lidia', 'Lili', 'Nina', 'Panda', 'Paul',
    'Raven', 'Reina', 'Shaheen', 'Steve', 'Victor','Xiaoyu', 'Yoshimitsu', 'Zafina'];

// Define icon map for move properties
const iconMap = {
    BlockPunishable: '👊',
    SSL: '👟⬅️',
    SWL: '🚶⬅️',
    SSR: '👟➡️',
    SWR: '🚶➡️',
    Heat: '<img src="media/heat4-small.png" alt="Heat" width="32" height="32">',
    Launcher: '⚠️',
    KeyMove: '🔑',
    Duckable: '🦆',
    Mixup: '🎰',
    PlusOnBlock: '🛑',
    Parryable: '⚔️',
    Sabaki: '🔄',
    Interuptable: '<IconHere>',
    SingleOptionString: '➡️',
    HighLowOnlyString: '🔀'
};

// Function to filter and render moves based on the selected property
function filterMoves(moves) {
    let filteredMoves;

    if (filterPreference === 'all') {
        filteredMoves = moves;
    } else if (filterPreference === 'favorites') {
        filteredMoves = moves.filter(move => localStorage.getItem(`${currentCharacter}-${move.name}`));
    } else {
        filteredMoves = moves.filter(move => move[filterPreference]);
    }

    renderMoves(filteredMoves, currentCharacter);
}



// Event listener for filter dropdown
document.getElementById('filter-select').addEventListener('change', function() {
    filterPreference = this.value;
    filterMoves(filterPreference);
});


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
            const imgSrc = `media/${character}.${format}`;
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
    fetch(`json/${character}.json`) // Using exact character name
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            filterMoves(data.moves);
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
        moveVideo.src = `media/${character}/${move.input}.mp4`;
        moveVideo.controls = true;
        moveVideo.muted = true;
        if (isAutoPlayEnabled) {
            moveVideo.autoplay = true;
        }
        moveVideo.loop = true;
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

        Object.keys(iconMap).forEach(property => {
            const propertyValue = move[property];

            if (propertyValue === null || propertyValue === '') {
                return;
            }

            if (iconMap[property]) {
                const legendItem = document.createElement('div');
                legendItem.classList.add('legend-item');

                const iconSpan = document.createElement('span');
                iconSpan.innerHTML = iconMap[property];
                iconSpan.classList.add('icon-tooltip');
                iconSpan.title = property.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

                legendItem.appendChild(iconSpan);

                if (propertyValue !== 'true') {
                    const propertyValueSpan = document.createElement('span');
                    propertyValueSpan.textContent = ` ${propertyValue}`;
                    legendItem.appendChild(propertyValueSpan);
                }

                legendDiv.appendChild(legendItem);
            }
        });

        moveDiv.appendChild(legendDiv);
        moveList.appendChild(moveDiv);
    });

    enableSorting();
    loadCustomPlaylist();
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


let sortableInstance = null; // Keep track of the sortable instance

// Function to enable sorting functionality
function enableSorting() {
    const moveList = document.getElementById('move-list');
    if (isSortableEnabled) {
        if (!sortableInstance) {
            sortableInstance = Sortable.create(moveList, {
                animation: 150,
                onEnd: function (evt) {
                    saveCustomPlaylist(); // Save the new order to custom playlist
                }
            });
        }
    } else {
        if (sortableInstance) {
            sortableInstance.destroy(); // Destroy the sortable instance
            sortableInstance = null; // Reset the instance
        }
    }
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

// Function to toggle auto-play state
function toggleAutoPlay() {
    isAutoPlayEnabled = !isAutoPlayEnabled;
    loadCharacterData(currentCharacter); // Re-load the data to apply changes
}

// Function to toggle sortable state
function toggleSortable() {
    isSortableEnabled = !isSortableEnabled;
    loadCharacterData(currentCharacter); // Re-load the data to apply changes
}

// Populate filter dropdown based on iconMap keys
function populateFilterOptions() {
    const filterSelect = document.getElementById('filter-select');

    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'Show All';
    filterSelect.appendChild(allOption);

    for (const property in iconMap) {
        const option = document.createElement('option');
        option.value = property;
        option.textContent = `Show ${property}`;
        filterSelect.appendChild(option);
    }

    const favoritesOption = document.createElement('option');
    favoritesOption.value = 'favorites';
    favoritesOption.textContent = 'Show Favorites';
    filterSelect.appendChild(favoritesOption);
}

populateFilterOptions();

// Initialize the navigation menu and load default character data
initializeCharacterNav();
loadCharacterData(currentCharacter);

// Event listeners for filter controls
document.getElementById('filter-select').addEventListener('change', function() {
    filterPreference = this.value;
    loadCharacterData(currentCharacter);
});

// Event listeners for playlist controls
document.getElementById('save-playlist').addEventListener('click', saveCustomPlaylist);
document.getElementById('load-playlist').addEventListener('click', loadCustomPlaylist);
document.getElementById('clear-playlist').addEventListener('click', clearCustomPlaylist);

// Event listeners for auto-play and sortable toggles
document.getElementById('toggle-autoplay').addEventListener('click', toggleAutoPlay);
document.getElementById('toggle-sortable').addEventListener('click', toggleSortable);