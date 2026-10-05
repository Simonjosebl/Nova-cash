# Security Architecture (Cap. 9)

**Zero Trust.** La única fuente de verdad es el servidor; nunca confiar en el Frontend. Ocultar un botón no es seguridad.

## Todo acceso valida

Usuario autenticado → pertenece al Workspace → rol permitido → recurso existente y no eliminado → auditoría registrada.

- **Auth:** Supabase Auth (email+password, Google OAuth, Apple Sign In en iOS). El usuario nunca toca PostgreSQL directamente.
- **Autorización** depende del **Workspace**, no del usuario.
- **RLS** obligatorio en todas las tablas; policies validan `auth.uid()` + `workspace_members` + rol + estado.
- **Aislamiento:** toda consulta filtra por `workspace_id` y `deleted_at IS NULL`.
- **Invitaciones:** token único, un solo uso, expira, revocable.
- **Sesiones:** las gestiona Supabase; nunca persistir tokens en texto plano.
- **Edge Functions:** validan JWT + workspace + permisos + auditoría; nunca exponen Service Role Key ni secretos.
- **Errores:** nunca exponer detalles internos; mensaje humano al usuario, detalle solo en logs.
- **Secrets:** solo por variables de entorno; nunca en el repo ni en el código.
- **Rate limiting** en login, registro, invitaciones, edge functions públicas.

ADRs 033–040.
