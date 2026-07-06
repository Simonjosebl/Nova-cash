# Domain & Database (Cap. 4 y 5)

El **Workspace es el núcleo**: todo pertenece a un Workspace; no hay datos globales. Cada Workspace es un universo aislado.

## Reglas de toda tabla (Cap. 5.2)

`id UUID` (nunca autoincremental) · `created_at` · `updated_at` · `deleted_at` (Soft Delete) · `created_by` · `workspace_id` (cuando aplique). Fechas en UTC (`timestamptz`). snake_case.

## Tablas (Cap. 5.7)

`profiles · workspaces · workspace_members · workspace_invitations · accounts · categories · transactions · recurring_transactions · budgets · goals · goal_contributions · calendar_events · notifications · audit_logs · settings`.

## Reglas de negocio clave (Cap. 4.23)

- Todo pertenece a un Workspace; un usuario puede pertenecer a varios _(ver contradicción MVP en [roadmap](../roadmap))._
- Máx **5 colaboradores** en MVP; solo el admin invita.
- Transferencias **no** afectan ingresos ni gastos (solo saldos).
- Metas solo reciben montos positivos; presupuestos nunca modifican transacciones.
- Toda modificación → auditoría (inmutable). Toda eliminación → Soft Delete. Toda consulta respeta RLS.
- Cada transacción tiene 1 cuenta y exactamente 1 categoría (excepto transferencias).

## Supabase (Cap. 5)

- **Índices** en todas las FK (`workspace_id`, `account_id`, `category_id`, `transaction_date`, etc.).
- **Triggers:** `updated_at`, saldo de cuentas, progreso de metas, auditoría, notificaciones, presupuestos, insights.
- **RLS obligatorio** en todas las tablas; toda policy parte de `workspace_members`.
- **Storage** (privado, acceso firmado): `avatars, attachments, receipts, workspace-assets, future-imports`.
- **Edge Functions:** `accept-invitation, send-email, send-push, generate-insights, cleanup, future-import`.
- **Migraciones** versionadas: `YYYYMMDD_HHMM_descripcion.sql` en `supabase/migrations/`. Nunca editar migraciones antiguas.

Roles: **Administrador** (todo) · **Editor** (crea/edita movimientos, categorías, cuentas, presupuestos; no gestiona miembros ni borra workspace) · **Lector** (solo lectura).
