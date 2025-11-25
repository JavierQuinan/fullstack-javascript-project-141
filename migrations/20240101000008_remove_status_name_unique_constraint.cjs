/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('statuses_temp', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable(); // Sin .unique()
      table.integer('creatorId').unsigned().references('id').inTable('users');
      table.timestamps(true, true);
    })
    .then(() => {
      return knex.raw('INSERT INTO statuses_temp (id, name, creatorId, created_at, updated_at) SELECT id, name, creatorId, created_at, updated_at FROM statuses');
    })
    .then(() => {
      return knex.schema.dropTable('statuses');
    })
    .then(() => {
      return knex.schema.renameTable('statuses_temp', 'statuses');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .createTable('statuses_temp', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable().unique(); // Con .unique()
      table.integer('creatorId').unsigned().references('id').inTable('users');
      table.timestamps(true, true);
    })
    .then(() => {
      return knex.raw('INSERT INTO statuses_temp (id, name, creatorId, created_at, updated_at) SELECT id, name, creatorId, created_at, updated_at FROM statuses');
    })
    .then(() => {
      return knex.schema.dropTable('statuses');
    })
    .then(() => {
      return knex.schema.renameTable('statuses_temp', 'statuses');
    });
};
