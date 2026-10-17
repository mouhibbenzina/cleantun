import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(process.env.DB_PATH || path.join(dataDir, 'cleantun.db'));

db.exec('PRAGMA foreign_keys = ON;');
db.exec(fs.readFileSync(path.resolve(__dirname, '..', 'sql', 'schema.sql'), 'utf8'));
