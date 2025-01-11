const API_KEY = 'AIzaSyCX1GBZrNdbcHNuJpGRhY9RxRvDwv3aAaY';

// Add search functionality
async function searchVideos(query) {
    const { preloader, interval } = startLoading();
    
    try {
        const videoContainer = document.querySelector('.videos-container');
        // Show loading state
        videoContainer.innerHTML = '';
        for (let i = 0; i < 12; i++) {
            videoContainer.appendChild(createSkeletonLoader());
        }

        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${query}&type=video&key=${API_KEY}`);
        const data = await response.json();
        
        if (data.items) {
            const videoIds = data.items.map(item => item.id.videoId).join(',');
            const videoResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${API_KEY}`);
            const videoData = await videoResponse.json();
            
            // Clear skeletons and display videos
            videoContainer.innerHTML = '';
            displayVideos(videoData.items);
        }
    } catch (error) {
        console.error('Error searching videos:', error);
        document.getElementById('error-message').textContent = 'Error searching videos. Please try again.';
    } finally {
        finishLoading(preloader, interval);
    }
}

// Add filter functionality
async function filterVideos(category) {
    const { preloader, interval } = startLoading();
    
    try {
        const videoContainer = document.querySelector('.videos-container');
        // Show loading state
        videoContainer.innerHTML = '';
        for (let i = 0; i < 12; i++) {
            videoContainer.appendChild(createSkeletonLoader());
        }

        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${category}&type=video&key=${API_KEY}`);
        const data = await response.json();
        
        if (data.items) {
            const videoIds = data.items.map(item => item.id.videoId).join(',');
            const videoResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${API_KEY}`);
            const videoData = await videoResponse.json();
            
            // Clear skeletons and display videos
            videoContainer.innerHTML = '';
            displayVideos(videoData.items);
        }
    } catch (error) {
        console.error('Error filtering videos:', error);
        document.getElementById('error-message').textContent = 'Error filtering videos. Please try again.';
    } finally {
        finishLoading(preloader, interval);
    }
}

// Display videos function
function displayVideos(videos) {
    const videoContainer = document.querySelector('.videos-container');
    videoContainer.innerHTML = '';
    
    videos.forEach(video => {
        const videoElement = createVideoElement(video);
        videoContainer.appendChild(videoElement);
    });
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Search functionality
    const searchForm = document.querySelector('.middle');
    const searchInput = document.querySelector('.search-input');
    
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const searchQuery = searchInput.value.trim();
        if (searchQuery) {
            searchVideos(searchQuery);
        }
    });

    // Filter functionality
    const filterOptions = document.querySelectorAll('.filter-option');
    filterOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove active class from all options
            filterOptions.forEach(opt => opt.classList.remove('active'));
            // Add active class to clicked option
            option.classList.add('active');
            
            const category = option.textContent;
            if (category === 'All') {
                loadVideos(); // Load default videos
            } else {
                filterVideos(category);
            }
        });
    });

    // Initialize with default videos
    loadVideos();
});

// Update the search icon click event
document.querySelector('.search-icon').addEventListener('click', () => {
    const searchQuery = document.querySelector('.search-input').value.trim();
    if (searchQuery) {
        searchVideos(searchQuery);
    }
});

// Add microphone functionality (placeholder)
document.querySelector('.microphone-icon').addEventListener('click', () => {
    alert('Voice search is not implemented in this demo');
});

// Add scroll functionality to filter options
const filterBar = document.querySelector('.filter-options');
const nextBtn = document.querySelector('.filter-nav-btn.next');
const prevBtn = document.querySelector('.filter-nav-btn.prev');

if (nextBtn && prevBtn) {
    nextBtn.addEventListener('click', () => {
        filterBar.scrollBy({ left: 200, behavior: 'smooth' });
    });

    prevBtn.addEventListener('click', () => {
        filterBar.scrollBy({ left: -200, behavior: 'smooth' });
    });

    // Show/hide scroll buttons based on scroll position
    filterBar.addEventListener('scroll', () => {
        prevBtn.style.display = filterBar.scrollLeft > 0 ? 'block' : 'none';
        nextBtn.style.display = 
            filterBar.scrollLeft < (filterBar.scrollWidth - filterBar.clientWidth) 
            ? 'block' 
            : 'none';
    });
}

// Update CSS for filter navigation buttons
const style = document.createElement('style');
style.textContent = `
    .filter-nav-btn {
        display: none;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .filter-nav-btn.next { right: 0; }
    .filter-nav-btn.prev { left: 0; }
    .filter-nav-btn:hover {
        background-color: #f2f2f2;
    }
`;
document.head.appendChild(style);

// Add preloader to the page
function createPreloader() {
    const preloader = document.createElement('div');
    preloader.className = 'preloader';
    preloader.innerHTML = '<div class="preloader-bar"></div>';
    document.body.appendChild(preloader);
    return preloader;
}

