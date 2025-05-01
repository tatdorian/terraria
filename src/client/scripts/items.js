// item.js
import TextureLoader from './textures.js';

export default class Item {
    constructor(name, category = 'tiles', item_type = 'block') {
        this.name = name;
        this.texture = TextureLoader.get(category, name);
        this.description = `Un bloc de ${name}`;
        this.item_type = item_type;
        this.quantity = 1; // Initialiser la quantité à 1 par défaut
    }
}