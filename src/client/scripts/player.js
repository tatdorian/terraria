// player.js
import TextureLoader from './textures.js';
import Inventory from './inventory.js';

class Player {
    constructor(name) {
        this.name = name;
        this.x = 0;
        this.y = 0;
        this.width = 32;
        this.height = 48;
        this.velocity = { x: 0, y: 0 };
        this.speed = 5;
        this.gravity = 0.5;
        this.jumping = false;
        this.health = 100;
        this.facingLeft = false;

        // Inventory system
        this.inventory = new Inventory(10);
        this.selectedSlot = 0;
        this.inventoryOpen = false;
    }

    pickUp(item) {
        return this.inventory.addItem(item);
    }

    replaceItem(slotIndex, item) {
        return this.inventory.swapItem(slotIndex, item);
    }

    handleInput(e, isKeyDown) {
        switch (e.key) {
            case 'ArrowLeft':
            case 'q':
            case 'Q':
                this.velocity.x = isKeyDown ? -this.speed : 0;
                if (isKeyDown) this.facingLeft = true;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.velocity.x = isKeyDown ? this.speed : 0;
                if (isKeyDown) this.facingLeft = false;
                break;
            case ' ':
            case 'Space':
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (isKeyDown && !this.jumping) {
                    this.velocity.y = -10;
                    this.jumping = true;
                }
                break;
            case 'Tab':
                if (isKeyDown) {
                    this.inventoryOpen = !this.inventoryOpen;
                    e.preventDefault();
                }
                break;
            case 'Enter':
                if (isKeyDown) {
                    this.useSelectedItem();
                }
                break;
            case '1': case '2': case '3': case '4':
            case '5': case '6': case '7': case '8':
            case '9': case '0':
                if (isKeyDown) {
                    const num = e.key === '0' ? 9 : parseInt(e.key) - 1;
                    this.selectedSlot = num;
                }
                break;
        }
    }

    useSelectedItem() {
        const selectedItem = this.inventory.getItem(this.selectedSlot);
        if (!selectedItem) return;

        console.log(`Used: ${selectedItem.name} (${selectedItem.item_type})`);

        // Remove consumable items after use
        if (selectedItem.item_type === 'consumable') {
            if (selectedItem.quantity > 1) {
                selectedItem.quantity--;
            } else {
                this.inventory.removeItem(this.selectedSlot);
            }
        }
    }

    update(world) {
        const maxFallSpeed = 15;
        this.velocity.y = Math.min(this.velocity.y + this.gravity, maxFallSpeed);

        const newX = this.x + this.velocity.x;
        const playerWidth = 50; // Moitié de la largeur du joueur

        const topLeft = world.isSolid(newX, this.y + 10);
        const topRight = world.isSolid(newX + playerWidth * 2 - 10, this.y + 10);
        const bottomLeft = world.isSolid(newX, this.y + 90);
        const bottomRight = world.isSolid(newX + playerWidth * 2 - 10, this.y + 90);

        if (!(this.velocity.x < 0 && (topLeft || bottomLeft)) &&
            !(this.velocity.x > 0 && (topRight || bottomRight))) {
            this.x = newX;
        } else {
            this.velocity.x = 0;
        }

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
                ctx.translate(this.x + 50, this.y);
                ctx.scale(-1, 1);
                ctx.drawImage(texture, -50, 0, 100, 100);
            } else {
                ctx.drawImage(texture, this.x, this.y, 100, 100);
            }

            // Draw username above player
            ctx.restore();
            ctx.save();
            ctx.font = '16px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 3;
            const nameX = this.x + 50;
            const nameY = this.y - 10;
            ctx.strokeText(this.name, nameX, nameY);
            ctx.fillText(this.name, nameX, nameY);
            ctx.restore();
        }
    }
}

export default Player;