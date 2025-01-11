document.getElementById('ham-icon').addEventListener('click', () => {
    const sidebarVertical = document.querySelector('.sidebar-vertical');
    const sidebar = document.querySelector('.sidebar');
    const videoGrid = document.querySelector('.video-grid');
    
    if (sidebar.classList.contains('active')) {
        // Switch back to vertical sidebar
        sidebar.classList.remove('active');
        sidebarVertical.classList.remove('active');
        videoGrid.classList.remove('sidebar-visible');
    } else {
        // Switch to regular sidebar
        sidebar.classList.add('active');
        sidebarVertical.classList.add('active');
        videoGrid.classList.add('sidebar-visible');
    }
    filterBar.classList.toggle('sidebar-visible');
});

// Get DOM elements
const searchInput = document.querySelector('.search-input');
const searchIcon = document.querySelector('.search-icon');
const microphoneIcon = document.querySelector('.microphone-icon');
const bellDiv = document.querySelector('.bell-div');
const createDiv = document.querySelector('.create-div');

// Search functionality
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loadVideos(searchInput.value);
    }
});

searchIcon.addEventListener('click', () => {
    loadVideos(searchInput.value);
});

// Filter functionality
document.querySelectorAll('.filter-option').forEach(option => {
    option.addEventListener('click', () => {
        // Remove active class from all options
        document.querySelectorAll('.filter-option').forEach(opt => {
            opt.classList.remove('active');
        });
        
        // Add active class to clicked option
        option.classList.add('active');
        
        // Load videos with the selected filter
        const filterText = option.textContent;
        loadVideos(filterText === 'All' ? '' : filterText);
    });
});

// Microphone functionality
microphoneIcon.addEventListener('click', () => {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            microphoneIcon.style.background = '#ff0000';
        };

        recognition.onend = () => {
            microphoneIcon.style.background = 'rgba(128, 128, 128, 0.199)';
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            searchInput.value = transcript;
            performSearch(transcript);
        };

        recognition.start();
    } else {
        alert('Speech recognition is not supported in your browser');
    }
});

// Notifications functionality
let notificationCount = 0;
bellDiv.addEventListener('click', () => {
    if (!bellDiv.querySelector('.notification-count')) {
        notificationCount = 0;
        const notificationBadge = document.createElement('div');
        notificationBadge.className = 'notification-count';
        bellDiv.appendChild(notificationBadge);
    }
    notificationCount++;
    bellDiv.querySelector('.notification-count').textContent = notificationCount > 9 ? '9+' : notificationCount;
});

// Update create video dropdown
createDiv.addEventListener('click', () => {
    const dropdown = document.createElement('div');
    dropdown.className = 'create-dropdown';
    dropdown.innerHTML = `
        <div class="create-option">
            <span class="fa fa-video"></span>
            <p>Upload video</p>
        </div>
        <div class="create-option">
            <span class="fa fa-broadcast-tower"></span>
            <p>Go live</p>
        </div>
        <div class="create-option">
            <span class="fa fa-pen"></span>
            <p>Create post</p>
        </div>
    `;

    // Remove existing dropdown if any
    const existingDropdown = document.querySelector('.create-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
    } else {
        createDiv.appendChild(dropdown);
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function closeDropdown(e) {
            if (!createDiv.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        });
    }
});

// Video duration hover preview
document.querySelectorAll('.video-item').forEach(video => {
    const thumbnail = video.querySelector('.video-thumbnail');
    let timeoutId;

    thumbnail.addEventListener('mouseenter', () => {
        timeoutId = setTimeout(() => {
            thumbnail.style.transform = 'scale(1.05)';
            thumbnail.style.transition = 'transform 0.3s ease';
        }, 500);
    });

    thumbnail.addEventListener('mouseleave', () => {
        clearTimeout(timeoutId);
        thumbnail.style.transform = 'scale(1)';
    });
});

// Add this to your existing JavaScript
const filterBar = document.querySelector('.filter-bar');
const filterOptions = document.querySelector('.filter-options');
const prevBtn = document.querySelector('.filter-nav-btn.prev');
const nextBtn = document.querySelector('.filter-nav-btn.next');

// Scroll filter options
nextBtn.addEventListener('click', () => {
    filterOptions.scrollBy({
        left: 200,
        behavior: 'smooth'
    });
});

