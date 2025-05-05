// world.js
import TextureLoader from './textures.js';
import Item from './items.js';

class World {
    constructor() {
        this.tileSize = 32;
        this.tiles = [];
        this.droppedItems = []; // Items that can be picked up
        
        // changed code: charger sons
        this.destroySound = new Audio('/assets/sounds/destroy.mp3');
        this.placeSound = new Audio('/assets/sounds/place.mp3');

        this.generateWorld();
    }

    generateWorld() {
        const width = 1000, height = 24;
        this.tiles = new Array(height).fill(null).map(() => new Array(width).fill(null));

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (y < height / 2) this.tiles[y][x] = null;
                else if (y === height / 2) this.tiles[y][x] = 'grass';
                else if (y < height / 2 + 5) this.tiles[y][x] = 'dirt';
                else this.tiles[y][x] = 'stone';
            }
        }

        // Add a collectable item near player's spawn
        this.droppedItems.push({ x: 2450, y: 300, item: new Item('stone') });
    }

    handleClick(x, y, isRightClick) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);

        if (tileY >= 0 && tileY < this.tiles.length && tileX >= 0 && tileX < this.tiles[0].length) {
            if (isRightClick) {
                // Placer un bloc (clic droit)
                if (this.tiles[tileY][tileX] === null) {
                    // Vérifier si le joueur a le bloc sélectionné dans son inventaire
                    // Cette partie devrait être connectée au système d'inventaire
                    this.tiles[tileY][tileX] = 'dirt'; // Placeholder pour le bloc sélectionné
                    
                    // changed code: jouer son
                    this.placeSound.play();
                    
                    // Ici, vous devriez diminuer la quantité dans l'inventaire
                    // player.useSelectedBlock()
                }
            } else {
                // Détruire un bloc (clic gauche)
                if (this.tiles[tileY][tileX] !== null) {
                    const blockType = this.tiles[tileY][tileX];
                    this.tiles[tileY][tileX] = null;
                    
                    // changed code: jouer son
                    this.destroySound.play();
                    
                    // Créer un objet à ramasser
                    this.droppedItems.push({
                        x: tileX * this.tileSize,
                        y: tileY * this.tileSize,
                        item: new Item(blockType)
                    });
                }
            }
        }
    }

    isSolid(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        
        // Check bounds
        if (tileY < 0 || tileY >= this.tiles.length || tileX < 0 || tileX >= this.tiles[0].length) {
            return false;
        }
        
        return this.tiles[tileY][tileX] !== null;
    }

    update(player) {
        // Check for item pickups if player is provided
        if (player) {
            this.droppedItems = this.droppedItems.filter(drop => {
                const dx = Math.abs(player.x + 50 - drop.x);
                const dy = Math.abs(player.y + 50 - drop.y);
                if (dx < 40 && dy < 40) {
                    player.pickUp(drop.item);
                    return false; // Remove the item
                }
                return true; // Keep the item
            });
        }
    }

    render(ctx) {
        // Only render tiles that are on screen (optimization)
        const cameraX = ctx.getTransform().e;
        const cameraY = ctx.getTransform().f;
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        
        const startX = Math.max(0, Math.floor(-cameraX / this.tileSize));
        const endX = Math.min(this.tiles[0].length, Math.ceil((-cameraX + canvasWidth) / this.tileSize) + 1);
        const startY = Math.max(0, Math.floor(-cameraY / this.tileSize));
        const endY = Math.min(this.tiles.length, Math.ceil((-cameraY + canvasHeight) / this.tileSize) + 1);
        
        // Render tiles
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const tile = this.tiles[y][x];
                if (tile) {
                    const texture = TextureLoader.get('tiles', tile);
                    if (texture) {
                        ctx.drawImage(texture, x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                    }
                }
            }
        }

        // Render dropped items
        this.droppedItems.forEach(drop => {
            if (drop.item && drop.item.texture) {
                ctx.drawImage(drop.item.texture, drop.x, drop.y, this.tileSize, this.tileSize);
            }
        });
    }
}

export default World;