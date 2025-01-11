document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.querySelector('.toggle-password i');
    const rememberMe = document.getElementById('remember');

    // Check if there's stored login data
    const storedEmail = localStorage.getItem('rememberedEmail');
    if (storedEmail) {
        emailInput.value = storedEmail;
        rememberMe.checked = true;
    }

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        togglePasswordVisibility(passwordInput, togglePassword);
    });

    // Handle form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset errors
        hideError(emailInput);
        hideError(passwordInput);

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        let isValid = true;

        // Validate email
        if (!email) {
            showError(emailInput, 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError(emailInput, 'Please enter a valid email');
            isValid = false;
        }

        // Validate password
        if (!password) {
            showError(passwordInput, 'Password is required');
            isValid = false;
        }

        if (isValid) {
            try {
                const response = await fetch('php/login.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
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
                    // Handle "Remember me" functionality
                    if (rememberMe.checked) {
                        localStorage.setItem('rememberedEmail', email);
                    } else {
                        localStorage.removeItem('rememberedEmail');
                    }

                    // Store user data
                    localStorage.setItem('user', JSON.stringify(data.user));

                    // Successful login
                    alert('Login successful!');
                    window.location.href = '../index.html';
                } else {
                    const errorMessage = document.getElementById('error-message');
                    errorMessage.textContent = data.message || 'Login failed. Please try again.';
                    errorMessage.style.display = 'block';
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