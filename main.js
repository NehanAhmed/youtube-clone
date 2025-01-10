// API Credentials
const API_KEY = 'AIzaSyCSxkHX8zZTLiCOIo0mkDBV0Cid1-atXyg';
const CLIENT_ID = '173596080923-tt6n9bnlbrmbvbe3gdphj84sepakc027.apps.googleusercontent.com';

// Get DOM elements
const searchInput = document.querySelector('.search-input');
const searchIcon = document.querySelector('.search-icon');
const microphoneIcon = document.querySelector('.microphone-icon');
const bellDiv = document.querySelector('.bell-div');
const createDiv = document.querySelector('.create-div');
const filterBar = document.querySelector('.filter-bar');
const filterOptions = document.querySelector('.filter-options');
const prevBtn = document.querySelector('.filter-nav-btn.prev');
const nextBtn = document.querySelector('.filter-nav-btn.next');

// Add these variables at the top with other declarations
let player;
const modal = document.getElementById('video-player-modal');
const closeBtn = document.querySelector('.close-modal');

// Initialize the YouTube API
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
        scope: 'https://www.googleapis.com/auth/youtube.force-ssl'
    }).then(() => {
        console.log('Google API Client initialized');
        // Initialize auth2
        return gapi.auth2.init({
            client_id: CLIENT_ID
        });
    }).then(() => {
        console.log('Auth2 initialized');
        // Update sign-in status
        updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        // Listen for sign-in state changes
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
        // Load initial videos
        loadVideos();
    }).catch(error => {
        console.error('Error initializing API:', error);
        handleAPIError(error);
    });
}

// Start API client loading
function start() {
    gapi.load('client:auth2', initClient);
}

// Function to load videos
function loadVideos(searchQuery = '') {
    try {
        const request = gapi.client.youtube.search.list({
            part: 'snippet',
            maxResults: 15,
            q: searchQuery,
            type: 'video',
            order: 'relevance'
        });

        request.execute(function(response) {
            if (response.error) {
                console.error('Error loading videos:', response.error);
                handleAPIError(response.error);
                return;
            }

            if (!response.items || response.items.length === 0) {
                const videoGrid = document.querySelector('.video-grid');
                videoGrid.innerHTML = `
                    <div style="text-align: center; width: 100%; padding: 20px;">
                        <h2>No videos found</h2>
                        <p>Try a different search term</p>
                    </div>
                `;
                return;
            }

            const videoGrid = document.querySelector('.video-grid');
            videoGrid.innerHTML = ''; // Clear existing videos

            response.items.forEach(item => {
                try {
                    // Get video statistics
                    const videoRequest = gapi.client.youtube.videos.list({
                        part: 'statistics,contentDetails',
                        id: item.id.videoId
                    });

                    videoRequest.execute(function(videoResponse) {
                        if (videoResponse.error) {
                            console.error('Error loading video details:', videoResponse.error);
                            return;
                        }

                        if (!videoResponse.items || videoResponse.items.length === 0) {
                            console.error('No video details found for:', item.id.videoId);
                            return;
                        }

                        const videoStats = videoResponse.items[0].statistics;
                        const duration = videoResponse.items[0].contentDetails.duration;
                        
                        const videoElement = createVideoElement(item, videoStats, duration);
                        videoGrid.appendChild(videoElement);
                    });
                } catch (error) {
                    console.error('Error processing video:', error);
                }
            });
        });
    } catch (error) {
        console.error('Error in loadVideos:', error);
        handleAPIError(error);
    }
}

// Helper functions
function formatDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');
    
    let result = '';
    if (hours) result += `${hours}:`;
    result += `${minutes.padStart(2, '0')}:`;
    result += seconds.padStart(2, '0');
    return result;
}

function formatViews(viewCount) {
    if (viewCount >= 1000000) {
        return `${(viewCount / 1000000).toFixed(1)}M`;
    } else if (viewCount >= 1000) {
        return `${(viewCount / 1000).toFixed(1)}K`;
    }
    return viewCount;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days < 1) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
}

// Function to create video element
function createVideoElement(video, stats, duration) {
    const formattedDuration = formatDuration(duration);
    const formattedViews = formatViews(stats.viewCount);
    const videoId = video.id.videoId;

    const videoDiv = document.createElement('div');
    videoDiv.className = 'video-item';
    videoDiv.innerHTML = `
        <div class="video-thumbnail">
            <img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" alt="${video.snippet.title}">
            <div class="video-duration">${formattedDuration}</div>
        </div>
        <div class="video-info">
            <div class="channel-icon">
                <img src="https://yt3.ggpht.com/ytc/APkrFKaqca-xQcJtp1Pqv-APucCa0nToHYGPVT_qVYUbNA=s88-c-k-c0x00ffffff-no-rj" alt="Channel">
            </div>
            <div class="video-details">
                <h3>${video.snippet.title}</h3>
                <p class="channel-name">${video.snippet.channelTitle}</p>
                <div class="video-stats">
                    <span>${formattedViews} views</span>
                    <span>•</span>
                    <span>${formatDate(video.snippet.publishedAt)}</span>
                </div>
            </div>
        </div>
    `;

    videoDiv.addEventListener('click', () => {
        const modal = document.getElementById('video-player-modal');
        modal.style.display = 'block';
        
        if (player) {
            player.loadVideoById(videoId);
        } else {
            player = new YT.Player('video-player', {
                height: '100%',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    autoplay: 1,
                    controls: 1,
                    rel: 0
                }
            });
        }
    });

    return videoDiv;
}

