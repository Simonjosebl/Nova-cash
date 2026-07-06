# API / Services Specification (Cap. 8)

La UI **nunca** conoce Supabase. `UI → Hook → Service → Repository → Supabase`.

## Reglas

- Todo intercambio usa **DTO** (`CreateXDTO`, `UpdateXDTO`, `XResponseDTO`, `XSummaryDTO`), nunca entidades crudas.
- Services exponen métodos canónicos: `create() · update() · delete() · list() · getById()` (nunca `createAccount`, `fetchX`, etc.).
- Services **no** retornan `null`/`undefined`; retornan `{ success, data, metadata, errors }`.
- Errores tipados con `AppError { code, message, status, details }` (`ACCOUNT_NOT_FOUND`, `INVALID_AMOUNT`, `PERMISSION_DENIED`, `INSUFFICIENT_BALANCE`…).

## Services previstos

`Transactions · Accounts · Categories · Goals · Budgets · Dashboard · Calendar · Workspace · Notifications · Insights`.

- **Dashboard:** `loadDashboard()` devuelve **todo en una sola llamada** (`saldo, resumen, insights, categorias, actividad, proximosPagos`). Nunca 10 consultas desde React.

## Cache & invalidaciones (TanStack Query)

Keys: `dashboard, accounts, transactions, calendar, goals, budgets, reports, notifications`.
Crear gasto → invalida `dashboard, budgets, calendar, reports, insights, transactions`.
**Optimistic updates** permitidas solo en: transacciones, categorías, metas, favoritos. **Nunca** en invitaciones, permisos, workspace.
