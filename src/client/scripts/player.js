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
        this.facingLeft = false;
    }

    handleInput(e, isKeyDown) {
        switch (e.key) {
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
        this.velocity.y += this.gravity;

        this.x += this.velocity.x;

        let isOnGround = world.isSolid(this.x, this.y + this.velocity.y + this.gravity);
        if (!isOnGround) {
            this.y += this.velocity.y;
        } else {
            this.y = Math.floor(this.y / world.tileSize) * world.tileSize;
            this.velocity.y = 0;
            this.jumping = false;
        }

        if (this.y > 2000) {
            this.respawn();
        }
    }

    respawn() {
        this.x = 2400;
        this.y = 0;
        this.velocity.y = 0;
        this.jumping = false;
    }

    getCurrentTexture() {
        if (this.jumping) return TextureLoader.get('player', 'jump');
        if (this.velocity.x !== 0) return TextureLoader.get('player', 'run');
        return TextureLoader.get('player', 'idle');
    }

    render(ctx) {
        const texture = this.getCurrentTexture();
        if (texture) {
            ctx.save();
            if (this.facingLeft) {
                ctx.translate(this.x + 32, this.y);
                ctx.scale(-1, 1);
                ctx.drawImage(texture, -32, 0, 100, 100);
            } else {
                ctx.drawImage(texture, this.x, this.y, 100, 100);
            }
            ctx.restore();
        }
    }
}

export default Player;
