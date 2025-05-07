// game.js
import TextureLoader from './textures.js';
import World from './world.js';
import Player from './player.js';
import ItemDatabase from './utils.js';

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
            this.mousePosition = { x: 0, y: 0 }; // Ajout pour suivre la position de la souris
            this.lastClickTime = 0; // Pour le throttling des clics

            // Set player's initial position
            this.player.x = this.canvas.width / 2;
            this.player.y = 0;

            this.setupCanvas();
            this.setupEventListeners();
            
            console.log('Game constructed successfully');
        } catch (error) {
            console.error('Game construction error:', error);
            throw error;
        }
    }

    async init() {
        try {
            console.log('Initializing game...');
            
            // Load SQL.js if needed
            if (typeof initSqlJs !== 'undefined') {
                console.log('Initializing ItemDatabase...');
                await ItemDatabase.init();
            } else {
                console.warn('SQL.js not available, skipping ItemDatabase initialization');
            }
            
            // Load all textures
            await TextureLoader.loadAll();
            console.log('Textures loaded successfully');
            
            // Set initial player position
            this.player.x = 2400;
            
            // Start the game loop
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
        
        this.ctx.imageSmoothingEnabled = false;

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.render();  // Re-render after resize
        });
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault(); // Prevent tab from changing focus
                this.player.inventoryOpen = !this.player.inventoryOpen;
            } else {
                this.keys[e.key] = true;
                this.player.handleInput(e, true, this.world);
            }
        });
    
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            this.player.handleInput(e, false, this.world);
        });
        
        // Suivre la position de la souris
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePosition.x = e.clientX - rect.left;
            this.mousePosition.y = e.clientY - rect.top;
        });
    
        this.canvas.addEventListener('mousedown', (e) => {
            // Ajouter throttling pour éviter les clics trop rapides
            const now = Date.now();
            if (now - this.lastClickTime < 200) { // 200ms entre les clics
                return;
            }
            this.lastClickTime = now;
            
            if (this.player.inventoryOpen) {
                this.handleInventoryClick(e);
            } else {
                this.handleClick(e);
            }
        });
        
        // Prevent context menu on right-click
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    handleInventoryClick(e) {
        const slotSize = 50;
        const padding = 10;
        const startX = (this.canvas.width - (slotSize + padding) * 10) / 2;
        const y = this.canvas.height - slotSize - 20;
    
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
    
        for (let i = 0; i < 10; i++) {
            const x = startX + i * (slotSize + padding);
            if (
                mouseX >= x && mouseX <= x + slotSize &&
                mouseY >= y && mouseY <= y + slotSize
            ) {
                this.player.selectedSlot = i;
                break;
            }
        }
    }
    
    handleClick(e) {
        // Calculer les coordonnées du monde en fonction de la caméra
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Coordonnées du clic dans le monde
        const worldX = mouseX + this.camera.x;
        const worldY = mouseY + this.camera.y;
        
        // Déterminer le tile exact
        const tileX = Math.floor(worldX / this.world.tileSize);
        const tileY = Math.floor(worldY / this.world.tileSize);
        
        // Afficher des informations de débogage
        console.log(`Clic détecté: position écran (${mouseX}, ${mouseY}), position monde (${worldX}, ${worldY}), tile (${tileX}, ${tileY})`);
        
        // Si le clic est dans les limites du monde
        if (
            tileY >= 0 && tileY < this.world.tiles.length && 
            tileX >= 0 && tileX < this.world.tiles[0].length
        ) {
            const isRightClick = e.button === 2;
            const tileType = this.world.tiles[tileY][tileX];
            
            console.log(`Type de tuile: ${tileType}, bouton: ${isRightClick ? 'droit' : 'gauche'}`);
            
            // Appeler handleClick du monde avec les coordonnées correctes
            const result = this.world.handleClick(worldX, worldY, isRightClick, this.player);
            console.log(`Résultat de l'action: ${result ? 'succès' : 'échec'}`);
        }
    }

    update(dt) {
        // Update player
        this.player.update(this.world);
        
        // Update world (for item pickups)
        this.world.update(this.player);
        
        // Camera smoothing (lerp)
        const smoothing = 0.1;  // Adjust between 0 (immediate) and 1 (very smooth)
        this.camera.x += ((this.player.x - this.canvas.width / 2) - this.camera.x) * smoothing;
        this.camera.y += ((this.player.y - this.canvas.height / 2) - this.camera.y) * smoothing;

        // Touche R pour ramasser des objets à proximité
        if (this.keys['r'] || this.keys['R']) {
            this.player.tryPickupNearbyItems(this.world);
            // Réinitialiser pour éviter de ramasser en continu
            this.keys['r'] = false;
            this.keys['R'] = false;
        }

        // Touche C pour crafter
        if (this.keys['c'] || this.keys['C']) {
            this.player.craftItems();
            // Réinitialiser pour éviter de crafter en continu
            this.keys['c'] = false;
            this.keys['C'] = false;
        }
    }

    renderInventory() {
        const ctx = this.ctx;
        const slotSize = 50;
        const padding = 10;
        const startX = (this.canvas.width - (slotSize + padding) * 10) / 2;
        const y = this.canvas.height - slotSize - 20;

        // Draw background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(startX - padding, y - padding, 
                    (slotSize + padding) * 10 + padding * 2, 
                    slotSize + padding * 2);

        // Draw slots
        for (let i = 0; i < 10; i++) {
            const x = startX + i * (slotSize + padding);

            ctx.fillStyle = i === this.player.selectedSlot ? '#FFD700' : '#444';
            ctx.fillRect(x, y, slotSize, slotSize);

            ctx.strokeStyle = '#000';
            ctx.strokeRect(x, y, slotSize, slotSize);

            const item = this.player.inventory[i];
            if (item && item.texture) {
                ctx.drawImage(item.texture, x + 8, y + 8, 34, 34);
                
                // Show quantity if items are stackable
                if (item.quantity && item.quantity > 1) {
                    ctx.fillStyle = 'white';
                    ctx.font = '12px Arial';
                    ctx.fillText(item.quantity, x + slotSize - 16, y + slotSize - 8);
                }
            }
        }
        
        // Show selected item name
        const selectedItem = this.player.inventory[this.player.selectedSlot];
        if (selectedItem) {
            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.fillText(selectedItem.name, startX, y - 10);
        }
        
        // Draw craft button
        const buttonWidth = 120;
        const buttonHeight = 30;
        const buttonX = startX + (slotSize + padding) * 10 + padding;
        const buttonY = y + (slotSize - buttonHeight) / 2;
        
        ctx.fillStyle = '#4A90E2';
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.fillText('Craft Pickaxe (C)', buttonX + 10, buttonY + 20);
        
        // Instructions
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText('R: Ramasser items proches', startX, y + slotSize + padding * 2);
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw sky background
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Apply camera transformation
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // Render world and player
        this.world.render(this.ctx);
        this.player.render(this.ctx);

        // Render cible de la souris
        const worldMouseX = this.mousePosition.x + this.camera.x;
        const worldMouseY = this.mousePosition.y + this.camera.y;
        const tileX = Math.floor(worldMouseX / this.world.tileSize) * this.world.tileSize;
        const tileY = Math.floor(worldMouseY / this.world.tileSize) * this.world.tileSize;
        
        // Dessiner un contour pour le tile ciblé
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(tileX, tileY, this.world.tileSize, this.world.tileSize);

        // Restore transformation
        this.ctx.restore();

        // Render inventory if open
        if (this.player.inventoryOpen) {
            this.renderInventory();
        }
    }

    gameLoop(timestamp = 0) {
        const dt = (timestamp - (this.lastTime || timestamp)) / 1000;  // Delta time in seconds
        this.lastTime = timestamp;  // Store last frame time

        this.update(dt);
        this.render();
        
        // Continue the loop
        requestAnimationFrame((t) => this.gameLoop(t));
    }
}