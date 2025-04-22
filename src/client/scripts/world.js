import TextureLoader from './textures.js';

class World {
    constructor() {
        this.tileSize = 32;
        this.tiles = [];
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
    }

    handleClick(x, y, isRightClick) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);

        if (tileY >= 0 && tileY < this.tiles.length && tileX >= 0 && tileX < this.tiles[0].length) {
            this.tiles[tileY][tileX] = isRightClick ? 'dirt' : null;
        }
    }

    isSolid(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        return this.tiles[tileY]?.[tileX] !== null;
    }

    update() {}

    render(ctx) {
        this.tiles.forEach((row, y) => row.forEach((tile, x) => {
            if (tile) ctx.drawImage(TextureLoader.get('tiles', tile), x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
        }));
    }
}

export default World;
