// textures.js
const TEXTURES = {
    tiles: {
        dirt: '/assets/tiles/dirt.png',
        grass: '/assets/tiles/grass.png',
        stone: '/assets/tiles/stone.png'
    },
    player: {
        idle: '/assets/player/idle.png',
        jump: '/assets/player/jump.png',
        run: '/assets/player/run.png'
    }
};

class TextureLoader {
    constructor() {
        this.loadedTextures = {};
    }
    
    async loadAll() {
        console.log('Loading all textures...');
        const promises = [];
        for (const category in TEXTURES) {
            for (const name in TEXTURES[category]) {
                promises.push(this.loadTexture(category, name, TEXTURES[category][name]));
            }
        }
        await Promise.all(promises);
        console.log('All textures loaded successfully');
    }
    
    async loadTexture(category, name, path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                if (!this.loadedTextures[category]) {
                    this.loadedTextures[category] = {};
                }
                this.loadedTextures[category][name] = img;
                resolve();
            };
            img.onerror = (e) => {
                console.error(`Failed to load texture: ${path}`, e);
                reject(e);
            };
            img.src = path;
        });
    }
    
    get(category, name) {
        return this.loadedTextures[category]?.[name];
    }
}

export default new TextureLoader();