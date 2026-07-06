# Deployment & DevOps (Cap. 11)

Despliegue repetible, automatizado, seguro, trazable y reversible. Nunca cambios manuales en producción.

> **🚀 Runbook paso a paso:** [`SETUP.md`](./SETUP.md) — de código a producción (Supabase, web, iOS, CI/CD).
> **Checklist de release:** [`../roadmap/RELEASE_CANDIDATE.md`](../roadmap/RELEASE_CANDIDATE.md).

## Ambientes (independientes)

`Development` (nova-cash-dev) · `Staging` (nova-cash-stage) · `Production` (nova-cash-prod). Nunca compartir recursos entre ambientes.

## Ramas

`main` (prod) · `develop` (integración) · `feature/* · fix/* · hotfix/* · release/*`. Nunca sobre `main`.

## CI (cada push / PR)

1. Instalar deps → 2. ESLint → 3. Prettier → 4. TypeScript check → 5. Unit tests → 6. Integration tests → 7. Build web → 8. Validación Capacitor → 9. Cobertura. Si algo falla, no hay merge.

## CD

Development: deploy automático · Staging: automático tras merge a `develop` · **Production: manual mediante Release**. Nunca deploy automático a producción.

## Releases

Semantic Versioning (`vMAJOR.MINOR.PATCH`). Cada release: changelog, migraciones, riesgos, notas de despliegue.

## Migraciones

`YYYYMMDD_HHMM_descripcion.sql`. Reversibles cuando se pueda, probadas en dev, validadas en staging, luego producción. Nunca editar migraciones antiguas. Backup antes de migraciones críticas.

## iOS (MVP)

Sin App Store aún: TestFlight / Ad Hoc. Compilación con Xcode; Capacitor como puente. Certificados fuera del repo.

## Variables de entorno

Públicas: `VITE_APP_NAME, VITE_APP_VERSION, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY`.
Privadas: `SUPABASE_SERVICE_ROLE_KEY, SMTP_*, APPLE_TEAM_ID, APPLE_CERTIFICATE, APPLE_PROFILE`. Nunca en el repo.

ADRs 049–056.
