/* eslint-env mocha */
import { strict as assert } from 'assert';
import knex from '../src/db';
import * as userRepo from '../src/repositories/userRepository';
import * as statusRepo from '../src/repositories/statusRepository';
import * as labelRepo from '../src/repositories/labelRepository';
import * as taskRepo from '../src/repositories/taskRepository';

describe('Tasks filtering', () => {
  before(async () => {
    await knex.migrate.latest();
  });

  beforeEach(async () => {
    await knex('tasks_labels').del().catch(() => {});
    await knex('tasks').del().catch(() => {});
    await knex('labels').del().catch(() => {});
    await knex('statuses').del().catch(() => {});
    await knex('users').del().catch(() => {});
  });

  after(async () => {
    await knex.destroy();
  });

  it('filters by status, executor, label presence and creator', async () => {
    const u1 = await userRepo.create({
      firstName: 'A', lastName: 'One', email: 'a@example.com', password: 'x',
    });
    const u2 = await userRepo.create({
      firstName: 'B', lastName: 'Two', email: 'b@example.com', password: 'x',
    });

    const s1 = await statusRepo.create({ name: 'S1' });
    const s2 = await statusRepo.create({ name: 'S2' });

    const l1 = await labelRepo.create({ name: 'L1' });
    const l2 = await labelRepo.create({ name: 'L2' });

    const t1 = await taskRepo.create({
      name: 'T1', description: null, statusId: s1.id, creatorId: u1.id, executorId: u2.id, labelIds: [l1.id],
    });
    await taskRepo.create({
      name: 'T2', description: null, statusId: s2.id, creatorId: u2.id, executorId: null, labelIds: [],
    });
    const t3 = await taskRepo.create({
      name: 'T3', description: null, statusId: s2.id, creatorId: u1.id, executorId: null, labelIds: [l2.id],
    });
    const t4 = await taskRepo.create({
      name: 'T4', description: null, statusId: s1.id, creatorId: u1.id, executorId: null, labelIds: [],
    });

    const byStatus = await taskRepo.findAll({ statusId: s1.id });
    assert.equal(byStatus.length, 2);
    const idsByStatus = byStatus.map((task) => task.id).sort();
    assert.deepEqual(idsByStatus, [t1.id, t4.id].sort());

    const byExecutor = await taskRepo.findAll({ executorId: u2.id });
    assert.equal(byExecutor.length, 1);
    assert.equal(byExecutor[0].id, t1.id);

    const byLabel = await taskRepo.findAll({ labelId: l1.id });
    assert.equal(byLabel.length, 1);
    assert.equal(byLabel[0].id, t1.id);

    const hasLabel = await taskRepo.findAll({ hasLabel: true });
    const hasIds = hasLabel.map((task) => task.id).sort();
    assert.deepEqual(hasIds, [t1.id, t3.id].sort());

    const myTasks = await taskRepo.findAll({ createdBy: u1.id });
    const myIds = myTasks.map((task) => task.id).sort();
    assert.deepEqual(myIds, [t1.id, t3.id, t4.id].sort());
  });
});
