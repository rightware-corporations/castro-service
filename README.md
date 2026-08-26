# Castro's Digital Platform Backend

This repository now contains the first backend foundation under `/backend`, with local PostgreSQL infrastructure under `/infra`, architecture and deployment documentation under `/docs`, and the frontend left untouched.

The implementation is intentionally a strong foundation rather than a claim that every future platform feature is complete. Permission bundles, organization-membership enforcement, content/media/outbox/audit models, administrative CRUD, rate limiting, and PostgreSQL integration/concurrency tests remain follow-up work.

See [the implementation map](docs/01-IMPLEMENTATION-MAP.md), [the API contract](docs/03-API-CONTRACT.md), [security notes](docs/04-SECURITY.md), and [deployment guidance](docs/08-DEPLOYMENT.md).
