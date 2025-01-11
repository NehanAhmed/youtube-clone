import { HOVER_PREVIEW_DELAY } from './config.js';
import { formatViewCount, formatDuration, formatDate } from './utils.js';

// Create video element with all details
export function createVideoElement(video, stats, duration) {
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
        openVideoPlayer(video.id.videoId);
    });

    return videoDiv;
}

// Add video hover preview functionality
export function addVideoPreview(videoElement, videoId) {
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
        }, HOVER_PREVIEW_DELAY);
    });

    thumbnail.addEventListener('mouseleave', () => {
        clearTimeout(previewTimeout);
        const preview = thumbnail.querySelector('.video-preview');
        if (preview) {
            preview.remove();
        }
    });
}

// Open video player modal
export function openVideoPlayer(videoId) {
    const modal = document.getElementById('video-player-modal');
    if (modal) {
        modal.style.display = 'block';
        const videoPlayer = document.getElementById('video-player');
        if (videoPlayer) {
            videoPlayer.innerHTML = `
                <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            `;
        }
    }
} 