// Replace with the user's Supabase URL and Key
const SUPABASE_URL = 'https://rusllrzyanjjtqusawes.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-I_Vk5IaWVR0DIjDJ4V2gw_Q3FXKMjO';

// Initialize Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM Elements
const songsGrid = document.getElementById('songsGrid');
const searchInput = document.getElementById('searchInput');
const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');
const volumeBar = document.getElementById('volumeBar');
const volumeIcon = document.getElementById('volumeIcon');

const playerCover = document.getElementById('playerCover');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');

// State
let allSongs = [];
let currentSongIndex = -1;
let isPlaying = false;

// Format time Helper
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Fetch Songs
async function fetchSongs() {
    try {
        const { data, error } = await supabaseClient
            .from('songs')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        allSongs = data;
        renderSongs(allSongs);
    } catch (error) {
        console.error('Error fetching songs:', error);
        songsGrid.innerHTML = '<div class="error">Failed to load songs.</div>';
    }
}

// Render Songs
function renderSongs(songs) {
    if (songs.length === 0) {
        songsGrid.innerHTML = '<div class="no-results">No songs found.</div>';
        return;
    }

    songsGrid.innerHTML = songs.map((song, index) => `
        <div class="song-card" onclick="playSong(${allSongs.indexOf(song)})">
            <img src="${song.cover_url || 'https://placehold.co/400x400/333/FFF?text=Music'}" alt="${song.title}">
            <div class="play-button-overlay">
                <i class="fa-solid fa-play"></i>
            </div>
            <h3>${song.title}</h3>
            <p>${song.artist}</p>
        </div>
    `).join('');
}

// Play Song
function playSong(index) {
    if (index < 0 || index >= allSongs.length) return;
    
    currentSongIndex = index;
    const song = allSongs[index];

    // Update Player UI
    playerCover.src = song.cover_url || 'https://placehold.co/50x50/333/FFF?text=Music';
    playerTitle.textContent = song.title;
    playerArtist.textContent = song.artist;

    // Load and Play Audio
    audioPlayer.src = song.audio_url;
    audioPlayer.play()
        .then(() => {
            isPlaying = true;
            updatePlayButton();
        })
        .catch(err => console.error('Playback error', err));
}

// Toggle Play/Pause
function togglePlay() {
    if (currentSongIndex === -1 && allSongs.length > 0) {
        playSong(0);
        return;
    }
    
    if (isPlaying) {
        audioPlayer.pause();
    } else {
        audioPlayer.play();
    }
    isPlaying = !isPlaying;
    updatePlayButton();
}

function updatePlayButton() {
    if (isPlaying) {
        playBtn.innerHTML = '<i class="fa-solid fa-circle-pause"></i>';
    } else {
        playBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
    }
}

// Next/Prev
function playNext() {
    if (allSongs.length === 0) return;
    let nextIndex = currentSongIndex + 1;
    if (nextIndex >= allSongs.length) nextIndex = 0; // Loop back
    playSong(nextIndex);
}

function playPrev() {
    if (allSongs.length === 0) return;
    let prevIndex = currentSongIndex - 1;
    if (prevIndex < 0) prevIndex = allSongs.length - 1; // Loop to end
    playSong(prevIndex);
}

// Event Listeners
playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', playNext);
prevBtn.addEventListener('click', playPrev);

// Audio Event Listeners
audioPlayer.addEventListener('timeupdate', () => {
    if (audioPlayer.duration) {
        const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.value = progressPercent;
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
        totalTimeEl.textContent = formatTime(audioPlayer.duration);
    }
});

audioPlayer.addEventListener('ended', playNext);

audioPlayer.addEventListener('loadedmetadata', () => {
     totalTimeEl.textContent = formatTime(audioPlayer.duration);
});

// Progress Bar interaction
progressBar.addEventListener('input', (e) => {
    if (audioPlayer.duration) {
        const seekTime = (e.target.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = seekTime;
    }
});

// Volume Control
volumeBar.addEventListener('input', (e) => {
    const volume = e.target.value / 100;
    audioPlayer.volume = volume;
    
    if (volume === 0) {
        volumeIcon.className = 'fa-solid fa-volume-xmark';
    } else if (volume < 0.5) {
        volumeIcon.className = 'fa-solid fa-volume-low';
    } else {
        volumeIcon.className = 'fa-solid fa-volume-high';
    }
});

// Search
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filteredSongs = allSongs.filter(song => 
        song.title.toLowerCase().includes(term) || 
        song.artist.toLowerCase().includes(term) || 
        (song.album && song.album.toLowerCase().includes(term))
    );
    renderSongs(filteredSongs);
});

// Initialize
fetchSongs();
