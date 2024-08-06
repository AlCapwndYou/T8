// Tekken 8 characters for the grid
const tekkenCharacters = [
    'Alisa', 'Azucena', 'Asuka', 'Bryan', 'Claudio', 'Devil Jin', 'Dragunov',
    'Eddy', 'Feng','Heihachi', 'Hwoarang', 'Jin', 'Jack-8', 'Kazuya', 'King',
    'Kuma', 'Lars', 'Law', 'Lee', 'Lili', 'Nina', 'Panda','Paul', 'Raven',
    'Shaheen', 'Steve', 'Victor','Xiaoyu', 'Yoshimitsu', 'Zafina'
];

const videos = {
    Alisa: ['11.mp4', '122.mp4'],
    Azucena: ['Azucena-11.mp4', 'Azucena-21.mp4'],
    Asuka: ['Asuka-31.mp4', 'Asuka-41.mp4'],
    Bryan: ['Bryan-51.mp4', 'Bryan-61.mp4'],
    // Add more characters as needed
};

// Create an empty object to hold playlists for each character
let characterPlaylists = {};
tekkenCharacters.forEach(character => {
    characterPlaylists[character] = {
        favorites: [],
        important: [],
        originalOrder: videos[character] || []
    };
});

// Load saved playlists and video order from cookies
function loadPlaylistsFromCookies() {
    let savedPlaylists = JSON.parse(localStorage.getItem('characterPlaylists'));
    if (savedPlaylists) {
        characterPlaylists = savedPlaylists;
    }
}
loadPlaylistsFromCookies();

let currentCharacter = 'All';
let currentPlaylist = 'all';

// Create the grid of Tekken characters with dummy images and text
const gridContainer = document.querySelector('.grid-container');
tekkenCharacters.forEach(character => {
    const gridItem = document.createElement('div');
    gridItem.className = 'grid-item';
    gridItem.innerHTML = `
        <img src="media/${character}.webp" alt="${character}">
        <p>${character}</p>
    `;
    gridItem.addEventListener('click', () => {
        currentCharacter = character;
        loadVideoGrid(character, currentPlaylist);
        document.getElementById('active-playlist').innerText = `Active Playlist: ${currentCharacter} - ${capitalizeFirstLetter(currentPlaylist)}`;
    });
    gridContainer.appendChild(gridItem);
});

// Function to load the video grid dynamically based on the selected character and playlist
function loadVideoGrid(character = 'All', playlist = 'all') {
    videoGrid.innerHTML = '';
    let videoList = [];

    if (playlist === 'all') {
        videoList = character === 'All' ? [].concat(...Object.values(videos)) : videos[character];
    } else {
        videoList = characterPlaylists[character][playlist];
    }

    if (videoList && videoList.length > 0) {
        videoList.forEach(video => {
            const videoItem = document.createElement('div');
            videoItem.className = 'video-item';
            videoItem.innerHTML = `
                <video src="media/${character}/${video}" muted autoplay loop></video>
                <p>${character} - ${video}</p>
                <div class="details">
                    <i class="tag ${characterPlaylists[character].favorites.includes(video) ? 'tag-added' : ''}" data-tag="favorites">⭐</i>
                    <i class="tag ${characterPlaylists[character].important.includes(video) ? 'tag-added' : ''}" data-tag="important">📁</i>
                    <i>🔍</i>
                    <i>⚙️</i>
                    <i>🔗</i>
                    <i>💾</i>
                </div>
            `;
            videoGrid.appendChild(videoItem);
        });
    }
}
loadVideoGrid();

// Update the playlist display when the dropdown menu changes
$('#select-playlist').change(function() {
    currentPlaylist = $(this).val();
    loadVideoGrid(currentCharacter, currentPlaylist);
    document.getElementById('active-playlist').innerText = `Active Playlist: ${currentCharacter} - ${capitalizeFirstLetter(currentPlaylist)}`;
});

// Make video grid items draggable
$(document).ready(function() {
    $(".video-grid").sortable({
        items: '.video-item',
        placeholder: "ui-state-highlight",
        update: function(event, ui) {
            let reorderedVideos = [];
            $('.video-item video').each(function() {
                reorderedVideos.push($(this).attr('src').split('/').pop());
            });
            characterPlaylists[currentCharacter].originalOrder = reorderedVideos;
            savePlaylistsToCookies();
        }
    });

    // Add tags to videos and update playlist
    $('.video-grid').on('click', '.tag', function() {
        const tag = $(this).data('tag');
        const videoItem = $(this).closest('.video-item');
        const videoSrc = videoItem.find('video').attr('src').split('/').pop();

        if (characterPlaylists[currentCharacter][tag].includes(videoSrc)) {
            characterPlaylists[currentCharacter][tag] = characterPlaylists[currentCharacter][tag].filter(src => src !== videoSrc);
            $(this).removeClass('tag-added');
        } else {
            characterPlaylists[currentCharacter][tag].push(videoSrc);
            $(this).addClass('tag-added');
        }

        savePlaylistsToCookies();
    });

    // Toggle video playback behavior
    $('#toggle-playback').change(function() {
        if ($(this).is(':checked')) {
            $('.video-item').hover(function() {
                $(this).find('video').get(0).play();
            }, function() {
                $(this).find('video').get(0).pause();
            });
        } else {
            $('video').each(function() {
                this.play();
            });
            $('.video-item').off('mouseenter mouseleave');
        }
    });
});

// Save playlists and video order to cookies
function savePlaylistsToCookies() {
    localStorage.setItem('characterPlaylists', JSON.stringify(characterPlaylists));
}

// Capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
