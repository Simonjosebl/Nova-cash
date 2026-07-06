# Plan de ejecución por fases (Cap. 12)

> **ADR-057:** desarrollo incremental por fases. **ADR-058:** ninguna fase inicia con la anterior incompleta. El orden **nunca se altera**.

Cada fase deja una app **funcional, estable e integrada**. Cada funcionalidad debe cumplir su _Definition of Done_ (flujo, Design System, arquitectura, validaciones, estados vacíos, loading, errores, auditoría, Nova Insights cuando aplique, tests y documentación).

## Orden oficial y tracker de estado

| #   | Fase                         | Objetivo                                  | Entregables clave                                                                                                                                     | Estado                                                                                   |
| --- | ---------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 0   | **Foundation**               | Preparar el proyecto                      | Vite+React19+TS strict, Capacitor(iOS), Supabase, Tailwind+shadcn, TanStack Query, Zustand, RHF+Zod, ESLint/Prettier/Husky/Commitlint, tema, envs, CI | ✅ Completa                                                                              |
| 1   | **Authentication**           | Acceso seguro                             | Login, registro, magic link, recuperación, persistencia de sesión, perfil                                                                             | ✅ Completa                                                                              |
| 2   | **Workspace**                | Núcleo financiero                         | Crear/editar workspace, configuración, roles, invitaciones, gestión de miembros                                                                       | ✅ Completa                                                                              |
| 3   | **Dashboard**                | Pantalla principal                        | Header, saldo, resumen, próximos pagos, categorías, actividad, Nova Insights, FAB                                                                     | ✅ Completa (shell)                                                                      |
| 4   | **Accounts**                 | Cuentas                                   | Crear/editar/archivar, balance, reordenar                                                                                                             | ✅ Completa                                                                              |
| 5   | **Categories**               | Categorías                                | Crear/editar/eliminar/reordenar, emoji, tipo                                                                                                          | ✅ Completa                                                                              |
| 6   | **Transactions**             | Motor financiero (la fase más importante) | Gasto/ingreso/transferencia, historial, filtros, adjuntos, auditoría, actualización en cascada (Dashboard/Budgets/Calendar/Goals/Insights)            | ✅ Completa                                                                              |
| 7   | **Calendar**                 | Calendario financiero                     | Vista mensual, eventos, gastos fijos, recordatorios, registrar desde calendario                                                                       | ✅ Completa                                                                              |
| 8   | **Budgets**                  | Presupuestos                              | Presupuestos, progreso, alertas, excedidos                                                                                                            | ✅ Completa                                                                              |
| 9   | **Goals**                    | Metas                                     | Crear meta, ahorrar, progreso, completar                                                                                                              | ✅ Completa                                                                              |
| 10  | **Reports**                  | Analítica                                 | Barras, donut, línea, comparativas, filtros, tendencias                                                                                               | ✅ Completa                                                                              |
| 11  | **Collaborators**            | Colaboración                              | Invitar, roles, eliminar, historial colaborativo, auditoría                                                                                           | ✅ Completa                                                                              |
| 12  | **Notifications**            | Notificaciones                            | Push, locales, recordatorios, metas, presupuestos, insights                                                                                           | ✅ Completa (in-app; push nativo diferido)                                               |
| 13  | **Polish**                   | Versión final                             | Optimización, accesibilidad, animaciones, skeletons, estados vacíos, performance, revisiones UX/UI/Arquitectura/Seguridad                             | ✅ Completa                                                                              |
| —   | **Release Candidate → v1.0** | Publicación                               | Checklist RC completo, iOS probado, flujo E2E validado                                                                                                | 🟡 Listo en código; validación en backend/iOS real ([checklist](./RELEASE_CANDIDATE.md)) |

Leyenda: ⬜ Pendiente · 🟡 En curso · ✅ Completa

### Fase 1 — Authentication: entregado

- Módulo `auth/` completo con capas `schemas → types → repository → service → hooks → pages` (Cap. 7.7).
- **AuthRepository** aísla Supabase (traduce `User → AuthUser` y errores → `AppError`); **AuthService** agnóstico e inyectable.
- Flujos: **login**, **registro**, **magic link**, **recuperación** y **reset** de contraseña, **perfil** (editar nombre, logout).
- Persistencia de sesión vía Supabase + `AuthProvider` (bootstrap y `onAuthStateChange`) → store Zustand.
- Rutas protegidas con guards (`RequireAuth` / `RedirectIfAuth`) + Splash mientras resuelve sesión.
- Primitivos de Design System añadidos: `Input`, `Label`, `TextField`; `AppError` transversal.
- **28 tests** (schemas, mapeo de errores, AuthService con repo mock). lint/typecheck/build/format en verde.
- Nota: **Apple Sign In** (Cap. 9.4) se difiere hasta configurar el proyecto iOS nativo (requiere macOS/Xcode).

