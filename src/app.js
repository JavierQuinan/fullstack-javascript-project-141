// src/app.js
import Fastify from 'fastify';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pug from 'pug';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import bcrypt from 'bcrypt';
import { initRollbar, getRollbar } from './rollbar.js';
import * as userRepo from './repositories/userRepository.js';
import * as statusRepo from './repositories/statusRepository.js';
import * as taskRepo from './repositories/taskRepository.js';
import * as labelRepo from './repositories/labelRepository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const buildApp = async () => {
  const app = Fastify({
    logger: true,
  });

  // Inicializar i18next sincronamente con backend de archivos
  i18next
    .use(Backend)
    .init({
      fallbackLng: 'en',
      preload: ['en', 'es'],
      backend: {
        loadPath: join(__dirname, '..', 'locales', '{{lng}}', 'translation.json'),
      },
      initImmediate: false,
    });

  // Servir archivos estáticos desde /public (manejo manual para evitar dependencia de plugin)
  const publicRoot = join(__dirname, '..', 'public');
  app.get('/public/*', async (request, reply) => {
    const relPath = request.params['*'] || '';
    const safePath = join(publicRoot, relPath);
    try {
      // Nota: no hacemos un completo check de seguridad/escape, pero join evita subidas simples
      const fs = await import('fs');
      if (!fs.existsSync(safePath) || fs.lstatSync(safePath).isDirectory()) {
        return reply.status(404).send('Not found');
      }
      const stream = fs.createReadStream(safePath);
      // Determinar content-type básico por extensión
      const ext = safePath.split('.').pop();
      const mime = ext === 'js' ? 'application/javascript' : ext === 'css' ? 'text/css' : 'application/octet-stream';
      reply.type(mime);
      return reply.send(stream);
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send('Error reading static file');
    }
  });

  // Simple cookie helpers (no plugin) ---------------------------------
  const parseCookies = (cookieHeader) => {
    if (!cookieHeader) return {};
    return String(cookieHeader).split(';').map((c) => c.trim()).filter(Boolean).reduce((acc, pair) => {
      const idx = pair.indexOf('=');
      if (idx === -1) return acc;
      const key = pair.slice(0, idx).trim();
      const val = pair.slice(idx + 1).trim();
      try {
        acc[key] = decodeURIComponent(val);
      } catch (e) {
        acc[key] = val;
      }
      return acc;
    }, {});
  };

  const serializeCookie = (name, value, opts = {}) => {
    const pairs = [`${name}=${encodeURIComponent(String(value))}`];
    if (opts.path) pairs.push(`Path=${opts.path}`);
    if (opts.expires) pairs.push(`Expires=${opts.expires.toUTCString()}`);
    if (opts.httpOnly) pairs.push('HttpOnly');
    if (opts.maxAge && Number.isFinite(opts.maxAge)) pairs.push(`Max-Age=${Number(opts.maxAge)}`);
    if (opts.secure) pairs.push('Secure');
    if (opts.sameSite) pairs.push(`SameSite=${opts.sameSite}`);
    return pairs.join('; ');
  };

  const setCookie = (reply, name, value, opts = {}) => {
    const header = serializeCookie(name, value, opts);
    // append to existing Set-Cookie header(s)
    const raw = reply.raw;
    const prev = raw.getHeader('Set-Cookie');
    if (!prev) raw.setHeader('Set-Cookie', header);
    else if (Array.isArray(prev)) raw.setHeader('Set-Cookie', [...prev, header]);
    else raw.setHeader('Set-Cookie', [prev, header]);
  };

  const clearCookie = (reply, name, opts = {}) => {
    const expires = new Date(0);
    setCookie(reply, name, '', { ...opts, expires, path: opts.path || '/' });
  };

  // Simple flash helpers via cookie
  const setFlash = (reply, type, message) => {
    const payload = JSON.stringify({ type, message });
    setCookie(reply, 'flash', payload, { path: '/', httpOnly: false });
  };
  const getFlash = (request, reply) => {
    const v = request.cookies && request.cookies.flash;
    if (!v) return null;
    try {
      const parsed = JSON.parse(v);
      // clear
      clearCookie(reply, 'flash', { path: '/' });
      return parsed;
    } catch (e) {
      return null;
    }
  };

  // Method override for forms: _method
  app.addHook('preHandler', async (request, reply) => {
    if (request.method === 'POST' && request.body && request.body._method) {
      const m = String(request.body._method).toUpperCase();
      if (['PATCH', 'DELETE', 'PUT'].includes(m)) {
        request.raw.method = m;
        request.method = m;
      }
    }
  });

  // Middleware to add template helpers
  app.addHook('onRequest', async (request, reply) => {
    // parse cookies into request.cookies
    const rawCookies = request.headers && request.headers.cookie;
    request.cookies = parseCookies(rawCookies);
    // attach currentUser if logged
    const userId = request.cookies && request.cookies.userId;
    if (userId) {
      const u = await userRepo.findById(userId);
      request.currentUser = u || null;
    } else {
      request.currentUser = null;
    }
  });

  // Initialize Rollbar if token provided
  await initRollbar();

  // Fastify error handler: report to Rollbar then send generic response
  app.setErrorHandler((error, request, reply) => {
    try {
      const rollbarInstance = getRollbar();
      if (rollbarInstance) {
        // include request data to help debugging
        rollbarInstance.error(error, request.raw);
      }
    } catch (e) {
      request.log.error('Error reporting to Rollbar', e);
    }
    // keep behavior simple: generic 500
    reply.status(500).type('text/html').send('Internal Server Error');
  });

  // Ruta principal: renderiza plantilla usando i18next
  app.get('/', async (request, reply) => {
    const lang = request.query.lng || 'es';
    const t = (key, opts) => i18next.getFixedT(lang)(key, opts);
    const viewPath = join(__dirname, '..', 'views', 'index.pug');
    try {
        const flash = getFlash(request, reply);
        const html = pug.renderFile(viewPath, { t, lang, currentUser: request.currentUser, flash });
      reply.type('text/html').send(html);
    } catch (err) {
      request.log.error(err);
      reply.status(500).send('Template render error');
    }
  });

    // Users routes
    app.get('/users', async (request, reply) => {
      const lang = request.query.lng || 'es';
      const t = (key, opts) => i18next.getFixedT(lang)(key, opts);
      const users = await userRepo.findAll();
      const flash = getFlash(request, reply);
      const html = pug.renderFile(join(__dirname, '..', 'views', 'users', 'index.pug'), { t, lang, users, currentUser: request.currentUser, flash });
      return reply.type('text/html').send(html);
    });

    // Statuses routes
    app.get('/statuses', async (request, reply) => {
      const lang = request.query.lng || 'es';
      const t = (key, opts) => i18next.getFixedT(lang)(key, opts);
      const statuses = await statusRepo.findAll();
      const flash = getFlash(request, reply);
      const html = pug.renderFile(join(__dirname, '..', 'views', 'statuses', 'index.pug'), { t, lang, statuses, currentUser: request.currentUser, flash });
      return reply.type('text/html').send(html);
    });

    app.get('/statuses/new', async (request, reply) => {
      if (!request.currentUser) {
        setFlash(reply, 'danger', 'Access denied');
        return reply.redirect('/session/new');
      }
      const lang = request.query.lng || 'es';
      const t = (key, opts) => i18next.getFixedT(lang)(key, opts);
      const flash = getFlash(request, reply);
      const html = pug.renderFile(join(__dirname, '..', 'views', 'statuses', 'new.pug'), { t, lang, flash });
      return reply.type('text/html').send(html);
    });

    app.post('/statuses', async (request, reply) => {
      if (!request.currentUser) {
        setFlash(reply, 'danger', 'Access denied');
        return reply.redirect('/session/new');
      }
      const data = request.body && request.body.data ? request.body.data : {};
      const name = (data.name || '').trim();
      const lang = request.query.lng || 'es';
      const t = (key, opts) => i18next.getFixedT(lang)(key, opts);
      if (!name) {
        setFlash(reply, 'danger', t('status.name') + ' is required');
        return reply.redirect('/statuses/new');
      }
      await statusRepo.create({ name });
      setFlash(reply, 'success', t('status.created'));
      return reply.redirect('/statuses');
    });

    app.get('/statuses/:id/edit', async (request, reply) => {
      if (!request.currentUser) {
        setFlash(reply, 'danger', 'Access denied');
        return reply.redirect('/session/new');
      }
      const { id } = request.params;
      const status = await statusRepo.findById(id);
      if (!status) return reply.status(404).send('Not found');
      const lang = request.query.lng || 'es';
      const t = (key, opts) => i18next.getFixedT(lang)(key, opts);
      const flash = getFlash(request, reply);
      const html = pug.renderFile(join(__dirname, '..', 'views', 'statuses', 'edit.pug'), { t, lang, status, flash });
      return reply.type('text/html').send(html);
    });

    app.patch('/statuses/:id', async (request, reply) => {
      if (!request.currentUser) {
        setFlash(reply, 'danger', 'Access denied');
        return reply.redirect('/session/new');
      }
      const { id } = request.params;
      const data = request.body && request.body.data ? request.body.data : {};
      const name = (data.name || '').trim();
      const lang = request.query.lng || 'es';
      const t = (key, opts) => i18next.getFixedT(lang)(key, opts);
      if (!name) {
        setFlash(reply, 'danger', t('status.name') + ' is required');
        return reply.redirect(`/statuses/${id}/edit`);
      }
      await statusRepo.update(id, { name });
      setFlash(reply, 'success', t('status.updated'));
      return reply.redirect('/statuses');
    });
    app.delete('/statuses/:id', async (request, reply) => {
      if (!request.currentUser) {
        setFlash(reply, 'danger', 'Access denied');
        return reply.redirect('/session/new');
      }
      const { id } = request.params;
      const ok = await statusRepo.remove(id);
      const lang = request.query.lng || 'es';
      const t = (key, opts) => i18next.getFixedT(lang)(key, opts);
      if (!ok) {
        setFlash(reply, 'danger', 'Cannot delete status with assigned tasks');
        return reply.redirect('/statuses');
      }
      setFlash(reply, 'success', t('status.deleted'));
      return reply.redirect('/statuses');
    });

    // Tasks routes
    app.get('/tasks', async (request, reply) => {
      const lang = request.query.lng || 'es';
      const t = (key, opts) => i18next.getFixedT(lang)(key, opts);
      // Parse filters from query params
      const { statusId, executorId, labelId, onlyMy, hasLabel } = request.query || {};
      const filters = {};
      if (statusId) filters.statusId = Number(statusId);
      if (executorId) filters.executorId = Number(executorId);
      if (labelId) filters.labelId = Number(labelId);
      if (hasLabel && (hasLabel === '1' || hasLabel === 'true' || hasLabel === 'on')) filters.hasLabel = true;
      if (onlyMy && (onlyMy === '1' || onlyMy === 'true' || onlyMy === 'on') && request.currentUser) filters.createdBy = request.currentUser.id;

      const tasks = await taskRepo.findAll(filters);
      const statuses = await statusRepo.findAll();
      const users = await userRepo.findAll();
      const labels = await labelRepo.findAll();
      const flash = getFlash(request, reply);
      const html = pug.renderFile(join(__dirname, '..', 'views', 'tasks', 'index.pug'), { t, lang, tasks, currentUser: request.currentUser, flash, statuses, users, labels, filters: { statusId, executorId, labelId, onlyMy, hasLabel } });
      return reply.type('text/html').send(html);
    });

    app.get('/tasks/new', async (request, reply) => {
      if (!request.currentUser) {
        setFlash(reply, 'danger', 'Access denied');
        return reply.redirect('/session/new');
      }
      const statuses = await statusRepo.findAll();
      const users = await userRepo.findAll();
      const labels = await labelRepo.findAll();
      const lang = request.query.lng || 'es';
      const t = (key, opts) => i18next.getFixedT(lang)(key, opts);
      const flash = getFlash(request, reply);
      const html = pug.renderFile(join(__dirname, '..', 'views', 'tasks', 'new.pug'), { t, lang, statuses, users, labels, flash });
      return reply.type('text/html').send(html);
    });

    app.post('/tasks', async (request, reply) => {
      if (!request.currentUser) {
        setFlash(reply, 'danger', 'Access denied');
        return reply.redirect('/session/new');
      }
      const data = request.body && request.body.data ? request.body.data : {};
      const name = (data.name || '').trim();
      const description = data.description || null;
      const statusId = data.statusId;
      const executorId = data.executorId || null;
      const lang = request.query.lng || 'es';
      const t = (key, opts) => i18next.getFixedT(lang)(key, opts);
      if (!name || !statusId) {
        setFlash(reply, 'danger', 'Validation error');
        return reply.redirect('/tasks/new');
      }
      const creatorId = request.currentUser.id;
      // Normalize labelIds: may be undefined, single value or array
      let labelIds = null;
      if (request.body && request.body.data && request.body.data.labelIds) {
        const li = request.body.data.labelIds;
        labelIds = Array.isArray(li) ? li.map((x) => (x === '' ? null : Number(x))).filter(Boolean) : [Number(li)];
      }
      await taskRepo.create({ name, description, statusId, creatorId, executorId: executorId || null, labelIds });
      setFlash(reply, 'success', t('task.created'));
      return reply.redirect('/tasks');
    });

    app.get('/tasks/:id', async (request, reply) => {
      const { id } = request.params;
      const task = await taskRepo.findById(id);
      if (!task) return reply.status(404).send('Not found');
      const flash = getFlash(request, reply);
      const lang = request.query.lng || 'es';
      const t = (key, opts) => i18next.getFixedT(lang)(key, opts);
      const html = pug.renderFile(join(__dirname, '..', 'views', 'tasks', 'show.pug'), { t, lang, task, currentUser: request.currentUser, flash });
      return reply.type('text/html').send(html);
    });

    app.get('/tasks/:id/edit', async (request, reply) => {
      if (!request.currentUser) {
        setFlash(reply, 'danger', 'Access denied');
        return reply.redirect('/session/new');
      }
      const { id } = request.params;
      const task = await taskRepo.findById(id);
      if (!task) return reply.status(404).send('Not found');
      const statuses = await statusRepo.findAll();
      const users = await userRepo.findAll();
      const labels = await labelRepo.findAll();
      const flash = getFlash(request, reply);
      const lang = request.query.lng || 'es';
      const t = (key, opts) => i18next.getFixedT(lang)(key, opts);
      const html = pug.renderFile(join(__dirname, '..', 'views', 'tasks', 'edit.pug'), { t, lang, task, statuses, users, labels, flash });
      return reply.type('text/html').send(html);
    });

    app.patch('/tasks/:id', async (request, reply) => {
      if (!request.currentUser) {
        setFlash(reply, 'danger', 'Access denied');
        return reply.redirect('/session/new');
      }
      const { id } = request.params;
      const data = request.body && request.body.data ? request.body.data : {};
      // parse labels
      let labelIds = null;
      if (data.labelIds) {
        const li = data.labelIds;
        labelIds = Array.isArray(li) ? li.map((x) => (x === '' ? null : Number(x))).filter(Boolean) : [Number(li)];
      }
      const attrs = { name: data.name, description: data.description, statusId: data.statusId, executorId: data.executorId || null, labelIds };
      await taskRepo.update(id, attrs);
      const lang = request.query.lng || 'es';
      const t = (key, opts) => i18next.getFixedT(lang)(key, opts);
      setFlash(reply, 'success', t('task.updated'));
      return reply.redirect('/tasks');
    });

    app.delete('/tasks/:id', async (request, reply) => {
      const { id } = request.params;
      const task = await taskRepo.findById(id);
      if (!task) return reply.status(404).send('Not found');
      if (!request.currentUser || String(request.currentUser.id) !== String(task.creatorId)) {
        setFlash(reply, 'danger', 'Access denied');
        return reply.redirect('/tasks');
      }
      await taskRepo.remove(id);
      const lang = request.query.lng || 'es';
      const t = (key, opts) => i18next.getFixedT(lang)(key, opts);
      setFlash(reply, 'success', t('task.deleted'));
      return reply.redirect('/tasks');
    });

    app.get('/users/new', async (request, reply) => {
      const lang = request.query.lng || 'es';
      const t = (key, opts) => i18next.getFixedT(lang)(key, opts);
      const flash = getFlash(request, reply);
      const html = pug.renderFile(join(__dirname, '..', 'views', 'users', 'new.pug'), { t, lang, flash });
      return reply.type('text/html').send(html);
    });

    app.post('/users', async (request, reply) => {
      const data = request.body && request.body.data ? request.body.data : {};
      const { firstName = '', lastName = '', email = '', password = '' } = data;
      // Validations
      if (!firstName || !lastName || !email || !password || String(password).length < 3) {
        setFlash(reply, 'danger', 'Validation error: check required fields');
        return reply.redirect('/users/new');
      }
      if (await userRepo.findByEmail(email)) {
        setFlash(reply, 'danger', 'Email already in use');
        return reply.redirect('/users/new');
      }
      const hashed = await bcrypt.hash(password, 10);
      const user = await userRepo.create({ firstName, lastName, email, password: hashed });
      setFlash(reply, 'success', 'User created');
      // auto-login
      setCookie(reply, 'userId', String(user.id), { path: '/' });
      return reply.redirect('/users');
    });

    app.get('/users/:id/edit', async (request, reply) => {
      const { id } = request.params;
      const user = await userRepo.findById(id);
      if (!user) return reply.status(404).send('Not found');
      if (!request.currentUser || String(request.currentUser.id) !== String(id)) {
        setFlash(reply, 'danger', 'Access denied');
        return reply.redirect('/users');
      }
      const lang = request.query.lng || 'es';
      const t = (key, opts) => i18next.getFixedT(lang)(key, opts);
      const flash = getFlash(request, reply);
      const html = pug.renderFile(join(__dirname, '..', 'views', 'users', 'edit.pug'), { t, lang, user, flash });
      return reply.type('text/html').send(html);
    });

    app.patch('/users/:id', async (request, reply) => {
      const { id } = request.params;
      if (!request.currentUser || String(request.currentUser.id) !== String(id)) {
        setFlash(reply, 'danger', 'Access denied');
        return reply.redirect('/users');
      }
      const data = request.body && request.body.data ? request.body.data : {};
      const attrs = { firstName: data.firstName, lastName: data.lastName, email: data.email };
      if (data.password && String(data.password).length >= 3) {
        attrs.password = await bcrypt.hash(data.password, 10);
      }
      await userRepo.update(id, attrs);
      setFlash(reply, 'success', 'User updated');
      return reply.redirect('/users');
    });

    app.delete('/users/:id', async (request, reply) => {
      const { id } = request.params;
      if (!request.currentUser || String(request.currentUser.id) !== String(id)) {
        setFlash(reply, 'danger', 'Access denied');
        return reply.redirect('/users');
      }
      const ok = await userRepo.remove(id);
      if (!ok) {
        setFlash(reply, 'danger', 'Cannot delete user with assigned tasks');
        return reply.redirect('/users');
      }
      // clear cookie
      clearCookie(reply, 'userId', { path: '/' });
      setFlash(reply, 'success', 'User deleted');
      return reply.redirect('/');
    });

    // Session routes
    app.get('/session/new', async (request, reply) => {
      const lang = request.query.lng || 'es';
      const t = (key, opts) => i18next.getFixedT(lang)(key, opts);
      const flash = getFlash(request, reply);
      const html = pug.renderFile(join(__dirname, '..', 'views', 'session', 'new.pug'), { t, lang, flash });
      return reply.type('text/html').send(html);
    });

    app.post('/session', async (request, reply) => {
      const data = request.body && request.body.data ? request.body.data : {};
      const { email = '', password = '' } = data;
      const user = await userRepo.findByEmail(email);
      if (!user) {
        setFlash(reply, 'danger', 'Invalid credentials');
        return reply.redirect('/session/new');
      }
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        setFlash(reply, 'danger', 'Invalid credentials');
        return reply.redirect('/session/new');
      }
      setCookie(reply, 'userId', String(user.id), { path: '/' });
      setFlash(reply, 'success', 'Signed in');
      return reply.redirect('/');
    });

    app.delete('/session', async (request, reply) => {
      clearCookie(reply, 'userId', { path: '/' });
      setFlash(reply, 'success', 'Signed out');
      return reply.redirect('/');
    });

    // Debug endpoint to generate an error and test Rollbar integration
    app.get('/debug/rollbar', async (request, reply) => {
      // Throw an error that should be captured by the error handler and Rollbar
      throw new Error('Debug rollbar error: manual trigger');
    });

  return app;
};

export default buildApp;
