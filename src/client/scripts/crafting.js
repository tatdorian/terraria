import Item from './items.js';

export class CraftingSystem {
    constructor(inventory) {
        this.inventory = inventory;
        this.craftMenu = document.querySelector('.craft-menu');
        this.init();
    }

    init() {
        const craftButton = document.getElementById('craft-grass-to-dirt');
        if (craftButton) {
            craftButton.addEventListener('click', () => this.craftDirt());
        }

        setInterval(() => this.updateCraftButtonState(), 100);

        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'c') {
                this.craftMenu.style.display = 
                    this.craftMenu.style.display === 'none' ? 'block' : 'none';
            }
        });

        // Cacher le menu par défaut
        this.craftMenu.style.display = 'none';
    }

    craftDirt() {
        const grassCount = this.inventory.countItem('grass');
        console.log('Current grass count:', grassCount); // Debug

        if (grassCount >= 4) {
            if (this.inventory.removeItems('grass', 4)) {
                const dirtItem = new Item('dirt', 'tiles', 'block');
                this.inventory.addItem(dirtItem);
                console.log('Crafted dirt successfully');
            } else {
                console.log('Failed to remove grass items');
            }
        } else {
            console.log('Not enough grass to craft');
        }
    }

    updateCraftButtonState() {
        const craftButton = document.getElementById('craft-grass-to-dirt');
        if (craftButton) {
            const canCraft = this.inventory.countItem('grass') >= 4;
            craftButton.disabled = !canCraft;
            craftButton.style.backgroundColor = canCraft ? '#4CAF50' : '#666';
        }
    }
}