// Start loading animation
function startLoading() {
    const preloader = createPreloader();
    const bar = preloader.querySelector('.preloader-bar');
    document.querySelector('.main-content').classList.add('content-loading');
    
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) {
            clearInterval(interval);
        }
        bar.style.width = Math.min(progress, 90) + '%';
    }, 200);
    
    return { preloader, interval };
}

// Finish loading animation
function finishLoading(preloader, interval) {
    const bar = preloader.querySelector('.preloader-bar');
    clearInterval(interval);
    
    // Complete the progress bar
    bar.style.width = '100%';
    
    // Fade out the preloader
    setTimeout(() => {
        preloader.classList.add('fade-out');
        document.querySelector('.main-content').classList.remove('content-loading');
        document.querySelector('.main-content').classList.add('content-loaded');
        
        // Remove preloader from DOM after animation
        setTimeout(() => {
            preloader.remove();
        }, 300);
    }, 200);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
}

// Format duration
function formatDuration(duration) {
    if (!duration) return '0:00';
    
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Update loadVideos function
async function loadVideos() {
    const { preloader, interval } = startLoading();
    
    try {
        console.log('Loading videos...');
        const videoContainer = document.querySelector('.videos-container');
        if (!videoContainer) {
            console.error('Videos container not found!');
            return;
        }
        
        // Clear container and add loading skeletons
        videoContainer.innerHTML = '';
        for (let i = 0; i < 12; i++) {
            videoContainer.appendChild(createSkeletonLoader());
        }

        const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&chart=mostPopular&maxResults=20&regionCode=US&key=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Received data:', data);
        
        if (data.items && data.items.length > 0) {
            // Clear skeletons
            videoContainer.innerHTML = '';
            data.items.forEach(video => {
                const videoElement = createVideoElement(video);
                videoContainer.appendChild(videoElement);
            });
            console.log('Videos added successfully');
        } else {
            throw new Error('No videos found in response');
        }
    } catch (error) {
        console.error('Error loading videos:', error);
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.textContent = 'Error loading videos. Please try again later.';
        }
        const videoContainer = document.querySelector('.videos-container');
        if (videoContainer) {
            videoContainer.innerHTML = '<div class="error-state">No videos available. Please try again later.</div>';
        }
    } finally {
        finishLoading(preloader, interval);
    }
}

function createSkeletonLoader() {
    const skeleton = document.createElement('div');
    skeleton.className = 'video-item skeleton';
    skeleton.innerHTML = `
        <div class="video-thumbnail skeleton-thumbnail">
            <div class="skeleton-animation"></div>
        </div>
        <div class="video-info">
            <div class="channel-icon skeleton-circle">
                <div class="skeleton-animation"></div>
            </div>
            <div class="video-details">
                <div class="skeleton-line title-line">
                    <div class="skeleton-animation"></div>
                </div>
                <div class="skeleton-line">
                    <div class="skeleton-animation"></div>
                </div>
                <div class="skeleton-line short">
                    <div class="skeleton-animation"></div>
                </div>
            </div>
        </div>
    `;
    return skeleton;
}

