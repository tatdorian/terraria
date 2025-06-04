// game.js
import TextureLoader from './textures.js';
import World from './world.js';
import Player from './player.js';
import ItemDatabase from './utils.js';
import { initSideMenu } from './sideMenu.js';
import { CraftingSystem } from './crafting.js';

export default class Game {
    constructor(username) {
        try {
            this.canvas = document.getElementById('game-canvas');
            if (!this.canvas) {
                throw new Error('Canvas element not found');
            }
            this.ctx = this.canvas.getContext('2d');
            this.world = new World();
            this.player = new Player(username);
            this.world.setPlayer(this.player); // Lier le player au world
            this.camera = { x: 0, y: 0 };
            this.keys = {};
            this.craftMenuOpen = false;  // Add this line

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
            
            // Initialize side menu
            initSideMenu();
            
            // Initialize crafting system
            this.craftingSystem = new CraftingSystem(this.player.inventory);
            
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
                this.player.inventoryOpen = !this.player.inventoryOpen; // Toggle inventory
                return; 
            }
            
            if (e.key === 'c' || e.key === 'C') {
                e.preventDefault();
                this.craftMenuOpen = !this.craftMenuOpen;
                const craftMenu = document.querySelector('.craft-menu');
                if (craftMenu) {
                    craftMenu.style.display = this.craftMenuOpen ? 'block' : 'none';
                }
                return;
            }
            
            if (e.key === 'f' || e.key === 'F') {
                this.world.collectNearbyItems(this.player);
                return;
            }
            
            if (!this.player.inventoryOpen) {
                this.keys[e.key] = true;
                this.player.handleInput(e, true);
            }
        });
    
        window.addEventListener('keyup', (e) => {
            if (e.key === 'Tab') return; // Ignorer le relâchement de Tab
            
            this.keys[e.key] = false;
            if (!this.player.inventoryOpen) {
                this.player.handleInput(e, false);
            }
        });
    
        this.canvas.addEventListener('mousedown', (e) => {
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
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left + this.camera.x;
        const y = e.clientY - rect.top + this.camera.y;
        
        // Passage du player pour pouvoir mettre à jour l'inventaire
        this.world.handleClick(x, y, e.button === 2, this.player);
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
    }

    renderInventory() {
        const ctx = this.ctx;
        const slotSize = 64;
        const padding = 8;
        const startX = (this.canvas.width - (slotSize + padding) * 10) / 2;
        const y = this.canvas.height - slotSize - 20;
    
        // Fond semi-transparent
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(startX - padding, y - padding, 
                    (slotSize + padding) * 10 + padding * 2, 
                    slotSize + padding * 2);
    
        // Dessiner les slots
        for (let i = 0; i < this.player.inventory.slots.length; i++) {
            const slot = this.player.inventory.slots[i];
            const x = startX + i * (slotSize + padding);
    
            // Fond du slot
            ctx.fillStyle = i === this.player.selectedSlot ? '#444444' : '#222222';
            ctx.fillRect(x, y, slotSize, slotSize);
    
            // Bordure du slot
            ctx.strokeStyle = i === this.player.selectedSlot ? '#FFD700' : '#666666';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, slotSize, slotSize);
    
            // Dessin de l'item
            if (slot && slot.item) {
                // Item
                const itemSize = slotSize * 0.8;
                const itemX = x + (slotSize - itemSize) / 2;
                const itemY = y + (slotSize - itemSize) / 2;
                
                if (slot.item.texture) {
                    ctx.drawImage(slot.item.texture, itemX, itemY, itemSize, itemSize);
                }
    
                // Quantité
                if (slot.quantity > 1) {
                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 16px Arial';
                    ctx.textAlign = 'right';
                    ctx.fillText(slot.quantity.toString(), x + slotSize - 5, y + slotSize - 5);
                }
            }
        }
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