from flask import Flask, request, jsonify, render_template
import re
import math
import string
from collections import Counter
import warnings
warnings.filterwarnings("ignore")

app = Flask(__name__)

class PasswordStrengthChecker:
    def __init__(self):
        # Common weak passwords list
        self.common_passwords = {
            'password', '123456', '12345678', '123456789', '12345',
            'qwerty', 'abc123', 'password1', 'admin', 'welcome',
            'letmein', 'monkey', 'dragon', 'sunshine', 'iloveyou'
        }
        
        # Standard computer guesses per second (1 billion for modern computer)
        self.guesses_per_second = 1000000000
        
    def calculate_complexity_score(self, password):
        """Calculate password strength score (0-10)"""
        if not password:
            return 0.0
            
        score = 0.0
        
        # Check if it's a common password
        if password.lower() in self.common_passwords:
            return 1.0
            
        # Length factor (max 3 points)
        length = len(password)
        if length >= 8:
            score += 1
        if length >= 12:
            score += 1
        if length >= 16:
            score += 1
            
        # Character variety (max 4 points)
        has_lower = any(c.islower() for c in password)
        has_upper = any(c.isupper() for c in password)
        has_digit = any(c.isdigit() for c in password)
        has_special = any(c in string.punctuation for c in password)
        
        score += has_lower + has_upper + has_digit + has_special
        
        # Entropy bonus (max 3 points)
        char_set_size = 0
        if has_lower:
            char_set_size += 26
        if has_upper:
            char_set_size += 26
        if has_digit:
            char_set_size += 10
        if has_special:
            char_set_size += 32
            
        if char_set_size > 0:
            entropy = length * math.log2(char_set_size)
            if entropy > 30:
                score += 1
            if entropy > 60:
                score += 1
            if entropy > 90:
                score += 1
                
        # Penalties
        # Check for sequential characters
        sequential_chars = sum(1 for i in range(len(password)-2) 
                             if ord(password[i]) + 1 == ord(password[i+1]) 
                             and ord(password[i+1]) + 1 == ord(password[i+2]))
        if sequential_chars > 0:
            score -= 1
            
        # Check for repeated characters
        char_counts = Counter(password)
        max_repeat = max(char_counts.values())
        if max_repeat >= 4:
            score -= 0.5
            
        # Check if only one character type is used
        char_types = sum([has_lower, has_upper, has_digit, has_special])
        if char_types < 2:
            score -= 1
            
        # Ensure score is between 0 and 10
        score = max(0, min(10, score))
        
        # Convert to 0-10 scale
        return round(score, 1)
    
    def calculate_crack_time(self, password):
        """Calculate estimated time to brute force the password"""
        if not password or len(password) == 0:
            return "instantly"
            
        # Character set size estimation
        char_set_size = 0
        has_lower = any(c.islower() for c in password)
        has_upper = any(c.isupper() for c in password)
        has_digit = any(c.isdigit() for c in password)
        has_special = any(c in string.punctuation for c in password)
        
        if has_lower:
            char_set_size += 26
        if has_upper:
            char_set_size += 26
        if has_digit:
            char_set_size += 10
        if has_special:
            char_set_size += 32
            
        # If no character set detected, assume lowercase only
        if char_set_size == 0:
            char_set_size = 26
            
        # Total possible combinations
        combinations = char_set_size ** len(password)
        
        # Time in seconds at given guess rate
        seconds = combinations / self.guesses_per_second
        
        # If it's a common password, assume instant crack
        if password.lower() in self.common_passwords:
            seconds = 0.01
        
        # Convert to readable time
        return self.format_time(seconds)
    
    def format_time(self, seconds):
        """Format seconds into human readable time"""
        if seconds < 1:
            return "less than a second"
            
        minutes = seconds / 60
        hours = minutes / 60
        days = hours / 24
        years = days / 365
        
        if years >= 1:
            if years >= 100:
                return f"{int(years):,} years"
            elif years >= 10:
                return f"{years:.1f} years"
            else:
                return f"{years:.2f} years"
        elif days >= 1:
            if days >= 10:
                return f"{int(days)} days"
            else:
                return f"{days:.1f} days"
        elif hours >= 1:
            if hours >= 10:
                return f"{int(hours)} hours"
            else:
                return f"{hours:.1f} hours"
        elif minutes >= 1:
            if minutes >= 10:
                return f"{int(minutes)} minutes"
            else:
                return f"{minutes:.1f} minutes"
        else:
            return f"{int(seconds)} seconds"
    
    def get_strength_feedback(self, score):
        """Get feedback based on score"""
        if score >= 8:
            return "Excellent", "#4CAF50"
        elif score >= 6:
            return "Good", "#8BC34A"
        elif score >= 4:
            return "Fair", "#FFC107"
        elif score >= 2:
            return "Weak", "#FF9800"
        else:
            return "Very Weak", "#F44336"
    
    def check_password(self, password):
        """Main method to check password and return all results"""
        score = self.calculate_complexity_score(password)
        crack_time = self.calculate_crack_time(password)
        strength_text, strength_color = self.get_strength_feedback(score)
        
        return {
            'score': score,
            'crack_time': crack_time,
            'strength_text': strength_text,
            'strength_color': strength_color
        }

checker = PasswordStrengthChecker()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/check_password', methods=['POST'])
def check_password():
    password = request.json.get('password', '')
    result = checker.check_password(password)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)