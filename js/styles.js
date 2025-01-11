// Add error message styles
export function addErrorStyles() {
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
}

// Add loading animation and hover effect styles
export function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
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
} 