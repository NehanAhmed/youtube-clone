// Show error message for a form field
export function showError(input, message) {
    const formGroup = input.parentElement;
    formGroup.classList.add('error');
    const error = formGroup.querySelector('.error-message') || createErrorElement(formGroup);
    error.textContent = message;
    error.style.display = 'block';
}

// Hide error message for a form field
export function hideError(input) {
    const formGroup = input.parentElement;
    formGroup.classList.remove('error');
    const error = formGroup.querySelector('.error-message');
    if (error) {
        error.style.display = 'none';
    }
}

// Create error message element
function createErrorElement(formGroup) {
    const error = document.createElement('div');
    error.className = 'error-message';
    formGroup.appendChild(error);
    return error;
}

// Toggle password visibility
export function togglePasswordVisibility(input, icon) {
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Validate email format with comprehensive regex
export function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(String(email).toLowerCase());
}

// Validate password with stronger requirements
export function isValidPassword(password) {
    // At least 8 characters
    // At least one uppercase letter
    // At least one lowercase letter
    // At least one number
    // At least one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

// Validate username format
export function isValidUsername(username) {
    // 3-20 characters
    // Letters, numbers, underscores, hyphens
    // Must start with a letter
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_-]{2,19}$/;
    return usernameRegex.test(username);
}

// Validate full name format
export function isValidFullName(name) {
    // 2-50 characters
    // Letters, spaces, hyphens, apostrophes
    // Each word must start with a capital letter
    const nameRegex = /^[A-Z][a-z]{1,}(?: [A-Z][a-z]{1,})*$/;
    return nameRegex.test(name);
}

// Get password strength
export function getPasswordStrength(password) {
    let score = 0;
    
    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    // Normalize score to 0-4 range
    return Math.min(4, Math.floor(score / 1.5));
}

// Format password strength message
export function getPasswordStrengthMessage(strength) {
    const messages = {
        0: 'Very Weak',
        1: 'Weak',
        2: 'Medium',
        3: 'Strong',
        4: 'Very Strong'
    };
    
    return messages[strength];
} 