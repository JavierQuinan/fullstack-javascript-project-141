<div align="center">

# Task Manager

### Full-stack task management application built with Fastify, SQLite and server-rendered views

[![CI](https://github.com/JavierQuinan/fullstack-javascript-project-141/actions/workflows/ci.yml/badge.svg)](https://github.com/JavierQuinan/fullstack-javascript-project-141/actions/workflows/ci.yml)
![Node.js](https://img.shields.io/badge/Node.js-JavaScript-339933?logo=nodedotjs&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-5.x-000000?logo=fastify&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Knex%20%2F%20Objection-07405E?logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/license-ISC-blue)

</div>

## Overview

Task Manager is a server-rendered full-stack application for managing users, task statuses, labels and tasks. It demonstrates authentication flows, relational persistence, migrations, form handling, internationalization and automated verification in a Node.js application.

This repository is maintained as **verifiable full-stack engineering evidence**. Current implementation and observed CI results are documented here; possible future evolution is kept separately in [`ROADMAP.md`](./ROADMAP.md).

## Verified capabilities

- user registration and session/login flows;
- bcrypt password hashing;
- task CRUD workflows;
- customizable task statuses;
- task labels and task/label relationships;
- authenticated route checks for protected operations;
- SQLite persistence;
- Knex migrations;
- Objection.js integration;
- Fastify 5 application server;
- Pug server-side rendering;
- English / Spanish internationalization with i18next;
- form-urlencoded request handling;
- optional Rollbar error reporting when configured;
- Mocha automated test baseline;
- Webpack production build tooling;
- independent GitHub Actions quality workflow.

## Stack

`Node.js` · `JavaScript / ES Modules` · `Fastify 5` · `SQLite` · `Knex` · `Objection.js` · `Pug` · `bcrypt` · `i18next` · `Mocha` · `Webpack`

## Architecture

```text
HTTP request
   │
   ▼
Fastify route / hook
   │
   ├── current-user lookup
   ├── authorization checks
   ├── form validation
   └── Pug rendering / redirect
   │
   ▼
Repository layer
   │
   ▼
Knex / SQLite
```

Domain relationships represented by the current application:

```text
User
  └── Task
       ├── Status
       ├── Executor / assignee
       └── Labels (many-to-many)
```

## Reproducible setup

```bash
git clone https://github.com/JavierQuinan/fullstack-javascript-project-141.git
cd fullstack-javascript-project-141
npm ci
npm run setup
npm run db:migrate
npm start
```

The repository includes `.env.example`. Real secrets and production credentials must not be committed.

## Quality evidence

The independent workflow executes:

```text
npm ci → npm test → npm run build
```

The observed successful CI baseline produced:

- Mocha: **1 passing** task-filtering test using isolated in-memory SQLite;
- Webpack production build: **compiled successfully**;
- GitHub Actions job: **success**.

Details and current limitations are recorded in [`ENGINEERING_EVIDENCE.md`](./ENGINEERING_EVIDENCE.md).

## Dependency and security boundary

The same observed install reported **29 npm audit findings** (`4 low`, `3 moderate`, `20 high`, `2 critical`) in the dependency graph. This does not prove that each advisory is exploitable in the application, but it means this repository should **not** be described as production-ready until the dependency tree is reviewed and remediated.

The current source also contains historical/custom implementation around static-file serving and cookies/session state. Those areas are documented honestly and prioritized in the roadmap rather than hidden behind a security claim.

## Documentation model

- [`README.md`](./README.md) — what exists today and how to run it;
- [`ENGINEERING_EVIDENCE.md`](./ENGINEERING_EVIDENCE.md) — observed source/CI evidence;
- [`ROADMAP.md`](./ROADMAP.md) — future product, security, testing and architecture evolution.

The roadmap uses ✅ implemented, 🔄 priority direction and 🧭 strategic evolution so future work cannot be mistaken for current functionality.

## Portfolio classification

**Category:** Full-stack web engineering evidence  
**Visibility:** Public  
**Classification:** `PORTFOLIO EVIDENCE` / supporting full-stack project

The repository is useful evidence of backend application design, relational modeling, authentication flows, CRUD-heavy business workflows, server-rendered UI architecture and maintenance of an existing codebase under external compatibility constraints.

## Resumen en español

Proyecto full stack con **Fastify 5 + SQLite + Knex + Objection.js + Pug**, autenticación con bcrypt, CRUD de tareas/estados/etiquetas, internacionalización y quality gate propio. El CI observado ejecutó correctamente tests y build. El roadmap conserva una evolución ambiciosa del producto, mientras el README y `ENGINEERING_EVIDENCE.md` separan con precisión lo ya implementado de lo futuro y documentan la deuda actual de dependencias/seguridad.

## Author

Francisco Quinteros — [GitHub](https://github.com/JavierQuinan)

## License

ISC
