// item.js
import TextureLoader from './textures.js';

export default class Item {
    constructor(name, category = 'tiles', item_type = 'block') {
        this.name = name;
        
        // Déterminer automatiquement la catégorie et le type en fonction du nom
        if (name === 'pickaxe') {
            category = 'player';
            item_type = 'tool';
        } else if (['dirt', 'grass', 'stone'].includes(name)) {
            category = 'tiles';
            item_type = 'block';
        }
        
        this.category = category;
        this.item_type = item_type;
        
        // Récupérer la texture appropriée
        if (name === 'pickaxe') {
            // Pour l'instant, utiliser une texture par défaut pour la pioche
            // Idéalement, vous auriez une texture spécifique pour la pioche
            this.texture = TextureLoader.get('player', 'idle');
        } else {
            this.texture = TextureLoader.get(category, name);
        }
        
        // Définir la description
        if (item_type === 'tool') {
            this.description = `Un outil: ${name}`;
        } else {
            this.description = `Un bloc de ${name}`;
        }
        
        this.quantity = 1; // Initialiser la quantité à 1 par défaut
    }
    
    // Méthode pour créer une pioche
    static createPickaxe() {
        return new Item('pickaxe', 'player', 'tool');
    }
    
    // Méthode pour vérifier si deux items sont du même type (pour l'empilement)
    isSameType(otherItem) {
        return otherItem && this.name === otherItem.name && this.item_type === otherItem.item_type;
    }
    
    // Méthode pour augmenter la quantité
    addQuantity(amount = 1) {
        this.quantity += amount;
        return this.quantity;
    }
    
    // Méthode pour diminuer la quantité
    removeQuantity(amount = 1) {
        this.quantity -= amount;
        return this.quantity;
    }
}