function createVideoElement(video) {
    const videoCard = document.createElement('div');
    videoCard.className = 'video-item';
    
    const duration = video.contentDetails?.duration;
    const formattedDuration = formatDuration(duration);
    
    // Get channel thumbnail URL
    const channelThumbnail = video.snippet?.thumbnails?.default?.url || 'https://i.pravatar.cc/100?u=' + video.snippet.channelId;
    
    videoCard.innerHTML = `
        <div class="video-thumbnail">
            <img src="${video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium.url}" 
                 alt="${video.snippet.title}"
                 loading="lazy">
            ${duration ? `<div class="video-duration">${formattedDuration}</div>` : ''}
            <div class="video-preview">
                ${generatePreviewThumbnails(video.snippet.thumbnails)}
            </div>
            <div class="video-progress">
                <div class="progress-bar"></div>
            </div>
            <div class="video-actions">
                <button class="action-btn watch-later" title="Watch later">
                    <span class="material-icons">watch_later</span>
                </button>
                <button class="action-btn add-to-queue" title="Add to queue">
                    <span class="material-icons">playlist_play</span>
                </button>
            </div>
        </div>
        <div class="video-info">
            <div class="channel-icon">
                <img src="${channelThumbnail}" 
                     alt="${video.snippet.channelTitle}"
                     loading="lazy">
                <div class="channel-tooltip">
                    <div class="channel-preview">
                        <img src="${channelThumbnail}" alt="${video.snippet.channelTitle}">
                        <div class="channel-info">
                            <h3>${video.snippet.channelTitle}</h3>
                            <p class="subscribers">Loading subscribers...</p>
                            <button class="subscribe-btn">Subscribe</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="video-details">
                <h3 class="title">${video.snippet.title}</h3>
                <div class="video-menu">
                    <button class="menu-btn" aria-label="More actions">
                        <span class="material-icons">more_vert</span>
                    </button>
                    <div class="menu-dropdown">
                        <div class="menu-item" data-action="playlist">
                            <span class="material-icons">playlist_add</span>
                            Save to playlist
                        </div>
                        <div class="menu-item" data-action="share">
                            <span class="material-icons">share</span>
                            Share
                        </div>
                        <div class="menu-item" data-action="not-interested">
                            <span class="material-icons">not_interested</span>
                            Not interested
                        </div>
                        <div class="menu-item" data-action="report">
                            <span class="material-icons">flag</span>
                            Report
                        </div>
                    </div>
                </div>
                <p class="channel-name">
                    ${video.snippet.channelTitle}
                    <span class="verified-badge material-icons">check_circle</span>
                </p>
                <div class="video-stats">
                    <span>${formatViewCount(video.statistics.viewCount)} views</span>
                    <span>•</span>
                    <span>${formatDate(video.snippet.publishedAt)}</span>
                </div>
            </div>
        </div>
    `;
    
    // Add hover events for preview
    const thumbnail = videoCard.querySelector('.video-thumbnail');
    const preview = videoCard.querySelector('.video-preview');
    let currentPreviewIndex = 0;
    let previewInterval;
    
    thumbnail.addEventListener('mouseenter', () => {
        if (generatePreviewThumbnails(video.snippet.thumbnails)) {
            preview.style.display = 'block';
            previewInterval = setInterval(() => {
                currentPreviewIndex = (currentPreviewIndex + 1) % generatePreviewThumbnails(video.snippet.thumbnails).length;
                preview.children[currentPreviewIndex].style.opacity = '1';
                Array.from(preview.children).forEach((img, index) => {
                    if (index !== currentPreviewIndex) img.style.opacity = '0';
                });
            }, 800);
        }
    });
    
    thumbnail.addEventListener('mouseleave', () => {
        clearInterval(previewInterval);
        currentPreviewIndex = 0;
        if (preview) {
            preview.style.display = 'none';
            Array.from(preview.children).forEach(img => img.style.opacity = '0');
        }
    });
    
    // Add menu functionality
    const menuBtn = videoCard.querySelector('.menu-btn');
    const menuDropdown = videoCard.querySelector('.menu-dropdown');
    const menuItems = videoCard.querySelectorAll('.menu-item');
    
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        menuDropdown.style.display = menuDropdown.style.display === 'block' ? 'none' : 'block';
    });
    
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = item.dataset.action;
            handleMenuAction(action, video);
            menuDropdown.style.display = 'none';
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', () => {
        menuDropdown.style.display = 'none';
    });
    
    // Add click handlers for action buttons
    videoCard.querySelector('.watch-later').addEventListener('click', (e) => {
        e.stopPropagation();
        showToast('Added to Watch Later');
    });
    
    videoCard.querySelector('.add-to-queue').addEventListener('click', (e) => {
        e.stopPropagation();
        showToast('Added to Queue');
    });
    
    // Main click handler for video
    videoCard.addEventListener('click', () => {
        window.location.href = `https://youtube.com/watch?v=${video.id}`;
    });
    
    return videoCard;
}

// Generate preview thumbnails
function generatePreviewThumbnails(thumbnails) {
    if (!thumbnails.maxres && !thumbnails.high) return '';
    
    const url = thumbnails.maxres?.url || thumbnails.high?.url;
    let previewHtml = '';
    
    for (let i = 0; i < 5; i++) {
        previewHtml += `<img src="${url}" style="opacity: ${i === 0 ? 1 : 0};" alt="Preview">`;
    }
    
    return previewHtml;
}

// Handle menu actions
function handleMenuAction(action, video) {
    switch (action) {
        case 'playlist':
            showToast('Added to playlist');
            break;
        case 'share':
            navigator.clipboard.writeText(`https://youtube.com/watch?v=${video.id}`)
                .then(() => showToast('Link copied to clipboard'));
            break;
        case 'not-interested':
            showToast('Thanks for the feedback');
            break;
        case 'report':
            showToast('Thanks for reporting this video');
            break;
    }
}

// Enhanced toast notification
function showToast(message) {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Trigger reflow
    toast.offsetHeight;
    
    requestAnimationFrame(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    });
}

// Format large numbers
function formatViewCount(count) {
    const num = parseInt(count);
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
}

// Add error state styles
const errorStyles = document.createElement('style');
errorStyles.textContent = `
    .error-state {
        text-align: center;
        padding: 40px;
        color: #606060;
        font-size: 16px;
        width: 100%;
    }
`;
document.head.appendChild(errorStyles);

// Load videos when the page loads
document.addEventListener('DOMContentLoaded', loadVideos); 