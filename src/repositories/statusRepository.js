import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const STATUSES_FILE = join(__dirname, '..', 'data', 'statuses.json');

const ensureDataDir = () => {
  const dataDir = join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  if (!fs.existsSync(STATUSES_FILE)) {
    fs.writeFileSync(STATUSES_FILE, JSON.stringify([]));
  }
};

const read = () => {
  ensureDataDir();
  const raw = fs.readFileSync(STATUSES_FILE, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
};

const write = (items) => {
  ensureDataDir();
  fs.writeFileSync(STATUSES_FILE, JSON.stringify(items, null, 2));
};

import knex from '../db.js';

export const findAll = async () => knex('statuses').select('*');

export const findById = async (id) => knex('statuses').where({ id }).first();

export const create = async (attrs) => {
  const [id] = await knex('statuses').insert(attrs);
  return findById(id);
};

export const update = async (id, attrs) => {
  await knex('statuses').where({ id }).update(attrs);
  return findById(id);
};

export const remove = async (id) => {
  // Prevent deletion if any task references this status
  const tasks = await knex('tasks').where({ statusId: id }).count({ c: 'id' }).first();
  const count = Number(tasks.c || 0);
  if (count > 0) return false;
  const deleted = await knex('statuses').where({ id }).del();
  return deleted > 0;
};

export default { findAll, findById, create, update, remove };
