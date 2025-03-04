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
        
        // Mettre à jour la position
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Gestion des collisions avec le sol
        if (this.y > 300) { 
            this.y = 300;
            this.velocity.y = 0;
            this.jumping = false;
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
