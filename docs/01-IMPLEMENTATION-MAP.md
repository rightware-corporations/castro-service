# Implementation Map

| Current state | Required state | Gap | Implementation action |
|---|---|---|---|
| Repository contained only README.md | Functioning backend under `/backend` | Entire application absent | Added Maven/Spring Boot foundation |
| No database or migrations | PostgreSQL + Flyway | No schema authority | Added V1 schema, indexes, constraints |
| No public contract | Versioned REST + OpenAPI | No DTOs/endpoints | Added catalog, availability, booking, request, auth controllers |
| No security model | Secure foundation | No identity model | Added persisted users, BCrypt, session security; permission model remains partial |
| No conflict protection | Atomic booking protection | No booking engine | Added availability service and PostgreSQL exclusion constraint |
| No deployment setup | Reproducible local infra | No Docker files | Added Dockerfile, compose, and env example |
