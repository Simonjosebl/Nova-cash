# Publicar Nova Cash (web)

Hosting recomendado: **Vercel** (gratis, dominio `tu-app.vercel.app`, HTTPS y despliegue
automático desde GitHub). La configuración ya está en `vercel.json` (fallback de SPA, CSP y
cabeceras de seguridad). Alternativas listas: Netlify o Cloudflare Pages (`public/_headers` y
`public/_redirects`).

## 1. Supabase (una sola vez, antes de publicar)

1. **SQL Editor:** ejecuta `supabase/migrations/20261005_1000_security_hardening.sql`.
2. **Authentication → Sign In / Providers → Email:** activa **Confirm email**.
3. **Authentication → Policies (contraseñas):** mínimo **10**, requisito **letras y dígitos**,
   y activa la protección de contraseñas filtradas si tu plan la incluye.
4. **Authentication → Rate Limits:** revisa envío de correos, inicios de sesión y verificaciones.
5. **Authentication → URL Configuration:**
   - Site URL: `https://tu-app.vercel.app`
   - Redirect URLs: `https://tu-app.vercel.app/**` (mantén `http://localhost:5173/**` solo para desarrollo).
6. **Google Cloud (OAuth):** agrega `https://tu-app.vercel.app` en _Orígenes autorizados_ y las
   páginas `/privacidad` y `/terminos` en la pantalla de consentimiento.
7. **Edge Functions:**
   ```
   npx supabase secrets set --project-ref <REF> APP_URL=https://tu-app.vercel.app
   npx supabase functions deploy send-invitation accept-invitation --project-ref <REF> --use-api
   ```

## 2. GitHub

```
git remote add origin https://github.com/<usuario>/nova-cash.git
git push -u origin main
```

`.env` nunca se sube (está en `.gitignore`).

## 3. Vercel

1. vercel.com → **Add New → Project** → importa el repositorio.
2. Framework: **Vite** (detectado). Build: `npm run build`. Output: `dist`.
3. **Environment Variables:** `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (los mismos del `.env`).
4. **Deploy.** Cada `git push` a `main` vuelve a publicar.

## 4. Verificar después de publicar

- Abre directamente `https://tu-app.vercel.app/privacidad` (no debe dar 404).
- Login con correo y con Google; recuperación de contraseña; invitación a un colaborador.
- En las herramientas del navegador (pestaña Red → documento) revisa que lleguen las cabeceras
  `Content-Security-Policy` y `Strict-Transport-Security`, y que la consola no muestre bloqueos CSP.

> Si cambias de proyecto de Supabase, actualiza el dominio `*.supabase.co` de la CSP en
> `vercel.json` y `public/_headers`.
