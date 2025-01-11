// Format view count to K, M format
export function formatViewCount(viewCount) {
    if (viewCount >= 1000000) {
        return (viewCount / 1000000).toFixed(1) + 'M';
    } else if (viewCount >= 1000) {
        return (viewCount / 1000).toFixed(1) + 'K';
    }
    return viewCount;
}

// Format YouTube duration to readable format
export function formatDuration(duration) {
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

// Format publish date to relative time
export function formatDate(publishedAt) {
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