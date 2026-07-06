# Runbook de puesta en producción — Nova Cash

Guía paso a paso para llevar el MVP (código listo) a un entorno real. Requiere cuentas/herramientas externas. Cap. 11.

## 0. Requisitos

- Node.js 20 LTS · npm
- [Supabase CLI](https://supabase.com/docs/guides/cli) (`npm i -g supabase` o scoop/brew)
- Cuenta Supabase (3 proyectos: `nova-cash-dev`, `-stage`, `-prod` — ADR-049)
- Para iOS: **macOS + Xcode** + cuenta Apple Developer (Cap. 11.11)
- Git + repositorio (GitHub) para CI/CD

## 1. Repositorio y calidad local

```bash
git init && git add -A && git commit -m "chore: bootstrap nova cash mvp"   # activa hooks de Husky
npm install
npm run lint && npm run typecheck && npm run test && npm run build          # gate completo
```

## 2. Base de datos local (opcional, recomendado)

```bash
supabase start          # levanta Postgres + Studio + Inbucket local
supabase db reset       # aplica migraciones (supabase/migrations) + seed demo
```

- Studio: http://localhost:54323 · Correos (magic link): http://localhost:54324
- Usuario demo: `demo@novacash.co` / `demo1234`

## 3. Variables de entorno

```bash
cp .env.example .env
# Rellenar con la URL y anon key del proyecto (Supabase → Project Settings → API):
#   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
```

Los **secretos** (Service Role, SMTP, APNs) NUNCA van al repo ni al cliente (Cap. 9.18): se configuran en Supabase y en los GitHub Environments.

## 4. Proyectos Supabase (por ambiente)

```bash
supabase link --project-ref <REF_DEL_PROYECTO>
supabase db push                       # aplica migraciones al remoto
supabase functions deploy accept-invitation
```

- **Auth (Project Settings → Auth):** activar confirmación de correo en prod; configurar SMTP; añadir Redirect URLs (`https://tu-dominio/reset-password`, deep link de la app).
- **Storage:** crear buckets privados `avatars`, `attachments`, `receipts` (Cap. 5.14) cuando se activen adjuntos.
- Tipos generados: `npm run types:gen` (reemplaza el genérico del cliente Supabase).

## 5. Tras aplicar migraciones — verificar seguridad (Cap. 9.20)

- [ ] RLS habilitado en **todas** las tablas (Studio → Authentication → Policies).
- [ ] Un usuario no puede leer datos de un workspace ajeno (probar con dos usuarios).
- [ ] `accept-invitation` valida token/expiración/correo.
- [ ] Sin Service Role en el frontend; secretos solo en el entorno.

## 6. Web

- Build: `npm run build` → `dist/`.
- Hospedar en Vercel/Netlify/CDN con las `VITE_*` del ambiente. CD de staging automático tras merge a `develop`; **producción manual** (workflow `Deploy`, ADR-051).

## 7. iOS (en macOS)

```bash
npm run build
npm run cap:add:ios                    # crea el proyecto nativo (una vez)
npm run assets:native                  # iconos + splash desde assets/capacitor
npm run cap:sync
npx cap open ios                       # abrir en Xcode → firmar → TestFlight
```

- Push (APNs): añadir `@capacitor/push-notifications`, capability Push en Xcode, key APNs en Supabase; conectar en `PushService` (hoy `WebPushService`).

## 8. CI/CD (GitHub)

- **CI** (`.github/workflows/ci.yml`): lint, format, typecheck, tests, build en cada push/PR.
- **Deploy** (`.github/workflows/deploy.yml`): manual por ambiente; aplica migraciones + functions y construye la web. Configurar secrets:
  `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF_STAGE/PROD`, `SUPABASE_DB_PASSWORD_STAGE/PROD`, y `VITE_SUPABASE_URL/ANON_KEY` por Environment.

## 9. Checklist de release

Ver [`../roadmap/RELEASE_CANDIDATE.md`](../roadmap/RELEASE_CANDIDATE.md). Etiquetar `v1.0.0` (SemVer, ADR-052) con changelog, migraciones y notas.
