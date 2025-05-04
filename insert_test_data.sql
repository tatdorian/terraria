INSERT INTO user (id, username, password_hash) VALUES
(1, 'Player1', 'hash1'),
(2, 'Player2', 'hash2');

INSERT INTO worlds (id, name, seed, tiles, created_at) VALUES
(1, 'World1', 'seed123', 'tiles_data_1', '2023-01-01'),
(2, 'World2', 'seed456', 'tiles_data_2', '2023-01-02');

INSERT INTO enemies (id, name, health, attack_pattern) VALUES
(1, 'Zombie', 50, 'slow'),
(2, 'Slime', 25, 'jump'),
(3, 'Skeleton', 75, 'ranged');

INSERT INTO items (id, name, item_type) VALUES
(1, 'Wooden Sword', 'weapon'),
(2, 'Healing Potion', 'consumable'),
(3, 'Iron Pickaxe', 'tool');

INSERT INTO players (id, user_id, x, y, health, inventory, equipped_item, last_save) VALUES
(1, 1, 100, 200, 100, '[1, 2]', 1, '2023-01-01 10:00:00'),
(2, 2, 150, 250, 90, '[3]', 3, '2023-01-02 12:00:00');
