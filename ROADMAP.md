# Task Manager — Product & Engineering Roadmap

This roadmap records how the current Fastify task manager can evolve into stronger full-stack engineering evidence. Planned items are deliberately separated from implemented capabilities.

## Status legend

- ✅ **Implemented / evidenced** — present in source and/or observed in CI.
- 🔄 **Priority engineering direction** — reasonable next work for the existing codebase.
- 🧭 **Strategic evolution** — possible future capability; not a current claim or delivery commitment.

Current evidence lives in [`README.md`](./README.md) and [`ENGINEERING_EVIDENCE.md`](./ENGINEERING_EVIDENCE.md).

## 1. Current baseline

- ✅ Fastify 5 server-rendered application.
- ✅ SQLite persistence with Knex migrations and Objection.js integration.
- ✅ Users, task statuses, labels and task workflows.
- ✅ bcrypt password hashing.
- ✅ authenticated route checks for protected operations.
- ✅ Pug rendering and English/Spanish i18next resources.
- ✅ isolated in-memory SQLite test setup.
- ✅ independent GitHub Actions quality gate.
- ✅ observed `npm test` PASS and Webpack production build PASS.

## 2. Security and dependency hardening

This is the highest-value engineering track before any production-readiness claim.

- 🔄 Reduce current npm audit findings through dependency review and controlled upgrades.
- 🔄 Replace custom static-file path handling with a reviewed static-serving boundary or explicit path containment checks.
- 🔄 Standardize cookie/session handling using maintained Fastify primitives rather than ad-hoc helpers.
- 🔄 Define secure defaults for `HttpOnly`, `Secure` and `SameSite` based on environment.
- 🔄 Add CSRF protection if browser-session state-changing forms remain part of the architecture.
- 🔄 Add authorization tests for update/delete operations and ownership boundaries.
- 🔄 Validate login/session fixation and logout invalidation behavior.
- 🧭 Add dependency/secret scanning suitable for the repository.
- 🧭 Add a lightweight threat model for authentication and task-management flows.

## 3. Test architecture

- 🔄 Expand beyond the current task-filtering test into CRUD and authorization behavior.
- 🔄 Add user registration/login/logout tests.
- 🔄 Add status/label lifecycle tests.
- 🔄 Add negative-path validation tests.
- 🧭 Add HTTP-level integration tests through Fastify injection.
- 🧭 Add browser smoke tests for representative workflows only if they provide value beyond server integration tests.
- 🧭 Track coverage as a diagnostic signal, not as a vanity target.

## 4. Application architecture

- 🔄 Consolidate legacy/compatibility artifacts after verifying no grading/runtime dependency remains.
- 🔄 Keep route handlers thin by moving reusable validation/application logic behind focused services/use cases where complexity warrants it.
- 🔄 Define a consistent error/validation contract across form flows.
- 🧭 Introduce schema validation for request inputs using a Fastify-compatible approach.
- 🧭 Add pagination/filtering abstractions if task volume grows.
- 🧭 Introduce PostgreSQL only if deployment/use-case requirements justify moving beyond SQLite.

## 5. Product evolution

Potential additions that fit the current task-management domain:

- 🧭 richer task priorities and due dates;
- 🧭 task comments/activity history;
- 🧭 audit-friendly change history;
- 🧭 role-aware permissions;
- 🧭 project/workspace grouping;
- 🧭 saved filters/search;
- 🧭 notification preferences;
- 🧭 import/export of synthetic/demo task data.

None of these capabilities are represented as implemented until source and tests exist.

## 6. UX and accessibility

- 🔄 review form errors and empty states for consistency;
- 🔄 keyboard and semantic accessibility review;
- 🔄 responsive layout verification;
- 🧭 sanitized screenshots/demo walkthrough for portfolio review;
- 🧭 automated accessibility smoke checks if the UI becomes a featured showcase.

## 7. Operations and release maturity

- 🧭 production configuration contract;
- 🧭 health/readiness endpoint;
- 🧭 structured observability and log redaction policy;
- 🧭 Docker/runtime image only if deployment is maintained;
- 🧭 database backup/migration procedure for a deployed environment;
- 🧭 CHANGELOG/versioned releases once releases become meaningful.

## Promotion rule

A roadmap item becomes ✅ only after its implementation is versioned, relevant verification exists, documentation is updated, and the quality gate remains green.