// Add this function after the existing functions
function onYouTubeIframeAPIReady() {
    try {
        player = new YT.Player('video-player', {
            height: '100%',
            width: '100%',
            videoId: 'PkZNo7MFNFg',
            playerVars: {
                autoplay: 0,
                controls: 1,
                rel: 0,
                showinfo: 1,
                modestbranding: 1,
                fs: 1,
                cc_load_policy: 1,
                iv_load_policy: 3
            },
            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange,
                onError: onPlayerError
            }
        });
    } catch (error) {
        console.error('Error initializing video player:', error);
        handleVideoPlayerError(error);
    }
}

function onPlayerError(event) {
    console.error('Player error:', event.data);
    const errorMessages = {
        2: 'Invalid video ID',
        5: 'HTML5 player error',
        100: 'Video not found',
        101: 'Video cannot be played in embedded players',
        150: 'Video cannot be played in embedded players'
    };
    
    const errorMessage = errorMessages[event.data] || 'An error occurred while playing the video';
    handleVideoPlayerError({ message: errorMessage });
}

function handleVideoPlayerError(error) {
    const playerDiv = document.getElementById('video-player');
    if (playerDiv) {
        playerDiv.innerHTML = `
            <div style="text-align: center; padding: 20px; color: white;">
                <h3>Video Playback Error</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

function onPlayerReady(event) {
    console.log('Player ready');
    try {
        event.target.playVideo();
    } catch (error) {
        console.error('Error playing video:', error);
    }
}

function onPlayerStateChange(event) {
    try {
        if (event.data === YT.PlayerState.ENDED) {
            const modal = document.getElementById('video-player-modal');
            if (modal) {
                modal.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error handling player state change:', error);
    }
}

// Initialize all functionality
function initializeApp() {
// Search functionality
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch(searchInput.value);
    }
});

searchIcon.addEventListener('click', () => {
    performSearch(searchInput.value);
});

// Microphone functionality
    if (microphoneIcon) {
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
    }

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

    // Create dropdown functionality
    createDiv.addEventListener('click', createDropdown);

    // Filter functionality
    document.querySelectorAll('.filter-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.filter-option').forEach(opt => {
                opt.classList.remove('active');
            });
            option.classList.add('active');
            
            const category = option.textContent.trim();
            if (category === 'All') {
                loadVideos();
            } else {
                loadVideos(category);
            }
        });
    });

    // Filter scroll buttons
    if (prevBtn && nextBtn) {
        prevBtn.style.display = 'none';

        nextBtn.addEventListener('click', () => {
            filterOptions.scrollBy({ left: 200, behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', () => {
            filterOptions.scrollBy({ left: -200, behavior: 'smooth' });
        });

        filterOptions.addEventListener('scroll', () => {
            const isAtStart = filterOptions.scrollLeft === 0;
            const isAtEnd = filterOptions.scrollLeft + filterOptions.clientWidth >= filterOptions.scrollWidth;

            prevBtn.style.display = isAtStart ? 'none' : 'flex';
            nextBtn.style.display = isAtEnd ? 'none' : 'flex';
        });
    }

    // Sidebar toggle
    document.getElementById('ham-icon').addEventListener('click', () => {
        const sidebarVertical = document.querySelector('.sidebar-vertical');
        const sidebar = document.querySelector('.sidebar');
        const videoGrid = document.querySelector('.video-grid');
        
        if (sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            sidebarVertical.classList.remove('active');
            videoGrid.classList.remove('sidebar-visible');
        } else {
            sidebar.classList.add('active');
            sidebarVertical.classList.add('active');
            videoGrid.classList.add('sidebar-visible');
        }
        filterBar.classList.toggle('sidebar-visible');
    });

    // Video hover effects
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

    // Add modal close functionality
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        if (player) {
            player.stopVideo();
        }
    });

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            if (player) {
                player.stopVideo();
            }
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            if (player) {
                player.stopVideo();
            }
        }
    });
}

// Update search functionality
function performSearch(query) {
    if (query.trim() !== '') {
        loadVideos(query);
    }
}

// Add these functions after the existing ones
function initializeUpload() {
    gapi.client.init({
        'apiKey': API_KEY,
        'clientId': '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com', // You need to add your client ID
        'scope': 'https://www.googleapis.com/auth/youtube.upload',
        'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
    }).then(function() {
        console.log('Upload API initialized');
    }).catch(function(error) {
        console.error('Error initializing upload:', error);
    });
}

function handleUpload(file) {
    if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
        gapi.auth2.getAuthInstance().signIn().then(() => {
            uploadVideo(file);
        }).catch(error => {
            console.error('Error signing in:', error);
            alert('Please sign in to upload videos');
        });
    } else {
        uploadVideo(file);
    }
}

function uploadVideo(file) {
    const metadata = {
        snippet: {
            title: file.name.split('.')[0],
            description: 'Uploaded via YouTube Clone',
            tags: ['youtube_clone', 'upload']
        },
        status: {
            privacyStatus: 'private'
        }
    };

    showUploadProgress();

    const reader = new FileReader();
    reader.onload = (e) => {
        const fileData = e.target.result;
        
        gapi.client.youtube.videos.insert({
            part: Object.keys(metadata).join(','),
            resource: metadata,
            media: {
                mimeType: file.type,
                body: fileData
            }
        }).then(response => {
            console.log('Upload successful:', response);
            hideUploadProgress();
            alert('Video uploaded successfully!');
        }).catch(error => {
            console.error('Error uploading video:', error);
            hideUploadProgress();
            alert('Error uploading video. Please try again.');
        });
    };
    reader.readAsArrayBuffer(file);
}

// Add progress indicator functions
function showUploadProgress() {
    const progressDiv = document.createElement('div');
    progressDiv.className = 'upload-progress';
    progressDiv.innerHTML = `
        <div class="progress-content">
            <h3>Uploading video...</h3>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        </div>
    `;
    document.body.appendChild(progressDiv);
}

function hideUploadProgress() {
    const progressDiv = document.querySelector('.upload-progress');
    if (progressDiv) {
        progressDiv.remove();
    }
}

// Update the create dropdown functionality
function createDropdown() {
    const existingDropdown = document.querySelector('.create-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
    } else {
        const dropdown = document.createElement('div');
        dropdown.className = 'create-dropdown';
        dropdown.innerHTML = `
            <div class="create-option upload-video">
                <span class="fa fa-video"></span>
                <p>Upload video</p>
                <input type="file" accept="video/*" style="display: none" id="video-upload">
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
        createDiv.appendChild(dropdown);

        // Add upload functionality
        const uploadOption = dropdown.querySelector('.upload-video');
        const fileInput = dropdown.querySelector('#video-upload');

        uploadOption.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Check if user is authenticated
                if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
                    gapi.auth2.getAuthInstance().signIn().then(() => {
                        handleUpload(file);
                    }).catch((error) => {
                        console.error('Auth error:', error);
                        alert('Please sign in to upload videos');
                    });
                } else {
                    handleUpload(file);
                }
            }
        });

        document.addEventListener('click', function closeDropdown(e) {
            if (!createDiv.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        });
    }
}

