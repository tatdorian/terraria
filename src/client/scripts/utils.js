// utils.js
export default class ItemDatabase {
    // Améliorations pour utils.js

    // Améliorations pour la classe ItemDatabase
    static async init() {
        try {
            // Check if SQL.js is available
            if (typeof initSqlJs === 'undefined') {
                console.error("SQL.js not loaded. Make sure to include it in your HTML.");
                return false;
            }

            this.SQL = await initSqlJs({
                locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/${file}`
            });

            try {
                const response = await fetch('http://localhost:5000/db');
                if (!response.ok) {
                    throw new Error(`Failed to fetch database: ${response.status} ${response.statusText}`);
                }
                const buffer = await response.arrayBuffer();
                this.db = new this.SQL.Database(new Uint8Array(buffer));
                console.log('Database loaded successfully');

                // Assurez-vous que les tables existent
                this._ensureTablesExist();
                return true;
            } catch (error) {
                console.error('Failed to load database:', error);
                // Fallback to an in-memory database for testing
                this.db = new this.SQL.Database();

                // Create items table
                this.db.run(`
                CREATE TABLE IF NOT EXISTS items (
                    id INTEGER PRIMARY KEY,
                    name TEXT,
                    category TEXT,
                    item_type TEXT,
                    description TEXT
                )
            `);

                // Create destroyed_items table
                this.db.run(`
                CREATE TABLE IF NOT EXISTS destroyed_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

                // Create crafted_items table
                this.db.run(`
                CREATE TABLE IF NOT EXISTS crafted_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

                // Insert sample items
                this.db.run(`
                INSERT INTO items (id, name, category, item_type, description)
                VALUES 
                    (1, 'dirt', 'tiles', 'block', 'Un bloc de terre'),
                    (2, 'grass', 'tiles', 'block', 'Un bloc d\'herbe'),
                    (3, 'stone', 'tiles', 'block', 'Un bloc de pierre'),
                    (4, 'pickaxe', 'player', 'tool', 'Une pioche pour casser la pierre')
            `);
                console.log('Created in-memory database for testing');
                return true;
            }
        } catch (error) {
            console.error('Failed to initialize ItemDatabase:', error);
            return false;
        }
    }

    // Méthode privée pour s'assurer que toutes les tables existent
    static _ensureTablesExist() {
        if (!this.db) return;

        // Create destroyed_items table if it doesn't exist
        this.db.run(`
        CREATE TABLE IF NOT EXISTS destroyed_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

        // Create crafted_items table if it doesn't exist
        this.db.run(`
        CREATE TABLE IF NOT EXISTS crafted_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    }

    // Méthode pour ajouter un item détruit
    static addDestroyedItem(name) {
        if (!this.db) return;

        // S'assurer que la table existe
        this._ensureTablesExist();

        try {
            const stmt = this.db.prepare("INSERT INTO destroyed_items (name) VALUES (?)");
            stmt.run([name]);
            stmt.free();
            console.log(`Destroyed item stored: ${name}`);
            return true;
        } catch (error) {
            console.error('Error storing destroyed item:', error);
            return false;
        }
    }

    // Nouvelle méthode pour ajouter un item crafté
    static addCraftedItem(name) {
        if (!this.db) return;

        // S'assurer que la table existe
        this._ensureTablesExist();

        try {
            const stmt = this.db.prepare("INSERT INTO crafted_items (name) VALUES (?)");
            stmt.run([name]);
            stmt.free();
            console.log(`Crafted item stored: ${name}`);
            return true;
        } catch (error) {
            console.error('Error storing crafted item:', error);
            return false;
        }
    }

    // Méthode pour récupérer les statistiques des items détruits
    static getDestroyedStats() {
        if (!this.db) return {};

        const stats = {};
        try {
            const stmt = this.db.prepare("SELECT name, COUNT(*) as count FROM destroyed_items GROUP BY name");
            while (stmt.step()) {
                const row = stmt.getAsObject();
                stats[row.name] = row.count;
            }
            stmt.free();
            return stats;
        } catch (error) {
            console.error('Error getting destroyed stats:', error);
            return {};
        }
    }
}