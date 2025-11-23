import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import knexLib from 'knex';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_DIR = join(__dirname, '..', 'data');
const DEFAULT_DB_FILE = join(DB_DIR, 'app.sqlite3');

// Allow overriding DB filename via env var (useful for tests)
const DB_FILE = process.env.DB_FILE || DEFAULT_DB_FILE;

if (DB_FILE !== ':memory:' && !fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const knex = knexLib({
  client: 'sqlite3',
  connection: {
    filename: DB_FILE,
  },
  useNullAsDefault: true,
  migrations: {
    directory: join(__dirname, '..', 'knex-migrations'),
  },
});

export default knex;
