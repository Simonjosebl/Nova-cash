-- Nova Cash · Migración 013 · budgets.currency
-- Resolución R-08. Cada presupuesto tiene su propia moneda (por defecto, la del espacio).
-- Su avance solo suma gastos de cuentas en esa misma moneda: no hay conversión automática.

alter table public.budgets add column currency text;

update public.budgets b
set currency = w.currency
from public.workspaces w
where w.id = b.workspace_id;

alter table public.budgets alter column currency set not null;

alter table public.budgets
  add constraint budgets_currency_iso check (currency ~ '^[A-Z]{3}$');
