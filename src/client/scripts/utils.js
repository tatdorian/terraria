// utils.js
export default class ItemDatabase {
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
                const response = await fetch('../server/terraria.db');
                if (!response.ok) {
                    throw new Error(`Failed to fetch database: ${response.status} ${response.statusText}`);
                }
                const buffer = await response.arrayBuffer();
                this.db = new this.SQL.Database(new Uint8Array(buffer));
                console.log('Database loaded successfully');
                return true;
            } catch (error) {
                console.error('Failed to load database:', error);
                // Fallback to an in-memory database for testing
                this.db = new this.SQL.Database();
                this.db.run(`
                    CREATE TABLE items (
                        id INTEGER PRIMARY KEY,
                        name TEXT,
                        category TEXT,
                        item_type TEXT,
                        description TEXT
                    )
                `);
                this.db.run(`
                    INSERT INTO items (id, name, category, item_type, description)
                    VALUES 
                        (1, 'dirt', 'tiles', 'block', 'Un bloc de terre'),
                        (2, 'grass', 'tiles', 'block', 'Un bloc d\'herbe'),
                        (3, 'stone', 'tiles', 'block', 'Un bloc de pierre')
                `);
                console.log('Created in-memory database for testing');
                return true;
            }
        } catch (error) {
            console.error('Failed to initialize ItemDatabase:', error);
            return false;
        }
    }

    static getAllItems() {
        if (!this.db) return [];
        
        const stmt = this.db.prepare("SELECT * FROM items");
        const items = [];
        while (stmt.step()) {
            items.push(stmt.getAsObject());
        }
        stmt.free();
        return items;
    }

    static getItemById(id) {
        if (!this.db) return null;
        
        const stmt = this.db.prepare("SELECT * FROM items WHERE id = ?");
        stmt.bind([id]);
        const item = stmt.step() ? stmt.getAsObject() : null;
        stmt.free();
        return item;
    }
}