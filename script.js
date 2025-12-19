document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('passwordInput');
    const toggleButton = document.getElementById('togglePassword');
    const checkButton = document.getElementById('checkButton');
    const resultsContainer = document.getElementById('resultsContainer');
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    const scoreValue = document.getElementById('scoreValue');
    const crackTime = document.getElementById('crackTime');
    const exampleButtons = document.querySelectorAll('.example-btn');
    
    let passwordVisible = false;
    
    // Toggle password visibility
    toggleButton.addEventListener('click', function() {
        passwordVisible = !passwordVisible;
        passwordInput.type = passwordVisible ? 'text' : 'password';
        toggleButton.innerHTML = passwordVisible ? 
            '<i class="fas fa-eye-slash"></i>' : 
            '<i class="fas fa-eye"></i>';
    });
    
    // Check password when button is clicked
    checkButton.addEventListener('click', checkPassword);
    
    // Also check when Enter is pressed in the input field
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });
    
    // Add event listeners to example buttons
    exampleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const examplePassword = this.getAttribute('data-password');
            passwordInput.value = examplePassword;
            passwordInput.type = 'password';
            passwordVisible = false;
            toggleButton.innerHTML = '<i class="fas fa-eye"></i>';
            checkPassword();
        });
    });
    
    // Real-time password strength indicator
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        if (password.length > 0) {
            // Update in real-time as user types
            updatePasswordStrength(password);
        } else {
            // Hide results if input is empty
            resultsContainer.style.display = 'none';
        }
    });
    
    function checkPassword() {
        const password = passwordInput.value.trim();
        
        if (!password) {
            alert('Please enter a password to check');
            return;
        }
        
        // Show loading state
        checkButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
        checkButton.disabled = true;
        
        // Send request to server
        fetch('/check_password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: password })
        })
        .then(response => response.json())
        .then(data => {
            displayResults(data);
            checkButton.innerHTML = '<i class="fas fa-check"></i> Check Password';
            checkButton.disabled = false;
        })
        .catch(error => {
            console.error('Error:', error);
            checkButton.innerHTML = '<i class="fas fa-check"></i> Check Password';
            checkButton.disabled = false;
            alert('Error checking password. Please try again.');
        });
    }
    
    function updatePasswordStrength(password) {
        // Quick client-side estimation for real-time feedback
        let estimatedScore = 0;
        const length = password.length;
        
        // Length scoring
        if (length >= 8) estimatedScore += 1;
        if (length >= 12) estimatedScore += 1;
        if (length >= 16) estimatedScore += 1;
        
        // Character variety
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasDigit = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        
        estimatedScore += hasLower + hasUpper + hasDigit + hasSpecial;
        
        // Adjust for common passwords
        const commonPasswords = ['password', '123456', 'qwerty', 'letmein', 'welcome'];
        if (commonPasswords.includes(password.toLowerCase())) {
            estimatedScore = Math.min(estimatedScore, 2);
        }
        
        // Update visual indicators
        const percentage = Math.min(estimatedScore * 10, 100);
        strengthFill.style.width = `${percentage}%`;
        
        // Update text
        if (estimatedScore >= 8) {
            strengthText.textContent = 'Excellent';
            strengthText.style.background = '#4CAF50';
        } else if (estimatedScore >= 6) {
            strengthText.textContent = 'Good';
            strengthText.style.background = '#8BC34A';
        } else if (estimatedScore >= 4) {
            strengthText.textContent = 'Fair';
            strengthText.style.background = '#FFC107';
        } else if (estimatedScore >= 2) {
            strengthText.textContent = 'Weak';
            strengthText.style.background = '#FF9800';
        } else {
            strengthText.textContent = 'Very Weak';
            strengthText.style.background = '#F44336';
        }
        
        // Show results container
        resultsContainer.style.display = 'block';
    }
    
    function displayResults(data) {
        // Update strength meter
        const percentage = data.score * 10;
        strengthFill.style.width = `${percentage}%`;
        
        // Update strength text and color
        strengthText.textContent = data.strength_text;
        strengthText.style.background = data.strength_color;
        
        // Update score
        scoreValue.textContent = data.score.toFixed(1);
        
        // Update crack time
        crackTime.textContent = `Your password would take ${data.crack_time} to crack.`;
        
        // Show results container with animation
        resultsContainer.style.display = 'block';
        resultsContainer.style.animation = 'none';
        setTimeout(() => {
            resultsContainer.style.animation = 'fadeIn 0.5s ease';
        }, 10);
        
        // Update security tips based on score
        const tipsList = document.getElementById('securityTips');
        tipsList.innerHTML = '';
        
        const tips = [];
        
        if (data.score < 4) {
            tips.push('Use a longer password (12+ characters)');
            tips.push('Mix uppercase and lowercase letters');
            tips.push('Include numbers and special characters');
            tips.push('Avoid dictionary words and common patterns');
        } else if (data.score < 7) {
            tips.push('Consider adding more special characters');
            tips.push('Make it longer for better security');
            tips.push('Avoid using personal information');
        } else {
            tips.push('Great password! Consider using a password manager');
            tips.push('Enable two-factor authentication where possible');
            tips.push('Use unique passwords for each account');
        }
        
        tips.forEach(tip => {
            const li = document.createElement('li');
            li.textContent = tip;
            tipsList.appendChild(li);
        });
    }
    
    // Initialize with an empty check
    resultsContainer.style.display = 'none';
});