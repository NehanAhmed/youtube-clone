import { loadVideos } from './api.js';
import { initializeEvents } from './events.js';
import { addErrorStyles, addAnimationStyles } from './styles.js';

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Add styles
    addErrorStyles();
    addAnimationStyles();

    // Initialize event handlers
    initializeEvents();

    // Load initial videos
    loadVideos();
}); 