### Fase 2 — Workspace: entregado

- **Base de datos (primera vez):** 4 migraciones versionadas (`profiles`, `workspaces`, `workspace_members`, `workspace_invitations`, `settings`) con UUID, `created_at/updated_at/deleted_at`, índices en FK, enums de dominio y triggers (`updated_at`, alta de perfil en signup, owner→admin, settings auto).
- **RLS desde el día 1 (ADR-018/034):** todas las tablas con policies que parten de la membresía; funciones helper `current_profile_id`, `is_workspace_member`, `is_workspace_admin` (SECURITY DEFINER, sin recursión). Documentado en `supabase/policies/`.
- **Módulo `workspace/`:** repository (aísla Supabase, mapea filas), service (reglas RB-003 límite de colaboradores, duplicados), store activo (Zustand persistido), hooks (TanStack Query con invalidaciones).
- **UI:** crear workspace (Cap. 6.5), configuración/editar, colaboradores (roles, invitar, invitaciones pendientes), **WorkspaceSwitcher** (multi-workspace, R-01). Primitivos añadidos: `Select`, `Card`.
- **Gating (Cap. 6.2):** `WorkspaceGate` — sin workspace → crear; con workspace → inicio, con sincronización de workspace activo.
- **11 tests nuevos** (schemas + WorkspaceService con repo mock); total **39**. lint/typecheck/build/format en verde.
- Pendiente de backend real: aplicar migraciones vía Supabase CLI y validar RLS end-to-end (requiere proyecto Supabase). **Aceptar invitación** (Edge Function) se implementa en Fase 11.

### Fase 3 — Dashboard: entregado (shell)

- **Motor Nova Insights** (Cap. 4.17/6.7/20) — el diferenciador: reglas puras (NO IA) con prioridades (crítico→advertencia→motivacional→informativo), máx. 3, sin repetidos, sin mensajes negativos. **10 tests** (objetivo 100% cobertura del motor).
- **DashboardService.loadDashboard()** — arma todo en UNA llamada (Cap. 8): saldo, resumen, próximos pagos, categorías, actividad, insights. `DashboardRepository` es placeholder (agregados vacíos) hasta conectar transacciones en Fase 6, sin cambiar la interfaz.
- **UI (Cap. 3.16):** header (saludo + switcher), Nova Insight, saldo (display), resumen 3 tarjetas, próximos pagos, categorías, actividad — cada sección con **skeleton** de carga y **estados vacíos** humanos (nunca pantalla en blanco).
- **FAB** (gradiente Blue→Cyan) + **BottomSheet** (drag handle, spring) con el menú de acciones (activas en Fase 6).
- **Shell de navegación:** bottom tab de 5 (Cap. 6.21) + `AppLayout`; Movimientos/Calendario/Reportes muestran placeholder "muy pronto".
- Primitivos añadidos: `Skeleton`, `EmptyState`, `BottomSheet`, `Fab`, util `formatMoney`.
- **53 tests** en total. lint/typecheck/build/format en verde.
- El Dashboard nace con datos vacíos (insight de bienvenida "registra tu primer movimiento") y se llenará automáticamente al llegar Accounts/Categories/Transactions (Fases 4-6).

### Fase 4 — Accounts: entregado

- **DB:** migración `accounts` (enum `account_type`, saldos `numeric(14,2)`, posición, archivado, soft delete) + índices + trigger `updated_at` + trigger que inicializa `current_balance = opening_balance`. Nuevo helper RLS `is_workspace_editor` (admin/editor escriben; viewer solo lee).
- **Módulo `accounts/`:** repository (aísla Supabase, mapea `numeric`), service (posición automática, archivar/desarchivar, reordenar, soft delete), hooks con invalidación de `accounts` **y** `dashboard`.
- **UI (Cap. 6.8):** `AccountsPage` con saldo total, lista, reordenar (flechas), archivadas; `AccountFormSheet` (bottom sheet crear/editar + archivar/eliminar); `AccountCard`. Primitivos añadidos: `AmountInput`, `EmojiPicker` (compartido).
- **Integración:** ruta `/accounts`, acceso desde el hub del Perfil; **el saldo del Dashboard ya suma las cuentas** (el `DashboardRepository` consulta `accounts`). Resumen/categorías/actividad siguen esperando transacciones (Fase 6).
- Permisos por rol en la UI (editor/admin gestionan; viewer solo lee), reforzados por RLS.
- **8 tests nuevos** (schema + `AccountService` con repo mock); total **61**. lint/typecheck/build/format en verde.

