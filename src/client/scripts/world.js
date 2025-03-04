import TextureLoader from './textures.js';

class World {
    constructor() {
        this.tileSize = 32; // Size of each tile in pixels
        this.tiles = [];
        this.generateWorld();
    }

    generateWorld() {
        // Create a simple test world (100x100 tiles)
        const width = 5000;
        const height = 24;
        
        // Initialize empty world
        this.tiles = new Array(height).fill(null).map(() => 
            new Array(width).fill(null)
        );

        // Generate terrain
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (y < height / 2) {
                    // Air
                    this.tiles[y][x] = null;
                } else if (y === height / 2) {
                    // Grass
                    this.tiles[y][x] = 'grass';
                } else if (y < height / 2 + 5) {
                    // Dirt
                    this.tiles[y][x] = 'dirt';
                } else {
                    // Stone
                    this.tiles[y][x] = 'stone';
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

    render(ctx, camera = { x: 0, y: 0 }) {
        // Only render tiles that are visible on screen
        const screenWidth = ctx.canvas.width;
        const screenHeight = ctx.canvas.height;

        const startX = Math.max(0, Math.floor(camera.x / this.tileSize));
        const startY = Math.max(0, Math.floor(camera.y / this.tileSize));
        const endX = Math.min(this.tiles[0].length, Math.ceil((camera.x + screenWidth) / this.tileSize));
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