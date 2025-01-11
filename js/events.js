import { loadVideos } from './api.js';
import { THUMBNAIL_HOVER_DELAY } from './config.js';

// Initialize event handlers
export function initializeEvents() {
    // Get DOM elements
    const searchInput = document.querySelector('.search-input');
    const searchIcon = document.querySelector('.search-icon');
    const microphoneIcon = document.querySelector('.microphone-icon');
    const bellDiv = document.querySelector('.bell-div');
    const createDiv = document.querySelector('.create-div');
    const hamIcon = document.getElementById('ham-icon');
    const filterBar = document.querySelector('.filter-bar');
    const filterOptions = document.querySelector('.filter-options');
    const prevBtn = document.querySelector('.filter-nav-btn.prev');
    const nextBtn = document.querySelector('.filter-nav-btn.next');

    // Sidebar toggle
    hamIcon.addEventListener('click', () => {
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
                loadVideos(transcript);
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

    // Create video dropdown
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

    // Filter navigation
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
} 