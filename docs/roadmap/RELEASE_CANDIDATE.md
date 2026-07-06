# Release Candidate — Nova Cash MVP (Cap. 12.19)

Estado del checklist de RC. Los ítems marcados ✅ están verificados en este entorno;
los ⏳ requieren un **proyecto Supabase real** y/o **macOS + Xcode** (fuera de este entorno).

## Calidad de código (verificado ✅)

- [x] Sin errores TypeScript (`tsc -b`, modo strict, sin `any`).
- [x] Sin errores ESLint (`eslint .`).
- [x] Prettier consistente (`prettier --check`).
- [x] **118 tests** en verde (Vitest) — schemas, services y motor Nova Insights con repos mockeados.
- [x] Build exitoso (`vite build`) con **code-splitting** por módulo (chunks < 500 KB; vendor separado).
- [x] Sin `console.log`, `TODO` ni `FIXME`; componentes < 250 líneas, hooks < 150.

## Arquitectura (verificado ✅)

- [x] Feature First; flujo `UI → Hook → Service → Repository → Supabase` respetado.
- [x] Ningún componente consulta Supabase directamente (solo Repositories).
- [x] Lógica de negocio en Services; persistencia en Repositories.
- [x] Estado: TanStack Query (servidor) + Zustand (sesión/workspace) + React (local).
- [x] 62 ADR + Resoluciones R-01/R-02 respetados.

## Producto / UX (verificado ✅)

- [x] Flujo completo: Splash → Auth → Crear/entrar Workspace → Dashboard → uso diario.
- [x] Design System: tokens, 8pt, emojis como identidad, Nova Red solo errores.
- [x] Estados en todas las pantallas: loading (skeleton), vacío (humano), error, contenido.
- [x] Nova Insights recibe sus 4 fuentes (transacciones, calendario, presupuestos, metas).
- [x] Accesibilidad base: contraste, focus visible, `prefers-reduced-motion`, touch targets.
- [x] PWA installable (manifest + iconos de marca).

## Base de datos / Seguridad (código listo ✅ · validación ⏳)

- [x] 12 migraciones versionadas con UUID, soft delete, `created_at/updated_at`, índices.
- [x] RLS habilitado en todas las tablas; policies parten de la membresía; helpers SECURITY DEFINER.
- [x] Triggers: saldos en cascada, auditoría inmutable, progreso de metas, notificaciones.
- [x] Edge Function `accept-invitation` (Zero Trust).
- [ ] ⏳ Aplicar migraciones en un proyecto Supabase y **validar RLS end-to-end**.
- [ ] ⏳ Desplegar Edge Functions y configurar secretos (Service Role, SMTP, APNs).

## Pendiente de entorno nativo / backend (⏳ documentado)

- [ ] ⏳ `npx cap add ios` + generar iconos/splash nativos (`@capacitor/assets`) — requiere macOS/Xcode.
- [ ] ⏳ Push real (APNs + `@capacitor/push-notifications`) y notificaciones locales.
- [ ] ⏳ Entrega de correos (Edge Function `send-email` / SMTP) para invitaciones.
- [ ] ⏳ Job de recurrentes/recordatorios (Edge Function/cron `generate-insights`).
- [ ] ⏳ Adjuntos de transacciones (Supabase Storage).
- [ ] ⏳ E2E Playwright sobre backend real (`npx playwright install` + datos de prueba).
- [ ] ⏳ Apple Sign In.
- [ ] ⏳ `git init` para activar los hooks de Husky.

## Siguiente paso para producción

1. Crear proyectos Supabase (dev/stage/prod) y aplicar migraciones + seeds.
2. Configurar `.env` con las claves reales y validar el flujo completo con datos.
3. Añadir la plataforma iOS con Capacitor y generar los recursos nativos.
4. Ejecutar la suite E2E contra staging y completar el checklist ⏳.
