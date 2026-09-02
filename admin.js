// Replace with the user's Supabase URL and Key
const SUPABASE_URL = 'https://rusllrzyanjjtqusawes.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-I_Vk5IaWVR0DIjDJ4V2gw_Q3FXKMjO';

// Initialize Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM Elements
const songForm = document.getElementById('songForm');
const adminSongsContainer = document.getElementById('adminSongsContainer');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');

// Form Inputs
const idInput = document.getElementById('songId');
const titleInput = document.getElementById('title');
const artistInput = document.getElementById('artist');
const albumInput = document.getElementById('album');
const coverUrlInput = document.getElementById('cover_url');
const audioUrlInput = document.getElementById('audio_url');

// Fetch and render songs for admin
async function fetchAdminSongs() {
    try {
        const { data, error } = await supabaseClient
            .from('songs')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        renderAdminSongs(data);
    } catch (error) {
        console.error('Error fetching songs:', error);
        adminSongsContainer.innerHTML = '<div class="error">Failed to load songs.</div>';
    }
}

function renderAdminSongs(songs) {
    if (songs.length === 0) {
        adminSongsContainer.innerHTML = '<div class="no-results">No songs found. Add one!</div>';
        return;
    }

    adminSongsContainer.innerHTML = songs.map(song => `
        <div class="admin-song-item">
            <div class="admin-song-info">
                <img src="${song.cover_url || 'https://placehold.co/40x40/333/FFF?text=+'}" alt="Cover">
                <div>
                    <h4>${song.title}</h4>
                    <p style="font-size: 12px; color: #a7a7a7;">${song.artist}</p>
                </div>
            </div>
            <div class="admin-song-actions">
                <button class="edit-btn" onclick="editSong('${song.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button class="delete-btn" onclick="deleteSong('${song.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

// Handle Form Submit (Add / Edit)
songForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;

    const songData = {
        title: titleInput.value.trim(),
        artist: artistInput.value.trim(),
        album: albumInput.value.trim(),
        cover_url: coverUrlInput.value.trim(),
        audio_url: audioUrlInput.value.trim()
    };

    const id = idInput.value;

    try {
        if (id) {
            // Update
            const { error } = await supabaseClient
                .from('songs')
                .update(songData)
                .eq('id', id);
            
            if (error) throw error;
            alert('Song updated successfully!');
        } else {
            // Insert
            const { error } = await supabaseClient
                .from('songs')
                .insert([songData]);
            
            if (error) throw error;
            alert('Song added successfully!');
        }
        
        resetForm();
        fetchAdminSongs();
    } catch (error) {
        console.error('Error saving song:', error);
        alert('Error saving song. Check console.');
    } finally {
        submitBtn.textContent = id ? 'Update Song' : 'Add Song';
        submitBtn.disabled = false;
    }
});

// Edit Song (Populate form)
async function editSong(id) {
    try {
        const { data, error } = await supabaseClient
            .from('songs')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        
        // Populate
        idInput.value = data.id;
        titleInput.value = data.title;
        artistInput.value = data.artist;
        albumInput.value = data.album || '';
        coverUrlInput.value = data.cover_url || '';
        audioUrlInput.value = data.audio_url;

        // UI Changes
        formTitle.textContent = 'Edit Song';
        submitBtn.textContent = 'Update Song';
        cancelBtn.style.display = 'block';
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Error fetching song for edit:', error);
    }
}

// Cancel Edit
cancelBtn.addEventListener('click', resetForm);

function resetForm() {
    songForm.reset();
    idInput.value = '';
    formTitle.textContent = 'Add New Song';
    submitBtn.textContent = 'Add Song';
    cancelBtn.style.display = 'none';
}

// Delete Song
async function deleteSong(id) {
    if (!confirm('Are you sure you want to delete this song?')) return;
    
    try {
        const { error } = await supabaseClient
            .from('songs')
            .delete()
            .eq('id', id);
            
        if (error) throw error;
        
        fetchAdminSongs();
    } catch (error) {
        console.error('Error deleting song:', error);
        alert('Error deleting song.');
    }
}

// Initialize
fetchAdminSongs();