### Fase 5 — Categories: entregado

- **DB:** migración `categories` (enum `category_type` income/expense, emoji, posición por tipo, `is_default`, soft delete) + índices + RLS (miembro lee; editor/admin escriben).
- **Módulo `categories/`:** repository, service (posición **por tipo**, reordenar, soft delete), hooks. Sin auto-siembra: no hay categorías obligatorias (Cap. 4.9).
- **UI (Cap. 6.9):** `CategoriesPage` con **SegmentControl** Gastos/Ingresos, lista reordenable, crear/editar/eliminar vía `CategoryFormSheet`. Solo emojis, nunca iconos (Cap. 3.13). Primitivo nuevo: `SegmentControl`.
- **Integración:** ruta `/categories` + acceso desde el hub del Perfil.
- **8 tests nuevos** (schema + `CategoryService` con repo mock, incluida la posición independiente por tipo); total **69**. lint/typecheck/build/format en verde.

### Fase 6 — Transactions: entregado (la fase más importante)

- **DB:** migración `transactions` (enums tipo/estado, `to_account_id` para transferencias, `check` monto>0 y coherencia de transferencia, índices) + **trigger de cascada de saldos** (`apply_transaction_to_balance`: reversa el efecto anterior y aplica el nuevo — cubre insert/update/delete/soft-delete; income +, expense −, transfer origen−/destino+). Migración `audit_logs` con **trigger de auditoría inmutable** (before/after en JSONB) y RLS solo-admin (Cap. 5.11/9.16, ADR-021/037).
- **Módulo `transactions/`:** repository (joins a cuenta y categoría, filtros, paginación), service (normaliza por tipo — RB-007/015), hooks con **invalidación en cascada** (transacciones → cuentas → dashboard, Cap. 6.10).
- **UI:** `TransactionFormSheet` (gasto/ingreso/transferencia en un solo formulario con `SegmentControl`, categorías filtradas por tipo, cuenta origen/destino) **conectado al FAB**; `TransactionsPage` (historial cronológico agrupado por día, filtros por tipo y búsqueda, editar/eliminar). Ingreso en verde; el gasto **no** es rojo (Cap. 3.5).
- **Cascada real:** al registrar un movimiento se mueven los **saldos de las cuentas** (trigger) y el **Dashboard** muestra resumen (ingresos/gastos/disponible del mes), **categorías** (top 5 con %), **actividad reciente** y alimenta **Nova Insights** (hasTransactions, días sin registrar, gasto vs mes anterior). Transferencias excluidas del resumen (RB-007).
- **9 tests nuevos** (schema con reglas RB-014/015/007 + `TransactionService`); total **78**. lint/typecheck/build/format en verde.
- Pendiente: adjuntos (Storage) y validación end-to-end del trigger/RLS requieren proyecto Supabase; se difieren a la integración de backend real.

### Fase 7 — Calendar: entregado

- **DB:** migraciones `calendar_events` + `recurring_transactions` (enums `event_status` / `recurrence_frequency`, enlaces a transacción y recurrente) con índices y RLS (miembro lee; editor/admin escriben).
- **Módulo `calendar/`:** repository, service (registrar pago → **crea la transacción real** vía `TransactionService` y marca el evento como pagado; gasto fijo → genera la ocurrencia del mes siguiente al pagar), hooks con invalidación en cascada.
- **UI (Cap. 3.17 / 6.11):** `CalendarPage` con vista mensual (semana inicia lunes), **emojis por día — nunca puntos**; hoja del día; `EventFormSheet` (crear/editar, "repetir cada mes"); `EventDetailSheet` (registrar pago, posponer, editar, cancelar, eliminar).
- **Integración:** ruta de la pestaña Calendario + **los "próximos pagos" del Dashboard ahora salen de los eventos pendientes** (próximos 14 días), lo que activa el Nova Insight "hoy vence …".
- **15 tests nuevos** (utils de fecha, schema, `CalendarService` con `TransactionService` mockeado — registrar pago y recurrencia); total **93**. lint/typecheck/build/format en verde.
- Nota: la generación automática de recurrentes en segundo plano será una Edge Function (Cap. 5.15); en el MVP la siguiente ocurrencia se crea al registrar el pago.

### Fase 8 — Budgets: entregado

