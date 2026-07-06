# Nova Cash

> "Las personas no necesitan otra aplicación para registrar gastos. Necesitan comprender mejor su dinero."

Aplicación móvil de finanzas **personales y colaborativas** (iOS primero, vía Capacitor). El objetivo del producto: que un usuario abra la app y **comprenda su situación financiera en menos de 5 segundos**, y registre un movimiento en **menos de 20 segundos**.

- **Estado:** `0.5.0` — MVP funcional completo (Fases 0–13). Release Candidate: código listo; validación pendiente en backend/iOS real ([checklist](./docs/roadmap/RELEASE_CANDIDATE.md)).
- **Fuente única de verdad:** [`PRODUCT.MD`](./PRODUCT.MD) — ninguna decisión de producto, arquitectura, diseño, datos, UX o negocio puede contradecirlo. Si algo no está documentado ahí, primero se documenta y luego se implementa.

---

## Stack oficial (Cap. 2.3 / 7.3)

| Capa        | Tecnología                                                               |
| ----------- | ------------------------------------------------------------------------ |
| Frontend    | React 19 · TypeScript (strict) · Vite                                    |
| Mobile      | Capacitor (iOS primero, Android preparado)                               |
| Backend     | Supabase (Auth · PostgreSQL · Storage · Edge Functions · Realtime · RLS) |
| Estado      | TanStack Query (servidor) · Zustand (global) · React (local)             |
| Formularios | React Hook Form · Zod                                                    |
| UI          | TailwindCSS · shadcn/ui · Framer Motion · Lucide                         |
| Testing     | Vitest · React Testing Library · Playwright                              |
| Calidad     | ESLint · Prettier · Husky · lint-staged · Commitlint                     |

## Arquitectura (Cap. 2)

**Feature First** — organizado por dominio, no por tipo de archivo. Flujo de datos estricto y unidireccional:

```
UI → Hook → Service → Repository → Supabase → PostgreSQL
```

- Ningún componente accede a Supabase directamente.
- La lógica de negocio vive **solo** en Services.
- Toda comunicación con Supabase pasa por Repositories.
- El **Workspace** es el núcleo del dominio: todo pertenece a un Workspace.

## Estructura del repositorio

```
nova-cash/
├── PRODUCT.MD          # Documento maestro (fuente única de verdad)
├── CLAUDE.md           # Reglas para desarrollo asistido por IA
├── docs/               # Documentación derivada del PRODUCT BOOK
├── assets/             # Marca: logos, iconos, favicon, splash (fuentes)
├── public/             # Estáticos servidos por la web
├── scripts/            # Utilidades de desarrollo
├── supabase/           # Migraciones, functions, policies, seeds
├── src/                # Código de la aplicación
│   ├── app/            # App.tsx, providers, router, theme, navigation
│   ├── shared/         # Reutilizable (sin lógica de negocio)
│   ├── modules/        # Dominios (auth, dashboard, transactions, ...)
│   ├── config/  lib/  styles/  assets/  types/  constants/
├── .github/            # CI/CD y plantillas
└── .vscode/            # Configuración del editor
```

Ver [`docs/`](./docs) para el detalle de cada área y [`docs/roadmap/`](./docs/roadmap) para el plan de fases.

## Desarrollo por fases (Cap. 12)

El orden **nunca se altera**. Cada fase deja una app funcional y estable.

`0 Foundation → 1 Auth → 2 Workspace → 3 Dashboard → 4 Accounts → 5 Categories → 6 Transactions → 7 Calendar → 8 Budgets → 9 Goals → 10 Reports → 11 Collaborators → 12 Notifications → 13 Polish → Release`

## Marca / Logos

Las carpetas de marca están en [`assets/brand/`](./assets/brand). Coloca los logos originales en `assets/brand/source/` y sigue la guía de generación en [`docs/branding/README.md`](./docs/branding/README.md) para producir favicon `.ico`, iconos de app iOS y splash screens.
