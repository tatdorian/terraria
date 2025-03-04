// This file contains the logic for player interactions, including movement and actions within the game.

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
    }

    handleInput(e, isKeyDown) {
        switch(e.key) {
            case 'ArrowLeft':
                this.velocity.x = isKeyDown ? -this.speed : 0;
                break;
            case 'ArrowRight':
                this.velocity.x = isKeyDown ? this.speed : 0;
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
        // Apply gravity
        this.velocity.y += this.gravity;
        
        // Update position
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Simple ground collision
        if (this.y > 300) { // Temporary ground level
            this.y = 300;
            this.velocity.y = 0;
            this.jumping = false;
        }
    }

    render(ctx) {
        // Draw player
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, 32, 32);
    }
}

export default Player;