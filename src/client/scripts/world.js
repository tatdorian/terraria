import TextureLoader from './textures.js';

class World {
    constructor() {
        this.tileSize = 32; // Size of each tile in pixels
        this.tiles = [];
        this.generateWorld();
    }

    generateWorld() {
        const width = 1000;
        const height = 24;
        const groundLevelBase = Math.floor(height / 2); // Niveau de base
    
        // Initialize empty world
        this.tiles = new Array(height).fill(null).map(() =>
            new Array(width).fill(null)
        );
    
        // Crée une "height map" (carte d'altitude) pour le sol
        const groundHeights = [];
        let currentHeight = groundLevelBase;
    
        for (let x = 0; x < width; x++) {
            // Variation aléatoire (-1, 0, +1)
            const delta = Math.floor(Math.random() * 3) - 1;
    
            // Appliquer variation en limitant la pente (évite falaises)
            currentHeight += delta;
            currentHeight = Math.max(groundLevelBase - 4, Math.min(groundLevelBase + 4, currentHeight)); // Montagnes max +/-4 blocs
    
            groundHeights.push(currentHeight);
        }
    
        // Remplir le monde selon la height map
        for (let x = 0; x < width; x++) {
            const groundY = groundHeights[x];
    
            for (let y = 0; y < height; y++) {
                if (y < groundY) {
                    // Air
                    this.tiles[y][x] = null;
                } else if (y === groundY) {
                    // Herbe
                    this.tiles[y][x] = 'grass';
                } else if (y < groundY + 8) {
                    // Terre
                    this.tiles[y][x] = 'dirt';
                } else if (y < groundY + 12) {
                    // Pierre
                    this.tiles[y][x] = 'stone';
                } else {
                    // Pierre
                    this.tiles[y][x] = 'stone';
                }
            }
        }
    
        // Remplir les trous d'eau (si trou profond < groundLevelBase + 2)
        const waterLevel = groundLevelBase + 3; // Niveau de l'eau (bas)
        for (let x = 0; x < width; x++) {
            const groundY = groundHeights[x];
            if (groundY > waterLevel) { // Trou profond
                for (let y = waterLevel; y < groundY; y++) {
                    this.tiles[y][x] = 'water';
                }
            }
        }
    }
    

    handleClick(x, y, isRightClick) {
        // Convert screen coordinates to tile coordinates
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);

        if (isRightClick) {
            // Place tile
            this.tiles[tileY][tileX] = 'dirt';
        } else {
            // Remove tile
            this.tiles[tileY][tileX] = null;
        }
    }

    update() {
        // Add any world update logic here
    }

    render(ctx, camera = { x: 0 , y: 0 }) {
        // Only render tiles that are visible on screen
        const screenWidth = ctx.canvas.width;
        const screenHeight = ctx.canvas.height;

        const startX = Math.max(0, Math.floor(camera.x / this.tileSize));
        const startY = Math.max(0, Math.floor(camera.y / this.tileSize));
        const endX = Math.min(this.tiles[0].length, Math.ceil((camera.x + screenWidth) / this.tileSize)*100);
        const endY = Math.min(this.tiles.length, Math.ceil((camera.y + screenHeight) / this.tileSize));

        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const tile = this.tiles[y][x];
                if (tile) {
                    const texture = TextureLoader.get('tiles', tile);
                    if (texture) {
                        ctx.drawImage(
                            texture,
                            x * this.tileSize - camera.x,
                            y * this.tileSize - camera.y,
                            this.tileSize,
                            this.tileSize
                        );
                    }
                }
            }
        }
    }
}

export default World;