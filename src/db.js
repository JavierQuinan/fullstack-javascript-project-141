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
    // Directorio único usado por la app y CI
    directory: join(__dirname, '..', 'migrations'),
  },
});

export const ensureBaseSchema = async () => {
  // Crear tabla users si aún no existe (evita condición de carrera antes de migraciones)
  const hasUsers = await knex.schema.hasTable('users');
  if (!hasUsers) {
    await knex.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('email').notNullable().unique();
      table.string('passwordDigest').notNullable();
      // Columna legacy "password" para compatibilidad con tests externos que aún la esperan
      table.string('password').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
      table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
    });
  } else {
    const hasPwd = await knex.schema.hasColumn('users', 'passwordDigest');
    if (!hasPwd) {
      await knex.schema.table('users', (t) => {
        t.string('passwordDigest').notNullable().default('');
      });
    }
    // Asegurar columna legacy password
    const hasLegacyPassword = await knex.schema.hasColumn('users', 'password');
    if (!hasLegacyPassword) {
      await knex.schema.table('users', (t) => {
        t.string('password').notNullable().default('');
      });
      // Copiar valores existentes desde passwordDigest si existen
      const rows = await knex('users').select('id', 'passwordDigest');
      for (const r of rows) {
        if (r.passwordDigest) {
          await knex('users').where({ id: r.id }).update({ password: r.passwordDigest });
        }
      }
    }
  }
};

export default knex;
