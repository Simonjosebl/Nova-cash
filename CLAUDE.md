# CLAUDE.md — Reglas de desarrollo asistido por IA

Este archivo gobierna cómo cualquier asistente de IA (o desarrollador) trabaja en Nova Cash.
La **fuente única de verdad** es [`PRODUCT.MD`](./PRODUCT.MD). Este archivo solo resume las reglas operativas (Cap. 7.10 / 7.12).

## Regla de oro

Si una regla de negocio, componente, color, tabla o decisión **no existe** en `PRODUCT.MD`,
**no se implementa**: primero se documenta en `PRODUCT.MD` (o en `docs/adr/`), luego se construye.

## Claude / IA SIEMPRE debe

- Crear código modular; un archivo, una responsabilidad.
- Usar **TypeScript strict**. Prohibido `any` y `eslint-disable`.
- Respetar el flujo `UI → Hook → Service → Repository → Supabase`.
- Poner la lógica de negocio **solo** en Services; persistencia **solo** en Repositories.
- Respetar el Design System (tokens, espaciado de 8pt, emojis como identidad).
- Respetar los ADR (`docs/adr/`).
- Generar auditoría en toda acción importante.
- Escribir pruebas (ver cobertura mínima en Cap. 10).

## Claude / IA NUNCA debe

- Modificar la arquitectura ni inventar patrones.
- Que un componente consulte Supabase directamente.
- Crear tablas, colores o componentes fuera del sistema documentado.
- Duplicar lógica, dejar `console.log` en producción, `TODO` o `FIXME`.
- Componentes > 250 líneas · hooks > 150 líneas · services gigantes.
- Asumir reglas de negocio no documentadas.
- Alterar el orden de las fases (Cap. 12).

## Convenciones (Cap. 2.10 / 7.5)

| Elemento          | Estilo                    | Ejemplo                    |
| ----------------- | ------------------------- | -------------------------- |
| Archivos          | camelCase                 | `useTransactions.ts`       |
| Componentes       | PascalCase                | `DashboardCard.tsx`        |
| Hooks             | `useX`                    | `useTransactions`          |
| Services          | PascalCase + `Service`    | `TransactionService.ts`    |
| Repositories      | PascalCase + `Repository` | `TransactionRepository.ts` |
| Schemas           | `x.schema.ts`             | `transaction.schema.ts`    |
| Types             | `x.types.ts`              | `transaction.types.ts`     |
| Interfaces        | `IX`                      | `ITransaction`             |
| Constantes        | UPPER_CASE                | `MAX_MEMBERS`              |
| Tablas / columnas | snake_case                | `workspace_members`        |

Prohibidos nombres genéricos: `utils.ts`, `helpers.ts`, `misc.ts`.

## Estructura de un módulo (idéntica para todos)

```
modules/<dominio>/
  components/  pages/  hooks/  services/  repositories/
  schemas/  store/  types/  constants/  utils/  tests/  dto/
```

Nunca importar archivos internos de otro módulo. La comunicación es mediante servicios públicos.

## Flujo de trabajo de una funcionalidad (Cap. 7.7)

`Diseñar → Schema → Types → Repository → Service → Hook → UI → Testing`.
Nunca comenzar por la interfaz.

## Git (Cap. 7.8 / 7.9)

- Ramas: `main` (prod), `develop` (integración), `feature/*`, `fix/*`, `hotfix/*`, `release/*`. Nunca trabajar sobre `main`.
- Commits convencionales: `feat: · fix: · refactor: · style: · docs: · test: · perf: · build: · ci:`.
