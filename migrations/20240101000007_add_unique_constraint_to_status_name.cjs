// migrations/20240101000007_add_unique_constraint_to_status_name.cjs
exports.up = async function(knex) {
  // SQLite doesn't support ALTER TABLE ADD CONSTRAINT UNIQUE
  // We need to recreate the table
  
  // Create temporary table with UNIQUE constraint
  await knex.schema.createTable('statuses_temp', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable().unique();
    table.timestamps(true, true);
  });
  
  // Copy data from old table to new table
  await knex.raw('INSERT INTO statuses_temp SELECT * FROM statuses');
  
  // Drop old table
  await knex.schema.dropTable('statuses');
  
  // Rename temp table to statuses
  await knex.schema.renameTable('statuses_temp', 'statuses');
};

exports.down = async function(knex) {
  // Reverse: remove UNIQUE constraint
  
  // Create temporary table without UNIQUE constraint
  await knex.schema.createTable('statuses_temp', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.timestamps(true, true);
  });
  
  // Copy data from old table to new table
  await knex.raw('INSERT INTO statuses_temp SELECT * FROM statuses');
  
  // Drop old table
  await knex.schema.dropTable('statuses');
  
  // Rename temp table to statuses
  await knex.schema.renameTable('statuses_temp', 'statuses');
};
