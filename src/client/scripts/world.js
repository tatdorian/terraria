// world.js
import TextureLoader from './textures.js';
import Item from './items.js';

class World {
    constructor() {
        this.tileSize = 32;
        this.chunkSize = 16; // 16x16 tiles per chunk
        this.chunks = new Map(); // Map de chunks avec clé "x,y"
        this.droppedItems = [];
        this.seed = Math.random() * 10000; // Seed pour la génération procédurale
        this.player = null;
        this.itemPickupRadius = 40; // Rayon de ramassage des items
    }

    generateChunk(chunkX, chunkY) {
        const chunk = new Array(this.chunkSize).fill(null)
            .map(() => new Array(this.chunkSize).fill(null));

        for (let y = 0; y < this.chunkSize; y++) {
            for (let x = 0; x < this.chunkSize; x++) {
                const worldX = chunkX * this.chunkSize + x;
                const worldY = chunkY * this.chunkSize + y;
                
                // Génération procédurale simple avec noise
                const height = Math.sin(worldX * 0.1 + this.seed) * 5 + 10;
                
                if (worldY > height) {
                    if (worldY === Math.floor(height) + 1) {
                        chunk[y][x] = 'grass';
                    } else if (worldY < height + 5) {
                        chunk[y][x] = 'dirt';
                    } else {
                        chunk[y][x] = 'stone';
                    }
                }
            }
        }
        
        return chunk;
    }

    getChunk(chunkX, chunkY) {
        const key = `${chunkX},${chunkY}`;
        if (!this.chunks.has(key)) {
            this.chunks.set(key, this.generateChunk(chunkX, chunkY));
        }
        return this.chunks.get(key);
    }

    getTile(worldX, worldY) {
        const chunkX = Math.floor(worldX / this.chunkSize);
        const chunkY = Math.floor(worldY / this.chunkSize);
        const localX = ((worldX % this.chunkSize) + this.chunkSize) % this.chunkSize;
        const localY = ((worldY % this.chunkSize) + this.chunkSize) % this.chunkSize;
        
        const chunk = this.getChunk(chunkX, chunkY);
        return chunk ? chunk[localY][localX] : null;
    }

    setTile(worldX, worldY, value) {
        const chunkX = Math.floor(worldX / this.chunkSize);
        const chunkY = Math.floor(worldY / this.chunkSize);
        const localX = ((worldX % this.chunkSize) + this.chunkSize) % this.chunkSize;
        const localY = ((worldY % this.chunkSize) + this.chunkSize) % this.chunkSize;
        
        let chunk = this.getChunk(chunkX, chunkY);
        if (chunk) {
            chunk[localY][localX] = value;
        }
    }

    update(deltaTime) {
        if (!this.player) return;

        this.droppedItems = this.droppedItems.filter(drop => {
            // Gravité
            if (!this.isSolid(drop.x, drop.y + this.tileSize)) {
                drop.y += 5;
            }

            // Calculer le centre du joueur et de l'item
            const playerCenterX = this.player.x + this.player.width / 2;
            const playerCenterY = this.player.y + this.player.height / 2;
            const itemCenterX = drop.x + this.tileSize / 2;
            const itemCenterY = drop.y + this.tileSize / 2;

            // Calculer la distance
            const dx = playerCenterX - itemCenterX;
            const dy = playerCenterY - itemCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Si l'item est proche du joueur, l'attirer
            if (distance < this.itemPickupRadius) {
                const speed = 5;
                const angle = Math.atan2(dy, dx);
                drop.x += Math.cos(angle) * speed;
                drop.y += Math.sin(angle) * speed;

                // Si très proche, essayer de ramasser
                if (distance < 20) {
                    console.log('Attempting to pick up item:', drop.item); // Debug log
                    if (this.player.inventory.addItem(drop.item)) {
                        console.log('Item picked up successfully'); // Debug log
                        return false; // Supprimer l'item
                    }
                }
            }

            return true;
        });
    }

