# Auditoría de seguridad previa al lanzamiento — 2026-10-05

Alcance: base de datos (RLS, funciones SQL), Edge Functions, secretos, frontend (auth, XSS,
validación), dependencias y configuración de despliegue. Resolución asociada: **R-18** en `PRODUCT.MD`.

## Hallazgos y estado

| #   | Severidad  | Hallazgo                                                                                                                                                       | Estado                                                                                                                               |
| --- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | 🔴 Crítica | La política `invitations_update` no tenía `WITH CHECK`: un invitado podía cambiar `role`/`workspace_id` de su invitación y volverse **admin de otro espacio**. | ✅ Solo el admin modifica invitaciones; aceptación vía RPC atómica `accept_invitation` (rol editor fijo). Migración `20261005_1000`. |
| 2   | 🟠 Alta    | Referencias entre espacios: una transacción/presupuesto/aporte podía apuntar a cuentas, categorías o metas **de otro espacio** y alterar sus saldos.           | ✅ Trigger `enforce_same_workspace` + bloqueo de cambio de `workspace_id`.                                                           |
| 3   | 🟠 Alta    | Invitaciones aceptables con correo **sin confirmar** (suplantación).                                                                                           | ✅ `accept_invitation` exige correo confirmado; `enable_confirmations = true`. ⚠️ Activar también en el dashboard.                   |
| 4   | 🟠 Alta    | `create_workspace` no estaba versionada.                                                                                                                       | ✅ Definida en la migración (SECURITY DEFINER, `search_path`, grants).                                                               |
| 5   | 🟠 Alta    | `supabase/schema.sql` corrupto y desalineado.                                                                                                                  | ✅ Se genera con `npm run db:schema`.                                                                                                |
| 6   | 🟠 Alta    | Dependencia con vulnerabilidad en producción (`react-router-dom`).                                                                                             | ✅ Actualizada. `npm audit --omit=dev`: **0**.                                                                                       |
| 7   | 🟡 Media   | Sin límite de envío de invitaciones (spam / phishing desde tu correo).                                                                                         | ✅ 1 envío/min, 5 por invitación, 20 invitaciones/día por espacio.                                                                   |
| 8   | 🟡 Media   | `accept-invitation` podía degradar a miembros existentes y tenía condición de carrera.                                                                         | ✅ Reclamo atómico; no degrada miembros activos.                                                                                     |
| 9   | 🟡 Media   | Cualquier miembro podía reescribir textos de notificaciones del espacio.                                                                                       | ✅ Solo se puede actualizar `read`.                                                                                                  |
| 10  | 🟡 Media   | Saldos y avance de metas editables directamente.                                                                                                               | ✅ Permisos por columna (`current_balance`, `current_amount` bloqueadas).                                                            |
| 11  | 🟡 Media   | Espacios eliminados seguían accesibles.                                                                                                                        | ✅ Los helpers de permisos exigen espacio activo.                                                                                    |
| 12  | 🟡 Media   | Datos en caché sobrevivían a un cierre de sesión externo (otra pestaña / token vencido).                                                                       | ✅ Se limpia caché y espacio activo al cambiar de usuario.                                                                           |
| 13  | 🟡 Media   | Sin cabeceras de seguridad ni fallback de SPA.                                                                                                                 | ✅ `vercel.json` / `_headers` / `_redirects` con CSP estricta, HSTS, etc.                                                            |
| 14  | 🟢 Baja    | CORS `*` en Edge Functions.                                                                                                                                    | ✅ Solo `APP_URL`, localhost y Capacitor.                                                                                            |
| 15  | 🟢 Baja    | Detalle del proveedor de correo devuelto al cliente; posible inyección de cabeceras en el asunto.                                                              | ✅ Error genérico; saltos de línea eliminados.                                                                                       |
| 16  | 🟢 Baja    | Propietario transferible/degradable por un admin.                                                                                                              | ✅ Trigger `protect_workspace_owner`.                                                                                                |
| 17  | 🟢 Baja    | Correo de perfil editable a mano.                                                                                                                              | ✅ Columna bloqueada.                                                                                                                |
| 18  | 🟢 Baja    | Contraseña mínima de 8.                                                                                                                                        | ✅ 10 con letras y números (cliente + Auth).                                                                                         |
| 19  | 🟢 Baja    | Sin tope de montos, comodines de búsqueda sin escapar, avatar con cualquier esquema, `console.error` en producción, `/\` en ruta de retorno.                   | ✅ Corregidos.                                                                                                                       |
| 20  | ℹ️ Info    | Lista de miembros sin nombres (RLS de perfiles solo propios).                                                                                                  | ✅ Los compañeros de un espacio se ven entre sí.                                                                                     |

## No aplica

- **Tool calling / prompt injection:** la app no usa modelos de lenguaje ni herramientas de IA.
- **SSRF:** ninguna función descarga URLs controladas por el usuario.
- **File upload:** no hay subida de archivos (no hay buckets de Storage). Si se habilitan adjuntos, crear buckets privados con políticas por espacio.

## Verificado como seguro

RLS activo en todas las tablas; sin acceso para `anon`; `audit_logs` inmutable; funciones
SECURITY DEFINER con `search_path` fijo y nombres de tabla en lista blanca; secretos fuera de git
(`.env` ignorado, nunca versionado); el frontend solo usa variables `VITE_*` y la clave pública;
sin `dangerouslySetInnerHTML`/`eval`; build sin source maps ni scripts en línea; login sin
enumeración de cuentas; botones deshabilitados mientras se envía y mensaje claro ante el límite 429.

## Riesgo residual (aceptado)

- Alertas de `npm audit` solo en herramientas de desarrollo (`tar` vía CLI de Capacitor, Tailwind 3).
  No llegan a la app publicada. Plan: migrar a Tailwind 4 y actualizar la CLI de Capacitor.
- El límite de intentos de login lo aplica Supabase Auth (por IP). Para más protección: CAPTCHA
  (Turnstile/hCaptcha) en _Authentication → Attack Protection_.
