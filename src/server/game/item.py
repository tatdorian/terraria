class Item:
    def __init__(self, name, item_type):
        self.name = name
        self.item_type = item_type

    def use(self):
        # Logic for using the item
        pass

    def equip(self):
        # Logic for equipping the item
        pass

    def __str__(self):
        return f"{self.name} ({self.item_type})"