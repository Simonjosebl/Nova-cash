# Testing Strategy (Cap. 10)

Los tests son parte del desarrollo, no opcional. Probar **comportamiento**, no implementación. Rápidos, deterministas, independientes.

## Pirámide

70% unit · 20% integración · 10% E2E. Nunca depender solo de E2E.

## Cobertura mínima

Global **85%** · Services/Repositories **95%** · Business Rules **100%** · Nova Insights **100%** · Auth **100%** · Permisos **100%**. Ningún PR puede reducir cobertura.

## Herramientas

- **Vitest** (unit): services, utils, validaciones Zod, hooks, motores de cálculo, Insights. No probar componentes visuales con unit tests.
- **React Testing Library** (component).
- **Playwright** (E2E): login, crear workspace/cuenta/categoría, registrar gasto/ingreso, meta, presupuesto, invitar/aceptar, logout.

## Convenciones

Cada módulo tiene `tests/`. Nombres `*.test.ts` (`transaction.service.test.ts`, `transaction.integration.test.ts`). Mockear Supabase, Edge Functions, push, storage, fecha/hora, UUID. Nunca llamadas reales en unit tests ni datos de producción.

ADRs 041–048.
