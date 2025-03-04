class Player:
    def __init__(self, name):
        self.name = name
        self.health = 100
        self.inventory = []
        self.position = (0, 0)

    def move(self, x, y):
        self.position = (self.position[0] + x, self.position[1] + y)

    def take_damage(self, amount):
        self.health -= amount
        if self.health < 0:
            self.health = 0

    def heal(self, amount):
        self.health += amount
        if self.health > 100:
            self.health = 100

    def add_item(self, item):
        self.inventory.append(item)

    def use_item(self, item):
        if item in self.inventory:
            self.inventory.remove(item)
            # Implement item usage logic here
        else:
            print("Item not in inventory")