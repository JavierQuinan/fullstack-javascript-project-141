<div align="center">

# Task Manager

### Full-stack task management application built with Fastify, SQLite and server-rendered views

[![Actions Status](https://github.com/JavierQuinan/fullstack-javascript-project-141/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/JavierQuinan/fullstack-javascript-project-141/actions)
![Node.js](https://img.shields.io/badge/Node.js-JavaScript-339933?logo=nodedotjs&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-5.x-000000?logo=fastify&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Knex%20%2F%20Objection-07405E?logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/license-ISC-blue)

</div>

## Overview

Task Manager is a server-rendered full-stack application for managing users, task statuses, labels and tasks. It demonstrates authentication flows, relational persistence, migrations, form handling, internationalization and automated tests in a Node.js application.

This repository is kept as **verifiable full-stack engineering evidence**. The documentation below separates implemented capabilities from technical debt that should be addressed before treating the project as production-ready.

## Verified capabilities

- user registration and session/login flows
- bcrypt password hashing
- task CRUD workflows
- customizable task statuses
- task labels and task/label relationships
- authenticated route checks for protected operations
- SQLite persistence
- Knex migrations
- Objection.js integration
- Fastify 5 application server
- Pug server-side rendering
- English / Spanish internationalization with i18next
- form-urlencoded request handling
- optional Rollbar error-reporting adapter when configured
- Mocha automated tests
- Webpack build tooling
- GitHub Actions / Hexlet validation

## Stack

`Node.js` · `JavaScript / ES Modules` · `Fastify` · `SQLite` · `Knex` · `Objection.js` · `Pug` · `bcrypt` · `i18next` · `Mocha` · `Webpack`

## Domain model

```text
User
  └── Task
       ├── Status
       ├── Executor / assignee
       └── Labels (many-to-many)
```

The application organizes persistence behind repository modules for users, statuses, tasks and labels rather than embedding every database operation directly in route handlers.

## Main application flow

```text
HTTP request
   │
   ▼
Fastify route / hook
   │
   ├── current-user lookup
   ├── authorization check
   └── form validation
   │
   ▼
Repository layer
   │
   ▼
Knex / SQLite
   │
   ▼
Pug rendering or redirect
```

## Local setup

```bash
git clone https://github.com/JavierQuinan/fullstack-javascript-project-141.git
cd fullstack-javascript-project-141
npm install
npm run setup
npm run db:migrate
npm start
```

The repository includes `.env.example`. Do not commit real secrets or production credentials.

Example development configuration:

```dotenv
NODE_ENV=development
PORT=3000
DB_FILE=./data/app.sqlite3
COOKIE_SECRET=replace_with_local_secret
ROLLBAR_ACCESS_TOKEN=
```

## Commands

```bash
npm start
npm run dev
npm run build
npm test
npm run db:migrate
```

## Testing

The repository includes Mocha tests, including task-filtering coverage against an in-memory SQLite database.

```bash
npm test
```

## Project structure

```text
src/
  app.js
  server.js
  db.js
  repositories/
views/
migrations/
knex-migrations/
locales/
public/
test/
scripts/
package.json
```

## Technical debt / hardening backlog

The current implementation is useful engineering evidence but should not be described as production-ready without additional work. Relevant items already visible in the codebase include:

- compatibility artifacts and duplicated project material under `code/` should be consolidated after confirming CI/grading dependencies;
- cookie/session handling is partly implemented manually and should be standardized around a reviewed session/cookie strategy;
- static-file serving uses custom path handling and requires explicit traversal/security hardening before production exposure;
- CSRF protections and broader application-security controls are not currently demonstrated;
- Rollbar is loaded dynamically and is optional rather than a guaranteed runtime dependency;
- deployment, backup, observability and production database strategy are outside this repository's current scope.

These limitations are documented deliberately instead of being hidden behind a generic “production-ready” claim.

## Portfolio classification

**Category:** Full-stack web engineering evidence  
**Visibility:** Public  
**Portfolio priority:** Medium-high  
**Current recommendation:** Keep public and use as supporting evidence; promote to pinned/featured only after the hardening backlog and repository cleanup are completed.

## What this repository demonstrates

For portfolio purposes, this project is most useful as evidence of:

- backend application design with Fastify;
- relational modeling and migrations;
- authentication and authorization flows;
- CRUD-heavy business workflows;
- server-rendered UI architecture;
- testable repository/data-access separation;
- maintenance of an existing codebase under external test constraints.

## Author

Francisco Quinteros — [GitHub](https://github.com/JavierQuinan)

## License

ISC
