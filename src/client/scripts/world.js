// world.js
import TextureLoader from './textures.js';
import Item from './items.js';
import ItemDatabase from './utils.js';

class World {
    constructor() {
        this.tileSize = 32;
        this.tiles = [];
        this.droppedItems = []; // Items that can be picked up

        // Initialisation des sons avec gestion des erreurs
        this.destroySound = null;
        this.placeSound = null;
        
        try {
            // this.destroySound = new Audio('/assets/sounds/destroy.mp3');
            // this.placeSound = new Audio('/assets/sounds/place.mp3');
            
            // Précharger les sons
            this.destroySound.load();
            this.placeSound.load();
        } catch (error) {
            console.warn("Impossible de charger les sons:", error);
        }

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

        // Add a collectable item near player's spawn
        this.droppedItems.push({ x: 2450, y: 300, item: new Item('stone') });
    }

    // Méthode améliorée pour gérer les clics sur les blocs
    handleClick(x, y, isRightClick, player) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);

        // S'assurer que la position est dans les limites du monde
        if (tileY < 0 || tileY >= this.tiles.length || tileX < 0 || tileX >= this.tiles[0].length) {
            console.log(`Position hors limites: ${tileX}, ${tileY}`);
            return false;
        }

        if (isRightClick) {
            // Placer un bloc (clic droit)
            if (this.tiles[tileY][tileX] === null && player) {
                // Vérifier si le joueur a un bloc sélectionné dans son inventaire
                const selectedItem = player.inventory[player.selectedSlot];

                if (selectedItem && selectedItem.item_type === 'block') {
                    // Placer le bloc seulement si le joueur a le bloc sélectionné
                    this.tiles[tileY][tileX] = selectedItem.name;

                    // Jouer le son de placement
                    this.playSound(this.placeSound);

                    // Diminuer la quantité dans l'inventaire
                    if (selectedItem.quantity > 1) {
                        selectedItem.quantity--;
                    } else {
                        player.inventory[player.selectedSlot] = null;
                    }

                    console.log(`Bloc ${selectedItem.name} placé en ${tileX}, ${tileY}`);
                    return true;
                } else {
                    console.log("Pas de bloc sélectionné dans l'inventaire");
                }
            }
        } else {
            // Détruire un bloc (clic gauche)
            const blockType = this.tiles[tileY][tileX];
            if (blockType !== null) {
                console.log(`Tentative de destruction du bloc ${blockType} en ${tileX}, ${tileY}`);
                
                // Vérifier si le joueur a une pioche pour les blocs de pierre
                let canDestroy = true;

                // Si c'est de la pierre, vérifier que le joueur a une pioche sélectionnée
                if (blockType === 'stone' && player) {
                    const selectedItem = player.inventory[player.selectedSlot];
                    if (!selectedItem || selectedItem.item_type !== 'tool' || selectedItem.name !== 'pickaxe') {
                        console.log("Vous avez besoin d'une pioche pour miner de la pierre!");
                        canDestroy = false;
                    }
                }

                if (canDestroy) {
                    // Détruire le bloc
                    this.tiles[tileY][tileX] = null;

                    // Jouer le son de destruction
                    this.playSound(this.destroySound);

                    // Enregistrer le bloc détruit dans la BDD
                    try {
                        ItemDatabase.addDestroyedItem(blockType);
                    } catch (error) {
                        console.warn("Impossible d'enregistrer le bloc détruit dans la BDD:", error);
                    }

                    // Créer un objet à ramasser
                    this.droppedItems.push({
                        x: tileX * this.tileSize,
                        y: tileY * this.tileSize,
                        item: new Item(blockType)
                    });

                    console.log(`Bloc ${blockType} détruit en ${tileX}, ${tileY}`);
                    return true;
                }
            }
        }
        return false;
    }

    // Méthode utilitaire pour jouer un son avec gestion des erreurs
    playSound(sound) {
        if (sound) {
            try {
                // Réinitialiser le son avant de le jouer pour permettre des clics rapides
                sound.pause();
                sound.currentTime = 0;
                
                sound.play().catch(err => {
                    console.warn("Erreur lors de la lecture du son:", err);
                });
            } catch (error) {
                console.warn("Erreur lors de la lecture du son:", error);
            }
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

    update(player) {
        // Check for item pickups if player is provided
        if (player) {
            // Copier le tableau avant de le filtrer pour éviter les problèmes de modification pendant l'itération
            const itemsToRemove = [];
            
            this.droppedItems.forEach((drop, index) => {
                const dx = Math.abs(player.x + 50 - drop.x);
                const dy = Math.abs(player.y + 50 - drop.y);
                
                if (dx < 40 && dy < 40) {
                    if (player.pickUp(drop.item)) {
                        itemsToRemove.push(index);
                    }
                }
            });
            
            // Supprimer les items ramassés en ordre décroissant pour ne pas affecter les indices
            for (let i = itemsToRemove.length - 1; i >= 0; i--) {
                this.droppedItems.splice(itemsToRemove[i], 1);
            }
        }
    }

    render(ctx) {
        // Only render tiles that are on screen (optimization)
        const cameraX = ctx.getTransform().e;
        const cameraY = ctx.getTransform().f;
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;

        const startX = Math.max(0, Math.floor(-cameraX / this.tileSize));
        const endX = Math.min(this.tiles[0].length, Math.ceil((-cameraX + canvasWidth) / this.tileSize) + 1);
        const startY = Math.max(0, Math.floor(-cameraY / this.tileSize));
        const endY = Math.min(this.tiles.length, Math.ceil((-cameraY + canvasHeight) / this.tileSize) + 1);

        // Render tiles
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const tile = this.tiles[y][x];
                if (tile) {
                    const texture = TextureLoader.get('tiles', tile);
                    if (texture) {
                        ctx.drawImage(texture, x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                    }
                }
            }
        }

        // Render dropped items
        this.droppedItems.forEach(drop => {
            if (drop.item && drop.item.texture) {
                ctx.drawImage(drop.item.texture, drop.x, drop.y, this.tileSize, this.tileSize);
            }
        });
    }
}

export default World;