prevBtn.addEventListener('click', () => {
    filterOptions.scrollBy({
        left: -200,
        behavior: 'smooth'
    });
});

// Check scroll position to show/hide navigation buttons
filterOptions.addEventListener('scroll', () => {
    const isAtStart = filterOptions.scrollLeft === 0;
    const isAtEnd = filterOptions.scrollLeft + filterOptions.clientWidth >= filterOptions.scrollWidth;
    
    prevBtn.style.display = isAtStart ? 'none' : 'flex';
    nextBtn.style.display = isAtEnd ? 'none' : 'flex';
});

// Initial check for button visibility
prevBtn.style.display = 'none';

// YouTube API Key
const API_KEY = 'AIzaSyCSxkHX8zZTLiCOIo0mkDBV0Cid1-atXyg';

// Function to format view count
function formatViewCount(viewCount) {
    if (viewCount >= 1000000) {
        return (viewCount / 1000000).toFixed(1) + 'M';
    } else if (viewCount >= 1000) {
        return (viewCount / 1000).toFixed(1) + 'K';
    }
    return viewCount;
}

// Function to format duration
function formatDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');
    
    let formattedDuration = '';
    if (hours) formattedDuration += `${hours}:`;
    formattedDuration += `${minutes.padStart(2, '0')}:`;
    formattedDuration += seconds.padStart(2, '0');
    
    return formattedDuration;
}

// Function to format date
function formatDate(publishedAt) {
    const now = new Date();
    const published = new Date(publishedAt);
    const diffTime = Math.abs(now - published);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
        const years = Math.floor(diffDays / 365);
        return `${years} year${years > 1 ? 's' : ''} ago`;
    }
}

// Function to create video element
function createVideoElement(video, stats, duration) {
    const videoDiv = document.createElement('div');
    videoDiv.className = 'video-item';
    videoDiv.innerHTML = `
        <div class="video-thumbnail">
            <img src="https://i.ytimg.com/vi/${video.id.videoId}/hqdefault.jpg" alt="${video.snippet.title}">
            <div class="video-duration">${formatDuration(duration)}</div>
            <div class="video-hover-info">
                <div class="hover-stats">
                    <span>${formatViewCount(stats.viewCount)} views</span>
                    <span>${stats.likeCount ? formatViewCount(stats.likeCount) + ' likes' : ''}</span>
                </div>
            </div>
        </div>
        <div class="video-info">
            <div class="channel-icon">
                <img src="https://yt3.ggpht.com/ytc/${video.snippet.channelId}" alt="Channel">
            </div>
            <div class="video-details">
                <h3>${video.snippet.title}</h3>
                <p class="channel-name">${video.snippet.channelTitle}</p>
                <div class="video-stats">
                    <span>${formatViewCount(stats.viewCount)} views</span>
                    <span>•</span>
                    <span>${formatDate(video.snippet.publishedAt)}</span>
                </div>
            </div>
        </div>
    `;

    // Add hover preview
    addVideoPreview(videoDiv, video.id.videoId);

    // Add click event to play video
    videoDiv.addEventListener('click', () => {
        const modal = document.getElementById('video-player-modal');
        if (modal) {
            modal.style.display = 'block';
            const videoPlayer = document.getElementById('video-player');
            if (videoPlayer) {
                videoPlayer.innerHTML = `
                    <iframe 
                        width="100%" 
                        height="100%" 
                        src="https://www.youtube.com/embed/${video.id.videoId}?autoplay=1" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                `;
            }
        }
    });

    return videoDiv;
}

