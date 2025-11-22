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
});

// Create tables if not exists
const ensureSchema = async () => {
  // users
  const hasUsers = await knex.schema.hasTable('users');
  if (!hasUsers) {
    await knex.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('firstName').notNullable();
      table.string('lastName').notNullable();
      table.string('email').notNullable().unique();
      table.string('password').notNullable();
    });
  }

  const hasStatuses = await knex.schema.hasTable('statuses');
  if (!hasStatuses) {
    await knex.schema.createTable('statuses', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
    });
  }

  const hasTasks = await knex.schema.hasTable('tasks');
  if (!hasTasks) {
    await knex.schema.createTable('tasks', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.text('description');
      table.integer('statusId').notNullable().references('id').inTable('statuses').onDelete('RESTRICT');
      table.integer('creatorId').notNullable().references('id').inTable('users').onDelete('RESTRICT');
      table.integer('executorId').references('id').inTable('users').onDelete('SET NULL');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  }
  const hasLabels = await knex.schema.hasTable('labels');
  if (!hasLabels) {
    await knex.schema.createTable('labels', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
    });
  }

  const hasTasksLabels = await knex.schema.hasTable('tasks_labels');
  if (!hasTasksLabels) {
    await knex.schema.createTable('tasks_labels', (table) => {
      table.integer('taskId').notNullable().references('id').inTable('tasks').onDelete('CASCADE');
      table.integer('labelId').notNullable().references('id').inTable('labels').onDelete('RESTRICT');
      table.primary(['taskId', 'labelId']);
    });
  }
};

await ensureSchema();

export default knex;