    collectNearbyItems(player) {
        const collectRadius = 100; // Rayon de collecte en pixels
        
        this.droppedItems = this.droppedItems.filter(drop => {
            // Calculer la distance entre le joueur et l'item
            const dx = (player.x + player.width/2) - (drop.x + this.tileSize/2);
            const dy = (player.y + player.height/2) - (drop.y + this.tileSize/2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Si l'item est assez proche, essayer de l'ajouter à l'inventaire
            if (distance <= collectRadius) {
                if (player.inventory.addItem(drop.item)) {
                    return false; // Supprimer l'item s'il a été ramassé
                }
            }
            return true; // Garder l'item s'il n'a pas été ramassé
        });
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    handleClick(x, y, isRightClick) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);

        if (isRightClick) {
            if (this.getTile(tileX, tileY) === null) {
                const selectedSlot = this.player.inventory.slots[this.player.selectedSlot];
                if (selectedSlot.item && selectedSlot.quantity > 0) {
                    this.setTile(tileX, tileY, selectedSlot.item.type);
                    selectedSlot.quantity--;
                    if (selectedSlot.quantity <= 0) {
                        selectedSlot.item = null;
                    }
                }
            }
        } else {
            const blockType = this.getTile(tileX, tileY);
            if (blockType !== null) {
                this.setTile(tileX, tileY, null);
                this.droppedItems.push({
                    x: tileX * this.tileSize,
                    y: tileY * this.tileSize,
                    item: new Item(blockType)
                });
            }
        }
    }

    setPlayer(player) {
        this.player = player;
    }

    checkPlayerItemCollision(drop) {
        const playerBounds = this.player.getBounds();
        const itemBounds = {
            x: drop.x,
            y: drop.y,
            width: this.tileSize,
            height: this.tileSize
        };

        return playerBounds.x < itemBounds.x + itemBounds.width &&
               playerBounds.x + playerBounds.width > itemBounds.x &&
               playerBounds.y < itemBounds.y + itemBounds.height &&
               playerBounds.y + playerBounds.height > itemBounds.y;
    }

    isSolid(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        return this.getTile(tileX, tileY) !== null;
    }

    render(ctx) {
        const cameraX = -ctx.getTransform().e;
        const cameraY = -ctx.getTransform().f;
        
        // Calculate visible chunks based on camera position
        const startChunkX = Math.floor(cameraX / (this.tileSize * this.chunkSize)) - 1;
        const startChunkY = Math.floor(cameraY / (this.tileSize * this.chunkSize)) - 1;
        const endChunkX = startChunkX + Math.ceil(ctx.canvas.width / (this.tileSize * this.chunkSize)) + 2;
        const endChunkY = startChunkY + Math.ceil(ctx.canvas.height / (this.tileSize * this.chunkSize)) + 2;

        // Clear the canvas first
        ctx.clearRect(cameraX, cameraY, ctx.canvas.width, ctx.canvas.height);

        // Render visible chunks
        for (let chunkY = startChunkY; chunkY <= endChunkY; chunkY++) {
            for (let chunkX = startChunkX; chunkX <= endChunkX; chunkX++) {
                const chunk = this.getChunk(chunkX, chunkY);
                if (chunk) {
                    this.renderChunk(ctx, chunk, chunkX, chunkY);
                }
            }
        }

        // Render dropped items with culling
        this.droppedItems = this.droppedItems.filter(drop => {
            if (drop.item && drop.item.texture &&
                drop.x >= cameraX - this.tileSize &&
                drop.x <= cameraX + ctx.canvas.width + this.tileSize &&
                drop.y >= cameraY - this.tileSize &&
                drop.y <= cameraY + ctx.canvas.height + this.tileSize) {
                ctx.drawImage(drop.item.texture, drop.x, drop.y, this.tileSize, this.tileSize);
                return true;
            }
            return false;
        });
    }

    renderChunk(ctx, chunk, chunkX, chunkY) {
        const screenX = chunkX * this.chunkSize * this.tileSize;
        const screenY = chunkY * this.chunkSize * this.tileSize;
        
        // Only render if chunk is visible
        if (screenX + this.chunkSize * this.tileSize < -ctx.getTransform().e || 
            screenX > -ctx.getTransform().e + ctx.canvas.width ||
            screenY + this.chunkSize * this.tileSize < -ctx.getTransform().f || 
            screenY > -ctx.getTransform().f + ctx.canvas.height) {
            return;
        }

        for (let y = 0; y < this.chunkSize; y++) {
            for (let x = 0; x < this.chunkSize; x++) {
                const tile = chunk[y][x];
                if (tile) {
                    const worldX = screenX + x * this.tileSize;
                    const worldY = screenY + y * this.tileSize;
                    const texture = TextureLoader.get('tiles', tile);
                    if (texture) {
                        ctx.drawImage(texture, worldX, worldY, this.tileSize, this.tileSize);
                    }
                }
            }
        }
    }
}

export default World;