# Task Manager — Engineering Evidence

This document records evidence observed in the repository and GitHub Actions. It is intentionally narrower than the product roadmap.

## Source evidence

Current source demonstrates:

- Fastify 5 application server;
- SQLite persistence;
- Knex migrations;
- Objection.js integration;
- repository modules for users, statuses, labels and tasks;
- bcrypt password hashing;
- authenticated route checks;
- Pug server-side rendering;
- i18next English/Spanish resources;
- form-urlencoded request handling;
- optional Rollbar integration;
- Webpack production build tooling.

## Automated quality evidence

Independent workflow: `.github/workflows/ci.yml`.

Observed successful CI sequence on the current quality baseline:

```text
npm ci
npm test
npm run build
```

Observed results:

- Mocha: `1 passing` for the isolated task-filtering suite;
- Webpack: compiled successfully;
- overall GitHub Actions job: success.

The isolated test environment uses an in-memory SQLite database and explicit test environment preload.

## Dependency-health observation

The same observed `npm ci` output reported:

```text
29 vulnerabilities
4 low · 3 moderate · 20 high · 2 critical
```

This is an npm dependency-tree observation, not proof that every finding is exploitable in the application. It is nevertheless treated as an engineering constraint and is one reason this repository is **not described as production-ready**.

Dependency remediation is tracked in [`ROADMAP.md`](./ROADMAP.md).

## Current security boundaries visible in source

The current implementation includes useful security behavior such as bcrypt password hashing and authenticated route checks, but also contains historical/custom infrastructure that needs review before deployment claims:

- custom static-file serving;
- custom cookie parsing/serialization;
- no demonstrated CSRF layer for state-changing browser forms;
- incomplete security test coverage.

These are documented boundaries rather than hidden issues.

## Evidence rule

Future capabilities belong in the roadmap until implementation, tests/reproducible verification and documentation exist.
