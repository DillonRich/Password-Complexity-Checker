# Password-Complexity-Checker
An interactive web application that evaluates password security by calculating a complexity score and estimating the time it would take to brute force a password.

Features
Complexity Scoring: Rates passwords on a scale of 0.0 to 10.0 based on: Length, Character variety, Entropy calculation, Common password detection, Pattern recognition.

Brute Force Time Estimation: Estimates how long it would take a modern computer (capable of 1 billion guesses per second) to crack the password.
Brute Force Crack Time Estimation
combinations = character_set_size ^ password_length
seconds = combinations / 1,000,000,000 (1 billion guesses per second)

Displays time in appropriate units (seconds, minutes, hours, days, or years) only showing relevant units.

User Interface
Clean, Modern Design: Professional gradient background with card-based layout

Real-time Feedback: Strength meter updates as you type

Visual Indicators:

Color-coded strength meter (red to green)

Textual strength rating (Very Weak to Excellent)

Numeric complexity score in a clear, rectangular display

Interactive Elements:

Password visibility toggle

Example passwords for testing

Responsive design for mobile and desktop

Security Tips: Contextual advice based on password strength

How It Works
Password Scoring Algorithm
The application evaluates passwords based on:

Length: Points for passwords of 8+, 12+, and 16+ characters

Character Variety: Points for including lowercase, uppercase, digits, and special characters

Entropy: Bonus points for high entropy (randomness)

Penalties: Deductions for sequential characters, repeated characters, and using only one character type

Common Passwords: Severe penalty for using known weak passwords
______________________________________________________________________________________________________________________________________________
Backend
Python 3.x with Flask web framework

Password analysis algorithms with entropy calculation

RESTful API endpoint for password checking

Frontend
HTML5 for structure

CSS3 with modern features (flexbox, gradients, animations)

JavaScript (ES6) for interactive functionality

Font Awesome for icons

