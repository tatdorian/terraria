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
        const promises = [];
        for (const category in TEXTURES) {
            for (const name in TEXTURES[category]) {
                promises.push(this.loadTexture(category, name, TEXTURES[category][name]));
            }
        }
        await Promise.all(promises);
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
            img.onerror = reject;
            img.src = path;
        });
    }

    get(category, name) {
        return this.loadedTextures[category]?.[name];
    }
}

export default new TextureLoader();