- **DB:** migración `budgets` (enum `budget_period`, `warning_percentage`, `unique(workspace, category)`, RLS editor).
- **Módulo `budgets/`:** repository (lista + gasto por categoría del mes), service que calcula **avance y estado** (normal / advertencia / excedido) según umbral, hooks con invalidación de budgets + dashboard.
- **UI (Cap. 6.12):** `BudgetsPage` con **barras de progreso** coloreadas por estado (verde/naranja/rojo), `BudgetFormSheet` (categoría de gasto sin presupuesto previo, monto, umbral %). Primitivo nuevo: `ProgressBar`.
- **Integración con Nova Insights:** los presupuestos ahora alimentan el motor (Dashboard) — se disparan los insights "tu presupuesto de 🍔 Comida está al 82%" (advertencia) y "excediste tu presupuesto" (crítico), que antes llegaban vacíos.
- **7 tests nuevos** (schema + `BudgetService`: estados y orden por %); total **100**. lint/typecheck/build/format en verde.

### Fase 9 — Goals: entregado

- **DB:** migraciones `goals` + `goal_contributions` con **trigger** que mantiene `current_amount` (suma de aportes). RLS editor.
- **Módulo `goals/`:** repository, service (avance %, **aportar/retirar** con guarda de saldo no negativo RB-008, **auto-completar** al alcanzar la meta), hooks con invalidación de metas + dashboard.
- **UI (Cap. 6.13):** `GoalsPage` con progreso (barra + monto, nunca solo el %), `GoalFormSheet` (crear/editar/eliminar), `GoalDetailSheet` (aportar/retirar).
- **Cierra el último input de Nova Insights:** las metas activas alimentan el motor → insight _"solo faltan $X para tu meta ✈️ Japón"_ cuando el avance ≥ 90%. **El motor ya recibe todas sus entradas** (transacciones, calendario, presupuestos, metas).
- **7 tests nuevos** (schema + `GoalService`: avance, aportar/retirar, auto-completar, guarda RB-008); total **109**. lint/typecheck/build/format en verde.

### Fase 10 — Reports: entregado

- **Módulo `reports/`:** `ReportService` agrega transacciones por periodo (este mes / mes anterior / 6 meses) → resumen (ingresos/gastos/balance), **gasto por categoría** (top 6 + "Otros") y **tendencia mensual**. Transferencias excluidas (RB-007). Sin nueva consulta pesada: un `ReportRepository.fetchRange`.
- **Gráficos sin dependencias** (Cap. 6.14 "muy simples", ADR-7.3 no agregar deps): `DonutChart` con `conic-gradient` + leyenda, `TrendChart` (barras ingresos vs gastos en CSS). Reemplaza el placeholder de la pestaña Reportes.
- **UI:** `ReportsPage` con `SegmentControl` de periodo, tarjetas de resumen, tendencia y donut; estados de carga y vacío.
- Se eliminó `ComingSoon` (ya no queda ninguna pestaña pendiente: Movimientos, Calendario y Reportes están implementados).
- **4 tests nuevos** (`ReportService`: sumas, exclusión de transferencias, donut con "Otros", tendencia); total **113**. lint/typecheck/build/format en verde.

### Fase 11 — Collaborators: entregado

- **Primera Edge Function (Deno):** `supabase/functions/accept-invitation` (Cap. 5.15 / 9.9 / 9.14) — valida JWT del invitado, token pendiente/no expirado y correo coincidente; agrega al miembro con **service role** (upsert idempotente) y marca la invitación aceptada. `supabase/` excluido de ESLint (runtime Deno).
- **Aceptar invitación (cliente):** `WorkspaceRepository.acceptInvitation` → `supabase.functions.invoke`; `AcceptInvitationPage` en `/invite/:token` (auto-acepta al abrir el enlace, activa el workspace unido).
- **Historial colaborativo:** `AuditRepository` lee `audit_logs` (RLS solo-admin) + `buildAuditDescription` (frase humana quién/qué); `HistoryPage` muestra la actividad reciente. Gestión de miembros/roles ya venía de Fase 2.
- Accesos desde el hub del Perfil (Colaboradores, Historial).
- **2 tests nuevos** (`buildAuditDescription`) + mock de repo actualizado; total **115**. lint/typecheck/build/format en verde.
- Nota: la **entrega del correo** de invitación (Edge Function `send-email`/SMTP) queda para la integración de backend real; hoy la invitación se crea y el enlace `/invite/:token` funciona.

### Fase 12 — Notifications: entregado (in-app; push nativo diferido)

