// Tekken 8 characters for the grid
const tekkenCharacters = [
    'Alisa', 'Azucena', 'Asuka', 'Bryan', 'Claudio', 'Devil Jin', 'Eddy', 'Feng',
    'Gigas', 'Heihachi', 'Hwoarang', 'Jin', 'Julia', 'Kazuya', 'King', 'Kuma',
    'Lars', 'Law', 'Lee', 'Lili', 'Ling', 'Lucky Chloe', 'Marduk', 'Miguel',
    'Nina', 'Paul', 'Raven', 'Shaheen', 'Steve', 'Xiaoyu', 'Yoshimitsu', 'Zafina'
];

const videos = {
    Alisa: ['11.mp4', '122.mp4'],
    Azucena: ['Azucena-11.mp4', 'Azucena-21.mp4'],
    Asuka: ['Asuka-31.mp4', 'Asuka-41.mp4'],
    Bryan: ['Bryan-51.mp4', 'Bryan-61.mp4']
};

let playlists = {
    favorites: [],
    important: []
};

let currentPlaylist = 'favorites';

// Create the grid of Tekken characters with dummy images and text
const gridContainer = document.querySelector('.grid-container');
tekkenCharacters.forEach(character => {
    const gridItem = document.createElement('div');
    gridItem.className = 'grid-item';
    gridItem.innerHTML = `
        <img src="https://via.placeholder.com/120" alt="${character}">
        <p>${character}</p>
    `;
    gridContainer.appendChild(gridItem);
});

// Create the video grid dynamically with dummy video files and text
const videoGrid = document.querySelector('.video-grid');
function loadVideoGrid() {
    videoGrid.innerHTML = '';
    Object.keys(videos).forEach(person => {
        videos[person].forEach(video => {
            const videoItem = document.createElement('div');
            videoItem.className = 'video-item';
            videoItem.innerHTML = `
                <video src="media/${person}/${video}" muted autoplay loop></video>
                <p>${person} - ${video}</p>
                <div class="details">
                    <i class="tag" data-tag="favorites">⭐</i>
                    <i class="tag" data-tag="important">📁</i>
                    <i>🔍</i>
                    <i>⚙️</i>
                    <i>🔗</i>
                    <i>💾</i>
                </div>
            `;
            videoGrid.appendChild(videoItem);
        });
    });
}
loadVideoGrid();

// Menu icon click functionality to toggle the drop-down menu
$('.menu-icon').click(function() {
    $('.nav-links').slideToggle();
});

// Make video grid items draggable
$(document).ready(function() {
    $(".video-grid").sortable({
        items: '.video-item',
        placeholder: "ui-state-highlight",
        update: function(event, ui) {
            console.log("Updated order!");
        }
    });

    // Add tags to videos and update playlist
    $('.video-grid').on('click', '.tag', function() {
        const tag = $(this).data('tag');
        const videoItem = $(this).closest('.video-item');
        const videoSrc = videoItem.find('video').attr('src');

        // Toggle tag
        if (playlists[tag].includes(videoSrc)) {
            playlists[tag] = playlists[tag].filter(src => src !== videoSrc);
            $(this).removeClass('tag-added');
        } else {
            playlists[tag].push(videoSrc);
            $(this).addClass('tag-added');
        }

        console.log(`Updated ${tag} playlist:`, playlists[tag]);
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

    // Show the current playlist
    $('#show-playlist').click(function() {
        alert(`Current Playlist: ${currentPlaylist}\nVideos: ${playlists[currentPlaylist].join(', ')}`);
    });

    // Load the selected playlist
    $('#load-playlist').click(function() {
        const selectedPlaylist = $('#select-playlist').val();
        currentPlaylist = selectedPlaylist;
        loadPlaylist(selectedPlaylist);
    });

    // Load videos from the selected playlist
    function loadPlaylist(playlist) {
        videoGrid.innerHTML = '';
        playlists[playlist].forEach(videoSrc => {
            const person = videoSrc.split('/')[1]; // Extract the person's name from the path
            const videoName = videoSrc.split('/').pop(); // Extract the video name from the path

            const videoItem = document.createElement('div');
            videoItem.className = 'video-item';
            videoItem.innerHTML = `
                <video src="${videoSrc}" muted autoplay loop></video>
                <p>${person} - ${videoName}</p>
                <div class="details">
                    <i class="tag ${playlists.favorites.includes(videoSrc) ? 'tag-added' : ''}" data-tag="favorites">⭐</i>
                    <i class="tag ${playlists.important.includes(videoSrc) ? 'tag-added' : ''}" data-tag="important">📁</i>
                    <i>🔍</i>
                    <i>⚙️</i>
                    <i>🔗</i>
                    <i>💾</i>
                </div>
            `;
            videoGrid.appendChild(videoItem);
        });
    }

    // Ensure that the videos autoplay, loop, and are muted
    $('video').each(function() {
        $(this).prop('autoplay', true);
        $(this).prop('loop', true);
        $(this).prop('muted', true);
    });
});
