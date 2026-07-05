import Database from 'better-sqlite3';

const db = new Database('database.db', { verbose: console.log });

db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dynamic_key TEXT NOT NULL,
    data TEXT NOT NULL,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX IF NOT EXISTS idx_dynamic_key ON items(dynamic_key);
`);

export default db;