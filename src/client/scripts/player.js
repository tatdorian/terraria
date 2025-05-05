// player.js
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
        this.facingLeft = false;

        // Movement control flags to handle multiple key presses
        this.movingLeft = false;
        this.movingRight = false;

        // Inventory system
        this.inventory = new Array(10).fill(null);
        this.selectedSlot = 0;
        this.inventoryOpen = false;
    }

    pickUp(item) {
        // Chercher d'abord un emplacement avec le même type d'objet (pour empiler)
        const sameItemIndex = this.inventory.findIndex(slot =>
            slot !== null &&
            slot.name === item.name &&
            slot.quantity < 99  // Limite de stack à 99
        );

        if (sameItemIndex !== -1) {
            // Empiler l'objet
            if (!this.inventory[sameItemIndex].quantity) {
                this.inventory[sameItemIndex].quantity = 1;
            }
            this.inventory[sameItemIndex].quantity += 1;
            console.log(`Empilé: ${item.name} (${this.inventory[sameItemIndex].quantity})`);
            return true;
        }

        // Sinon, chercher un emplacement vide
        const emptyIndex = this.inventory.findIndex(slot => slot === null);
        if (emptyIndex !== -1) {
            // Ajouter l'objet à l'inventaire
            this.inventory[emptyIndex] = item;
            // Initialiser la quantité si c'est un objet empilable
            if (item.item_type === 'block' || item.item_type === 'consumable') {
                item.quantity = 1;
            }
            console.log(`Ramassé: ${item.name}`);
            return true;
        } else {
            console.log("Inventaire plein!");
            return false;
        }
    }

    replaceItem(slotIndex, item) {
        if (slotIndex >= 0 && slotIndex < this.inventory.length) {
            const oldItem = this.inventory[slotIndex];
            this.inventory[slotIndex] = item;
            console.log(`Remplacé: ${oldItem ? oldItem.name : 'vide'} par ${item.name}`);
            return oldItem; // Retourne l'ancien objet pour éventuellement le déposer
        }
        return null;
    }

    handleInput(e, isKeyDown) {
        switch (e.key.toLowerCase()) {
            // Left movement - both A and arrow left
            case 'arrowleft':
            case 'a':
            case 'q': // Support for AZERTY keyboards
                this.movingLeft = isKeyDown;
                if (isKeyDown) this.facingLeft = true;
                this.updateHorizontalVelocity();
                break;
                
            // Right movement - both D and arrow right
            case 'arrowright':
            case 'd':
                this.movingRight = isKeyDown;
                if (isKeyDown) this.facingLeft = false;
                this.updateHorizontalVelocity();
                break;
                
            // Jump - Space, W, Z and arrow up
            case ' ':
            case 'space':
            case 'arrowup':
            case 'w':
            case 'z': // Support for AZERTY keyboards
                if (isKeyDown && !this.jumping) {
                    this.velocity.y = -10;
                    this.jumping = true;
                }
                break;
                
            case 'tab':
                if (isKeyDown) {
                    this.inventoryOpen = !this.inventoryOpen;
                    e.preventDefault();
                }
                break;
                
            case 'enter':
                if (isKeyDown) {
                    this.useSelectedItem();
                }
                break;
                
            // Hotbar selection
            case '1': case '2': case '3': case '4':
            case '5': case '6': case '7': case '8':
            case '9': case '0':
                if (isKeyDown) {
                    const num = e.key === '0' ? 9 : parseInt(e.key) - 1;
                    this.selectedSlot = num;
                }
                break;
                
            case 'r':
                if (isKeyDown) {
                    // Ramasser un objet au sol
                    console.log("Touche R pressée pour ramasser");
                }
                break;
        }
    }

    // New method to handle velocity updates when multiple keys are pressed
    updateHorizontalVelocity() {
        if (this.movingLeft && this.movingRight) {
            // If both left and right are pressed, prioritize the most recent one
            this.velocity.x = this.facingLeft ? -this.speed : this.speed;
        } else if (this.movingLeft) {
            this.velocity.x = -this.speed;
        } else if (this.movingRight) {
            this.velocity.x = this.speed;
        } else {
            this.velocity.x = 0;
        }
    }

    useSelectedItem() {
        const selectedItem = this.inventory[this.selectedSlot];
        if (!selectedItem) return;

        console.log(`Used: ${selectedItem.name} (${selectedItem.item_type})`);

        // Remove consumable items after use
        if (selectedItem.item_type === 'consumable') {
            if (selectedItem.quantity > 1) {
                selectedItem.quantity--;
            } else {
                this.inventory[this.selectedSlot] = null;
            }
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
                ctx.translate(this.x + 50, this.y); // Half of player width (100/2)
                ctx.scale(-1, 1);
                ctx.drawImage(texture, -50, 0, 100, 100);
            } else {
                ctx.drawImage(texture, this.x, this.y, 100, 100);
            }
            ctx.restore();
        }
    }
}

export default Player;