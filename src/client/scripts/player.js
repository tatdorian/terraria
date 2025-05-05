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
                    this.velocity.y = -15;
                    this.jumping = true;
                }
                break;
        }
    }

    update(world) {
        // Appliquer la gravité (avec une limite de vitesse de chute)
        const maxFallSpeed = 15;
        this.velocity.y = Math.min(this.velocity.y + this.gravity, maxFallSpeed);

        // Vérifier les collisions horizontales
        const newX = this.x + this.velocity.x;
        const playerWidth = 50; // Moitié de la largeur du joueur
        
        // Vérifier les collisions aux quatre coins du joueur
        const topLeft = world.isSolid(newX, this.y + 10);
        const topRight = world.isSolid(newX + playerWidth * 2 - 10, this.y + 10);
        const bottomLeft = world.isSolid(newX, this.y + 90);
        const bottomRight = world.isSolid(newX + playerWidth * 2 - 10, this.y + 90);
        
        // S'il n'y a pas de collision horizontale, appliquer le mouvement
        if (!(this.velocity.x < 0 && (topLeft || bottomLeft)) && 
            !(this.velocity.x > 0 && (topRight || bottomRight))) {
            this.x = newX;
        } else {
            // Arrêter le mouvement horizontal en cas de collision
            this.velocity.x = 0;
        }

        // Vérifier les collisions verticales
        const feetY = this.y + 100; // Bas du joueur
        const headY = this.y; // Haut du joueur
        
        // Collision avec le sol
        let isOnGround = world.isSolid(this.x + playerWidth, feetY) || 
                        world.isSolid(this.x + playerWidth * 2 - 10, feetY);
        
        // Collision avec le plafond
        let hitHead = world.isSolid(this.x + playerWidth, headY + this.velocity.y) || 
                     world.isSolid(this.x + playerWidth * 2 - 10, headY + this.velocity.y);
                     
        // Gérer les collisions verticales
        if (this.velocity.y > 0) { // Chute
            if (isOnGround) {
                // Snapping au sol (avec un petit ajustement pour éviter les tremblements)
                const tileY = Math.floor(feetY / world.tileSize);
                this.y = tileY * world.tileSize - 100;
                this.velocity.y = 0;
                this.jumping = false;
            } else {
                // Continuer à tomber
                this.y += this.velocity.y;
            }
        } else if (this.velocity.y < 0) { // Saut
            if (hitHead) {
                // Collision avec le plafond
                this.velocity.y = 0;
            }
            this.y += this.velocity.y;
        }

        // Vérifier si le joueur est maintenant sur le sol après son mouvement
        isOnGround = world.isSolid(this.x + playerWidth, this.y + 100) || 
                    world.isSolid(this.x + playerWidth * 2 - 10, this.y + 100);
        
        if (isOnGround && this.velocity.y >= 0) {
            this.jumping = false;
        }

        // Réinitialiser le joueur s'il tombe trop bas
        if (this.y > 2000) {
            this.respawn();
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
