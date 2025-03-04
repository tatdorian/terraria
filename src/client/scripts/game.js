import TextureLoader from './textures.js';
import World from './world.js';
import Player from './player.js';

export default class Game {  // Changed to default export
    constructor() {
        try {
            this.canvas = document.getElementById('game-canvas');
            if (!this.canvas) {
                throw new Error('Canvas element not found');
            }
            this.ctx = this.canvas.getContext('2d');
            this.world = new World();
            this.player = new Player("Player");
            this.camera = { x: 0, y: 0 };
            this.keys = {};
            
            // Set initial player position
            this.player.x = this.canvas.width / 2;
            this.player.y = 0;

            this.setupCanvas();
            this.setupEventListeners();
        } catch (error) {
            console.error('Game construction error:', error);
            throw error;
        }
    }

    async init() {
        try {
            console.log('Initializing game...');
            await TextureLoader.loadAll();
            console.log('Textures loaded successfully');
            this.gameLoop();
            console.log('Game initialized successfully');
        } catch (error) {
            console.error('Game initialization error:', error);
            throw error;
        }
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            this.player.handleInput(e, true);
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            this.player.handleInput(e, false);
        });
        this.canvas.addEventListener('mousedown', (e) => this.handleClick(e));
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left + this.camera.x;
        const y = e.clientY - rect.top + this.camera.y;
        this.world.handleClick(x, y, e.button === 2);
    }

    update() {
        // Update player
        this.player.update(this.world);

        // Update camera to follow player
        this.camera.x = this.player.x - this.canvas.width / 2;
        this.camera.y = this.player.y - this.canvas.height / 2;

        // Update world
        this.world.update();
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw sky background
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply camera transform
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Render world
        this.world.render(this.ctx);
        
        // Render player
        this.player.render(this.ctx);
        
        // Restore canvas state
        this.ctx.restore();
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}