### Hexlet tests and linter status:
[![Actions Status](https://github.com/JavierQuinan/fullstack-javascript-project-141/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/JavierQuinan/fullstack-javascript-project-141/actions)

## Task Manager

Full-stack JavaScript application built with Fastify, Knex, and Pug templates.

### Features
- User authentication and session management
- Task CRUD with status tracking
- Task filtering by status, executor, labels
- Label management
- Rollbar error tracking integration

### Setup
```bash
npm install
npm run setup  # Creates .env from template
npm run build
npm start
```

### Tech Stack
- **Backend**: Fastify 5.x, Knex.js, SQLite
- **Frontend**: Pug templates, Bootstrap, Webpack
- **Auth**: bcrypt, cookie-based sessions
- **i18n**: i18next with filesystem backend

---
_Last updated: 2025-11-23_