// Function to load videos with error handling
async function loadVideos(searchQuery = '') {
    const videoGrid = document.querySelector('.video-grid');
    videoGrid.innerHTML = '<div class="loading">Loading videos...</div>';

    try {
        // Create a direct fetch request with the API key
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&type=video&key=${API_KEY}&q=${encodeURIComponent(searchQuery || 'programming tutorials')}`;
        
        const searchResponse = await fetch(searchUrl);
        const data = await searchResponse.json();

        if (!searchResponse.ok) {
            if (data.error && data.error.code === 403) {
                throw new Error(`API Key Error: The API key is restricted to specific domains. 
                Please make sure you're running this from an authorized domain or update the API key restrictions in Google Cloud Console.`);
            }
            throw new Error(data.error ? data.error.message : 'Failed to fetch videos');
        }

        if (!data.items || data.items.length === 0) {
            videoGrid.innerHTML = '<div class="error">No videos found</div>';
            return;
        }

        videoGrid.innerHTML = '';
        
        // Process each video
        for (const video of data.items) {
            try {
                const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${video.id.videoId}&key=${API_KEY}`;
                const videoResponse = await fetch(videoUrl);
                const videoData = await videoResponse.json();
                
                if (!videoResponse.ok) {
                    console.error('Video fetch error:', videoData.error);
                    continue;
                }

                if (videoData.items && videoData.items.length > 0) {
                    const videoStats = videoData.items[0].statistics;
                    const duration = videoData.items[0].contentDetails.duration;
                    const videoElement = createVideoElement(video, videoStats, duration);
                    videoGrid.appendChild(videoElement);
                }
            } catch (error) {
                console.error('Error processing video:', error);
                continue;
            }
        }

        // If no videos were successfully loaded
        if (videoGrid.children.length === 0) {
            videoGrid.innerHTML = '<div class="error">No videos could be loaded</div>';
        }

    } catch (error) {
        console.error('Error loading videos:', error);
        videoGrid.innerHTML = `
            <div class="error">
                <h2>Error loading videos</h2>
                <p>${error.message}</p>
                <p class="error-details">
                    To fix this:
                    <br>1. Go to Google Cloud Console > APIs & Services > Credentials
                    <br>2. Click on your API key
                    <br>3. Under "Application restrictions", select "HTTP referrers (web sites)"
                    <br>4. Click "ADD AN ITEM" and add EXACTLY these entries one by one:
                    <br>   • http://192.168.0.180
                    <br>   • http://localhost
                    <br>   • http://127.0.0.1
                    <br>5. Click "DONE" after each entry
                    <br>6. Click "SAVE" at the bottom
                    <br>7. Wait 2-3 minutes for changes to take effect
                    <br>
                    <br>Note: Make sure to copy the URLs exactly as shown, with no extra spaces or characters
                </p>
            </div>
        `;
    }
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Load videos directly
    loadVideos();
});

// Add error message styles
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        .loading {
            text-align: center;
            padding: 40px;
            font-size: 18px;
            color: #606060;
        }

        .error {
            text-align: center;
            padding: 40px;
            background: #fff3f3;
            border-radius: 8px;
            margin: 20px;
        }

        .error h2 {
            color: #cc0000;
            margin-bottom: 10px;
            font-size: 20px;
        }

        .error p {
            color: #666;
            margin: 5px 0;
        }

        .error-details {
            font-family: monospace;
            background: #f8f8f8;
            padding: 10px;
            margin-top: 10px;
            border-radius: 4px;
            font-size: 14px;
        }
    `;
    document.head.appendChild(style);
});

// Add loading animation styles
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent += `
        .loading {
            text-align: center;
            padding: 40px;
            font-size: 18px;
            color: #606060;
            position: relative;
        }

        .loading:after {
            content: '';
            display: block;
            width: 40px;
            height: 40px;
            border: 3px solid #ccc;
            border-top-color: #ff0000;
            border-radius: 50%;
            margin: 20px auto;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .video-thumbnail {
            position: relative;
            overflow: hidden;
            transition: transform 0.3s ease;
        }

        .video-thumbnail:hover {
            transform: scale(1.05);
        }

        .video-thumbnail:hover:before {
            content: '▶';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 48px;
            color: white;
            background: rgba(0, 0, 0, 0.7);
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1;
        }

        .video-item {
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .video-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .channel-icon img {
            transition: transform 0.3s ease;
        }

        .channel-icon:hover img {
            transform: scale(1.1);
        }

        .notification-count {
            animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }

        .create-dropdown {
            animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
});

// Add video hover preview functionality
function addVideoPreview(videoElement, videoId) {
    let previewTimeout;
    const thumbnail = videoElement.querySelector('.video-thumbnail');

    thumbnail.addEventListener('mouseenter', () => {
        previewTimeout = setTimeout(() => {
            thumbnail.innerHTML += `
                <div class="video-preview">
                    <iframe 
                        width="100%" 
                        height="100%" 
                        src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1" 
                        frameborder="0"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    ></iframe>
                </div>
            `;
        }, 1000);
    });

    thumbnail.addEventListener('mouseleave', () => {
        clearTimeout(previewTimeout);
        const preview = thumbnail.querySelector('.video-preview');
        if (preview) {
            preview.remove();
        }
    });
}