- **DB:** migración `notifications` (enum `notification_priority`, `profile_id` opcional para dirigidas, RLS por miembro/destinatario) + **trigger de ejemplo** `notify_goal_completed` (al completar una meta se genera notificación) — muestra la generación server-side (Cap. 5.10).
- **Módulo `notifications/`:** repository (list, marcar leída/todas, eliminar), service (+ `unreadCount`), hooks; **centro in-app** `NotificationsPage` con no-leídas resaltadas, marcar todo leído y eliminar.
- **Badge de no leídas** (🔔) en el header del Dashboard, con enlace al centro.
- **Abstracción de push** `PushService` (interfaz + `WebPushService` que reporta "unsupported"): aísla los plugins nativos de Capacitor/APNs (Cap. 2.7 / 11.11), que se conectan al compilar iOS — la app web funciona con push deshabilitado.
- **3 tests nuevos** (`unreadCount`, delegación, `WebPushService`); total **118**. lint/typecheck/build/format en verde.
- Diferido a entorno nativo/backend: push real (APNs + `@capacitor/push-notifications`), notificaciones locales y el job de recordatorios (Edge Function/cron `generate-insights`).

### Fase 13 — Polish: entregado

- **Optimización / performance (Cap. 2.18 / 7.11):** **code-splitting** — cada página se carga con `React.lazy` + `Suspense` (fallback Splash) y las libs grandes van a chunks propios (`vendor-supabase`, `vendor-motion`, `vendor-query`); `index` bajó de 822 KB a **443 KB** y desapareció el aviso de tamaño.
- **Robustez:** `ErrorBoundary` de app — ante un error de render muestra una pantalla humana (nunca en blanco), lista para conectar logging (Sentry).
- **Accesibilidad (Cap. 3.22):** soporte de `prefers-reduced-motion`, focus visible y touch targets ya presentes; ruta catch-all (`*`) que redirige al inicio.
- **PWA:** `manifest.webmanifest` + metas iOS usando los iconos de marca (instalable).
- **RC:** checklist en [`RELEASE_CANDIDATE.md`](./RELEASE_CANDIDATE.md) — código verificado (lint/typecheck/tests/build ✅); pendientes de backend/iOS real claramente marcados.
- Total **118 tests**; lint/typecheck/build/format en verde. **MVP funcional completo.**

## Fase 0 — Foundation: desglose

1. ✅ `package.json` con el stack oficial (sin dependencias no justificadas — ADR).
2. ✅ Vite 6 + React 19 + TypeScript **strict** (`strict`, `noUncheckedIndexedAccess`, sin `any`).
3. ✅ TailwindCSS 3 + fundación shadcn/ui (`components.json`, `cn`, `Button`) + tokens del Design System (Cap. 3).
4. ✅ Providers base en `src/app/` (TanStack Query, router, store Zustand de tema).
5. ✅ Cliente Supabase en `src/lib/` + `env` tipado + `.env.example` (Cap. 9.18 / 11.4).
6. ✅ ESLint (flat, `no-explicit-any`) + Prettier + Husky + lint-staged + Commitlint + EditorConfig.
7. ✅ Vitest + RTL (6 tests) + Playwright configurado (smoke E2E).
8. ✅ Capacitor (`capacitor.config.ts`, target iOS; Android preparado) + iconos/splash generados.
9. ✅ CI en `.github/workflows/ci.yml` (lint, format, typecheck, tests, build).

**DoD Fase 0:** ✅ el proyecto compila y existe una base sólida para desarrollar.

### Pendientes menores (no bloquean Fase 1)

- `git init` para activar los hooks de Husky (el repo aún no está versionado).
- `npx cap add ios` + `npx capacitor-assets generate --ios` (requiere macOS/Xcode) para materializar el proyecto iOS y sus iconos.
- `npx playwright install` para descargar los navegadores del smoke E2E.
- 2 vulnerabilidades `high` en dependencias transitivas (revisar sin `--force`).
- Code-splitting del bundle (>500 kB) — se aborda en Fase 13 (Polish).

## Contradicciones — ✅ RESUELTAS en PRODUCT.MD

Documentadas como Resoluciones R-01/R-02 y ADR-063/064 en `PRODUCT.MD`:

1. **Multi-Workspace por usuario** → **R-01 / ADR-063.** El MVP **sí** permite pertenecer a y alternar entre múltiples Workspaces (requisito del dominio y la colaboración). Se difiere solo la analítica **consolidada entre** Workspaces (cross-Workspace).
2. **Dark Mode** → **R-02 / ADR-064.** Infraestructura de tema **preparada** en Fase 0 (tokens `:root`/`.dark` + store Zustand); la UI oscura **no se activa** en el MVP.
