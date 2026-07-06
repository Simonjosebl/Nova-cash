# RLS — Modelo de seguridad (Cap. 5.12 / 9.7)

Toda tabla tiene RLS habilitado. Las policies viven **dentro de las migraciones** (versionadas, ADR-022); este documento resume el modelo.

## Principio

Todo acceso parte de la **membresía al Workspace** (ADR-035). Un usuario solo ve datos de Workspaces donde es miembro `active`.

## Funciones helper (SECURITY DEFINER — evitan recursión de RLS)

| Función                   | Devuelve                                             |
| ------------------------- | ---------------------------------------------------- |
| `current_profile_id()`    | `profiles.id` del `auth.uid()` actual                |
| `is_workspace_member(ws)` | `true` si el usuario es miembro activo del workspace |
| `is_workspace_admin(ws)`  | `true` si además su rol es `admin`                   |

## Políticas por tabla

| Tabla                   | SELECT                           | INSERT            | UPDATE           | DELETE                   |
| ----------------------- | -------------------------------- | ----------------- | ---------------- | ------------------------ |
| `profiles`              | propio                           | (trigger)         | propio           | —                        |
| `workspaces`            | miembro y `deleted_at IS NULL`   | owner = uno mismo | admin            | (soft-delete vía UPDATE) |
| `workspace_members`     | miembro                          | admin             | admin            | admin                    |
| `workspace_invitations` | admin **o** invitado (por email) | admin             | admin o invitado | admin                    |
| `settings`              | miembro                          | (trigger)         | admin            | —                        |

## Notas

- El **owner** se agrega como `admin` automáticamente (trigger `on_workspace_created`).
- La fila de `settings` se crea automáticamente al crear el workspace.
- **Aceptar invitación** insertará el `workspace_member` mediante la Edge Function `accept-invitation` (Cap. 5.15) con service role, validando token/expiración — se implementa junto con Colaboradores (Fase 11). En Fase 2 el admin gestiona miembros e invitaciones directamente.
- Roles (Cap. 4.6): **admin** (todo), **editor** (movimientos/categorías/cuentas/presupuestos), **viewer** (solo lectura). El detalle de permisos por entidad se aplicará en cada módulo de dominio.
