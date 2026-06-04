-- D1 Database Schema Setup for Matsumoto Chikumano JHS Rindo Festival
-- Run: npx wrangler d1 execute <DATABASE_NAME> --file=./functions/schema.sql --local (or --remote)

DROP TABLE IF EXISTS rindou_kuchikomi_reviews;
DROP TABLE IF EXISTS rindou_kuchikomi_spots;

CREATE TABLE IF NOT EXISTS rindou_kuchikomi_spots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  x REAL NOT NULL,
  y REAL NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rindou_kuchikomi_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  spot_id INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT NOT NULL,
  author TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (spot_id) REFERENCES rindou_kuchikomi_spots(id) ON DELETE CASCADE
);

