import { 
    showError, 
    hideError, 
    togglePasswordVisibility, 
    isValidEmail, 
    isValidPassword, 
    isValidUsername,
    isValidFullName,
    getPasswordStrength,
    getPasswordStrengthMessage
} from './utils.js';

const API_KEY = 'AIzaSyCX1GBZrNdbcHNuJpGRhY9RxRvDwv3aAaY';

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const fullnameInput = document.getElementById('fullname');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const termsCheckbox = document.getElementById('terms');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password i');
    const passwordStrengthDiv = document.querySelector('.password-strength');

    // Update password strength in real-time
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const strength = getPasswordStrength(password);
        const message = getPasswordStrengthMessage(strength);
        
        passwordStrengthDiv.textContent = message;
        
        // Set color based on strength
        const colors = {
            0: '#ff4444', // Very Weak - Red
            1: '#ffa700', // Weak - Orange
            2: '#ffe600', // Medium - Yellow
            3: '#9dff00', // Strong - Light Green
            4: '#00ff55'  // Very Strong - Green
        };
        
        passwordStrengthDiv.style.color = colors[strength];
    });

    // Toggle password visibility for both password fields
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.closest('.form-group').querySelector('input');
            togglePasswordVisibility(input, btn);
        });
    });

    // Handle form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset all errors
        [fullnameInput, usernameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
            hideError(input);
        });

        const fullname = fullnameInput.value.trim();
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        let isValid = true;

        // Validate full name
        if (!fullname) {
            showError(fullnameInput, 'Full name is required');
            isValid = false;
        } else if (!isValidFullName(fullname)) {
            showError(fullnameInput, 'Please enter a valid full name (e.g., John Doe)');
            isValid = false;
        }

        // Validate username
        if (!username) {
            showError(usernameInput, 'Username is required');
            isValid = false;
        } else if (!isValidUsername(username)) {
            showError(usernameInput, 'Username must be 3-20 characters and start with a letter');
            isValid = false;
        }

        // Validate email
        if (!email) {
            showError(emailInput, 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError(emailInput, 'Please enter a valid email address');
            isValid = false;
        }

        // Validate password
        if (!password) {
            showError(passwordInput, 'Password is required');
            isValid = false;
        } else if (!isValidPassword(password)) {
            showError(passwordInput, 'Password must be at least 8 characters with uppercase, lowercase, number, and special character');
            isValid = false;
        } else if (getPasswordStrength(password) < 4) {
            showError(passwordInput, 'Please choose a stronger password');
            isValid = false;
        }

        // Validate confirm password
        if (!confirmPassword) {
            showError(confirmPasswordInput, 'Please confirm your password');
            isValid = false;
        } else if (password !== confirmPassword) {
            showError(confirmPasswordInput, 'Passwords do not match');
            isValid = false;
        }

        // Validate terms
        if (!termsCheckbox.checked) {
            alert('Please accept the Terms of Service and Privacy Policy');
            isValid = false;
        }

        if (isValid) {
            try {
                const response = await fetch('php/register.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        fullname: fullname,
                        username: username,
                        email: email,
                        password: password
                    })
                });

                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new TypeError("Oops, we haven't got JSON!");
                }

                const data = await response.json();
                console.log('Server response:', data); // Debug log

                if (data.success) {
                    alert('Registration successful! Please login.');
                    window.location.href = 'login.html';
                } else {
                    const errorMessage = document.getElementById('error-message');
                    errorMessage.textContent = data.message || 'Registration failed. Please try again.';
                    errorMessage.style.display = 'block';
                    
                    // Handle specific error cases
                    if (data.message.includes('email already exists')) {
                        showError(emailInput, 'This email is already registered');
                    } else if (data.message.includes('username already exists')) {
                        showError(usernameInput, 'This username is already taken');
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                const errorMessage = document.getElementById('error-message');
                errorMessage.textContent = 'An error occurred. Please try again later.';
                errorMessage.style.display = 'block';
            }
        }
    });
}); 