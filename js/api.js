import { API_KEY, DEFAULT_SEARCH_QUERY, MAX_RESULTS } from './config.js';
import { createVideoElement } from './videoPlayer.js';

// Function to load videos with error handling
export async function loadVideos(searchQuery = '') {
    const videoGrid = document.querySelector('.video-grid');
    videoGrid.innerHTML = '<div class="loading">Loading videos...</div>';

    try {
        // Create a direct fetch request with the API key
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${MAX_RESULTS}&type=video&key=${API_KEY}&q=${encodeURIComponent(searchQuery || DEFAULT_SEARCH_QUERY)}`;
        
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