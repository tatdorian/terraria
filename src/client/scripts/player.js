import TextureLoader from './textures.js';

class Player {
    constructor(name) {
        this.name = name;
        this.x = 0;
        this.y = 0;
        this.velocity = { x: 0, y: 0 };
        this.speed = 5;
        this.gravity = 0.5;
        this.jumping = false;
        this.health = 100;
        this.inventory = [];
        this.facingLeft = false; // Orientation du joueur
    }

    handleInput(e, isKeyDown) {
        switch(e.key) {
            case 'ArrowLeft':
                this.velocity.x = isKeyDown ? -this.speed : 0;
                this.facingLeft = true;
                break;
            case 'ArrowRight':
                this.velocity.x = isKeyDown ? this.speed : 0;
                this.facingLeft = false;
                break;
            case 'Space':
            case 'ArrowUp':
                if (isKeyDown && !this.jumping) {
                    this.velocity.y = -10;
                    this.jumping = true;
                }
                break;
        }
    }

    update(world) {
        // Appliquer la gravité
        this.velocity.y += this.gravity;
    
        // Mettre à jour la position horizontale
        this.x += this.velocity.x;
    
        // Calcul des tuiles sous le joueur
        let tileXStart = Math.floor(this.x / world.tileSize);
        let tileXEnd = Math.floor((this.x + 100) / world.tileSize); // Prendre en compte la largeur du joueur
        let tileY = Math.floor((this.y + 100) / world.tileSize); // Y du bas du joueur
    
        // Vérifier s'il y a un sol sous le joueur
        let onGround = false;
        for (let x = tileXStart; x <= tileXEnd; x++) {
            if (world.tiles[tileY] && world.tiles[tileY][x] !== null) {
                onGround = true;
                break;
            }
        }
    
        if (onGround) {
            // Bloquer le joueur au sol
            this.y = tileY * world.tileSize - 100; // Alignement sur le sol
            this.velocity.y = 0;
            this.jumping = false;
        } else {
            // Mettre à jour la position verticale (tomber)
            this.y += this.velocity.y;
        }
    }
    

    getCurrentTexture() {
        if (this.jumping) {
            return TextureLoader.get('player', 'jump');
        } else if (this.velocity.x !== 0) {
            return TextureLoader.get('player', 'run');
        } else {
            return TextureLoader.get('player', 'idle');
        }
    }

    render(ctx) {
        const texture = this.getCurrentTexture();

        if (texture) {
            ctx.save(); // Sauvegarde le contexte avant transformation

            if (this.facingLeft) {
                ctx.scale(-1, 1); // Retourne horizontalement
                ctx.drawImage(texture, -this.x - 32, this.y, 100, 100);
            } else {
                ctx.drawImage(texture, this.x, this.y, 100, 100);
            }

            ctx.restore(); // Restaure le contexte
        }
    }
}

export default Player;
