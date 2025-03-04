const API_URL = 'http://localhost:5000';

// Update fetch options for CORS
const fetchOptions = {
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    mode: 'cors'
};

document.addEventListener('DOMContentLoaded', () => {
    // Log to check if script is running
    console.log('Auth script loaded');

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const gameContainer = document.getElementById('game-container');
    const loginContainer = document.getElementById('login-container');

    if (!loginForm || !registerForm) {
        console.error('Required form elements not found');
        return;
    }

    // Toggle between login and register forms
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Showing register form');
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Showing login form');
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Login attempt...');

        const formData = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
        };

        try {
            console.log('Sending request to:', `${API_URL}/login`);
            const response = await fetch(`${API_URL}/login`, {
                ...fetchOptions,
                method: 'POST',
                body: JSON.stringify(formData),
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            // Update the login success handler
            if (response.ok) {
                console.log('Login successful, starting game...');
                loginContainer.style.display = 'none';
                gameContainer.style.display = 'block';
                
                try {
                    // Import the default export (Game) correctly
                    const { default: Game } = await import('./game.js');
                    const game = new Game();
                    await game.init();

                    console.log('Game started successfully');
                } catch (error) {
                    console.error('Error starting game:', error);
                    alert('Error starting game: ' + error.message);
                    loginContainer.style.display = 'block';
                    gameContainer.style.display = 'none';
                }
            } else {
                alert(data.error || 'Login failed!');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Server connection error. Please make sure the server is running on port 5000');
        }
    });

    // Handle register form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Registration attempt...');
        
        const formData = {
            username: document.getElementById('reg-username').value,
            password: document.getElementById('reg-password').value,
        };

        try {
            const response = await fetch(`${API_URL}/register`, {
                ...fetchOptions,
                method: 'POST',
                body: JSON.stringify(formData)
            });

            console.log('Registration response:', response.status);
            const data = await response.json();
            console.log('Registration data:', data);

            if (response.ok) {
                alert('Registration successful! Please login.');
                registerForm.style.display = 'none';
                loginForm.style.display = 'block';
                registerForm.reset();
            } else {
                alert(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Connection error. Please try again.');
        }
    });
});

// Asset paths
const assetPaths = {
    tiles: {
        dirt: '/assets/tiles/dirt.png',
        grass: '/assets/tiles/grass.png',
        stone: '/assets/tiles/stone.png'
    },
    player: {
        player: '/assets/player/player.png'
    }
};

const fs = require('fs');
const { createCanvas } = require('canvas');

function createTexture(color, filename) {
    const canvas = createCanvas(32, 32);
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 32, 32);
    
    // Add some pixel noise for texture
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    for (let i = 0; i < 32; i += 4) {
        for (let j = 0; j < 32; j += 4) {
            if (Math.random() > 0.5) {
                ctx.fillRect(i, j, 4, 4);
            }
        }
    }
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filename, buffer);
}

// Create directory structure
const dirs = [
    'src/client/assets/tiles',
    'src/client/assets/player'
];

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Create textures
createTexture('#8B4513', 'src/client/assets/tiles/dirt.png');
createTexture('#228B22', 'src/client/assets/tiles/grass.png');
createTexture('#808080', 'src/client/assets/tiles/stone.png');
createTexture('#FF0000', 'src/client/assets/player/player.png');

// Run the following commands to set up the project
// cd terraria-clone
// npm install canvas
// node src/client/scripts/create-textures.js