// Error handling function
function handleAPIError(error) {
    console.error('API Error:', error);
    const videoGrid = document.querySelector('.video-grid');
    videoGrid.innerHTML = `
        <div style="text-align: center; width: 100%; padding: 20px;">
            <h2>An error occurred</h2>
            <p>${error.message || 'Please try again later'}</p>
        </div>
    `;
}

// Update sign-in status with error handling
function updateSignInStatus(isSignedIn) {
    try {
        if (isSignedIn) {
            console.log('User is signed in');
            const user = gapi.auth2.getAuthInstance().currentUser.get();
            const profile = user.getBasicProfile();
            if (profile) {
                document.querySelector('.profile-img').src = profile.getImageUrl();
                document.querySelector('.profile-hover-img').src = profile.getImageUrl();
                document.querySelector('.profile-text h4').textContent = profile.getName();
                document.querySelector('.profile-text p').textContent = profile.getEmail();
            }
        } else {
            console.log('User is not signed in');
            // Reset profile to default
            document.querySelector('.profile-img').src = "https://api.dicebear.com/6.x/avataaars/svg?seed=Felix";
            document.querySelector('.profile-hover-img').src = "https://api.dicebear.com/6.x/avataaars/svg?seed=Felix";
            document.querySelector('.profile-text h4').textContent = "Sign in";
            document.querySelector('.profile-text p').textContent = "";
        }
    } catch (error) {
        console.error('Error updating sign-in status:', error);
    }
}

// Safe DOM element getter
function getElement(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        console.warn(`Element not found: ${selector}`);
        return null;
    }
    return element;
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Start the API initialization
        start();
        
        // Initialize other app functionality
        initializeApp();
    } catch (error) {
        console.error('Error during initialization:', error);
        handleAPIError(error);
    }
});
 