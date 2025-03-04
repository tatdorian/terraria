class Enemy:
    def __init__(self, name, health, attack_pattern):
        self.name = name
        self.health = health
        self.attack_pattern = attack_pattern

    def attack(self, player):
        # Implement attack logic here
        pass

    def take_damage(self, damage):
        self.health -= damage
        if self.health <= 0:
            self.die()

    def die(self):
        # Implement death logic here
        pass

    def __str__(self):
        return f"{self.name} (Health: {self.health})"