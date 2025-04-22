import TextureLoader from './textures.js';
import World from './world.js';
import Player from './player.js';

export default class Game {
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

            // Position initiale du joueur
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
            this.player.x = 2400;
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
            this.render();  // Re-render après un redimensionnement
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

    update(dt) {
        this.player.update(this.world);

        // 🛠️ Ajout du lissage (lerp) pour la caméra
        const smoothing = 0.1;  // Ajuste cette valeur (0 = immédiat, 1 = jamais)
        this.camera.x += (Math.round(this.player.x - this.canvas.width / 2) - this.camera.x) * smoothing;
        this.camera.y += (Math.round(this.player.y - this.canvas.height / 2) - this.camera.y) * smoothing;

        this.world.update();
    }


    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Fond bleu ciel
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        this.world.render(this.ctx);
        this.player.render(this.ctx);

        this.ctx.restore();
    }

    gameLoop(timestamp = 0) {
        const dt = (timestamp - (this.lastTime || timestamp)) / 1000;  // Calculer le temps entre les frames
        this.lastTime = timestamp;  // Stocker le dernier temps

        this.update(dt);  // Passer le delta time à update()
        this.render();
        requestAnimationFrame((t) => this.gameLoop(t));
    }

}
