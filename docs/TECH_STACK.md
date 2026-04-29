# Tech Stack Decision Record
**Date:** 2026-04-29  
**Status:** Final

---

## Decision Summary

| Layer | Choice | Version |
|-------|--------|---------|
| Backend framework | NestJS | 10.x |
| ORM | TypeORM | 0.3.x |
| Database | PostgreSQL | 16 |
| Frontend framework | React | 18.x |
| Frontend build tool | Vite | 5.x |
| Language | TypeScript (both) | 5.x |
| Styling | Tailwind CSS | 3.4.x |
| HTTP client | Axios | 1.6.x |
| Runtime | Node.js | 20.x |
| Package manager | npm | 10.x |
| Container | Docker + Docker Compose | 24.x / v2 |
| Testing | Jest (via NestJS) | Built-in |

---

## Why NOT TanStack Start

TanStack Start is a full-stack SSR meta-framework. The exercise requires:
> "an isolated app, in a separate folder, with its own package.json and dependencies"

TanStack Start couples server and client together — using it would either violate this constraint or require hacky workarounds. Economic verdict: **wrong tool, wrong tradeoff.**

## Why NOT Django or Laravel

The exercise explicitly warns:
> "Laravel and Django DO NOT SUPPORT layer separation by default"

Both would require significant architectural work to implement Controller/Service/Repository properly. NestJS enforces this via its DI container at zero extra cost.

## Why NOT Spring Boot

Spring Boot is technically ideal for the architecture pattern. However:
- JVM cold-start adds complexity to the Docker setup
- Java syntax overhead slows a 10-hour sprint vs TypeScript
- No benefit over NestJS for this scope

## Why NOT Prisma (ORM alternative)

Prisma requires a separate schema file and migration step that adds friction. TypeORM's decorator-based entities integrate directly into NestJS's DI system — one less thing to configure.

## Why NOT Auth (Clerk, Firebase Auth, etc.)

The exercise marks login as optional:
> "If you provide a login screen, document the default user/password"

Adding auth (Clerk or otherwise) would consume 1-2 hours with no mandatory payoff. Verdict: skip auth, document "no auth" in README.

## Why synchronize: true (TypeORM)

`synchronize: true` auto-creates/alters tables from entity definitions on startup. This:
- Eliminates migration boilerplate for MVP development
- Is **unsafe in production** (can drop columns on schema change)
- Production path: set `synchronize: false`, use `typeorm migration:run`

This is a known, intentional tradeoff documented here for explainability.

