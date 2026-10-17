CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  email         TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT    NOT NULL,
  city          TEXT,
  role          TEXT    NOT NULL DEFAULT 'citizen'
              CHECK (role IN ('citizen', 'admin')),
  points        INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reports (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  type        TEXT    NOT NULL
              CHECK (type IN ('dump', 'overflow', 'burning', 'recycling', 'water', 'other')),
  description TEXT,
  lat         REAL    NOT NULL CHECK (lat BETWEEN -90 AND 90),
  lng         REAL    NOT NULL CHECK (lng BETWEEN -180 AND 180),
  address     TEXT,
  city        TEXT,
  photo       TEXT,
  status      TEXT    NOT NULL DEFAULT 'reported'
              CHECK (status IN ('reported', 'in_progress', 'resolved', 'rejected')),
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_coords ON reports(lat, lng);
CREATE INDEX IF NOT EXISTS idx_reports_city   ON reports(city);
