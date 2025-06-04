export default class Inventory {
    constructor(size = 10) {
        this.slots = new Array(size).fill(null).map(() => ({
            item: null,
            quantity: 0
        }));
    }

    addItem(item) {
        console.log('Adding item:', item); // Debug log

        // Chercher un slot existant avec le même type d'item
        let existingSlot = this.slots.find(slot => 
            slot.item && slot.item.name === item.name && slot.quantity < 64
        );

        if (existingSlot) {
            existingSlot.quantity++;
            return true;
        }

        // Chercher un slot vide
        let emptySlot = this.slots.find(slot => !slot.item);
        if (emptySlot) {
            emptySlot.item = item;
            emptySlot.quantity = 1;
            return true;
        }

        return false;
    }
}
