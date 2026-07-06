# Marca, logos e iconos — Guía de generación

> **✅ Estado:** logo procesado (v2). Fuente: `assets/brand/source/logo_NovaCash.png` (1313×1198, con alpha).
> Icono detectado en `left:111 top:12 · 1092×1156`; navy real del icono **#01153f**. Se cuadra rellenando los laterales con navy.
> Regenerar todo: `npm run assets:brand` (usa `sharp` + `png-to-ico`, ya en devDependencies).

Guía para procesar el logo y dejarlo **listo** como favicon `.ico`, icono de app (iOS) y splash screens. Alineado con el branding del Cap. 16 y los colores del Design System (Cap. 3.5): Nova Navy `#0F172A`, Nova Blue `#2563EB`, Nova Cyan `#06B6D4`.

## Activos ya generados

| Archivo                                                | Tamaño         | Uso                                          |
| ------------------------------------------------------ | -------------- | -------------------------------------------- |
| `assets/brand/icon/icon-master-1024.png`               | 1024² opaco    | Master del icono (full-bleed, esquinas navy) |
| `assets/brand/logo/png/logo-{1024,512,256,128,64}.png` | varios         | Logo con esquinas transparentes              |
| `assets/brand/favicon/favicon-512.png`                 | 512²           | Master del favicon                           |
| `assets/capacitor/icon-only.png`                       | 1024² opaco    | Input `@capacitor/assets` (icono iOS)        |
| `assets/capacitor/splash.png` / `splash-dark.png`      | 2732²          | Input splash (claro / oscuro)                |
| `public/favicon.ico`                                   | 16/32/48       | Favicon web                                  |
| `public/favicon-16x16.png`, `favicon-32x32.png`        | 16², 32²       | Favicons PNG                                 |
| `public/apple-touch-icon.png`                          | 180² opaco     | iOS Safari / add to home                     |
| `public/icon-192.png`, `icon-512.png`                  | 192², 512²     | PWA (any)                                    |
| `public/icon-512-maskable.png`                         | 512² opaco     | PWA (maskable)                               |
| `src/shared/assets/logo.png` (+ @1x/@2x)               | 512²/128²/256² | Logo dentro de la app (onboarding, header)   |

## `<head>` para `index.html` (añadir en Fase 0)

```html
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<meta name="theme-color" content="#0F172A" />
```

Para iconos + splash de iOS, tras instalar Capacitor: `npx capacitor-assets generate --ios --assetPath assets/capacitor`.

---

## Referencia (proceso original)

## Dónde va cada cosa

```
assets/
├── brand/
│   ├── source/     ← 📥 SUBE AQUÍ los originales (SVG vectorial ideal, o PNG grande)
│   ├── logo/
│   │   ├── svg/    ← logo vectorial optimizado (horizontal, isotipo, monocromo)
│   │   └── png/    ← exportaciones PNG @1x/@2x/@3x con fondo transparente
│   ├── icon/       ← icono maestro cuadrado 1024×1024 (sin transparencia, sin esquinas redondeadas)
│   ├── favicon/    ← masters para favicon (512×512 png)
│   └── splash/     ← arte del splash (2732×2732 png)
└── capacitor/      ← inputs para @capacitor/assets (ver abajo)

public/
└── favicon.ico     ← favicon generado (se sirve en la web)
```

> Los **originales** se versionan (en `brand/`). Los **derivados** generados por herramientas van a `assets/generated/` (ignorado por git) o a la carpeta nativa correspondiente.

## Qué necesito de ti (formatos ideales)

| Activo                            | Formato ideal                  | Fondo                                                                |
| --------------------------------- | ------------------------------ | -------------------------------------------------------------------- |
| Logo principal (horizontal)       | **SVG** (o PNG ≥ 2000px ancho) | Transparente                                                         |
| Isotipo / símbolo (cuadrado)      | **SVG** (o PNG ≥ 1024×1024)    | Transparente                                                         |
| Versión monocroma (blanco / navy) | SVG                            | Transparente                                                         |
| Icono de app                      | PNG **1024×1024**              | **Sólido** (sin transparencia ni bordes redondeados; iOS los aplica) |

Si solo tienes un PNG, súbelo igual: puedo trazar/re-escalar, aunque un SVG da mejor calidad.

## 1) Favicon `.ico` (web)

A partir de un master cuadrado (≥ 512×512) genero un `.ico` multi-resolución (16, 32, 48) + PNGs modernos:

```bash
# opción A: ImageMagick
magick assets/brand/favicon/master-512.png -define icon:auto-resize=16,32,48 public/favicon.ico

# opción B: sharp / pwa-asset-generator (Node) — recomendado para PWA
npx pwa-asset-generator assets/brand/favicon/master-512.png public/ --favicon --type png
```

Salida esperada en `public/`: `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`.

## 2) Iconos de app iOS + splash (Capacitor)

Usamos [`@capacitor/assets`](https://github.com/ionic-team/capacitor-assets). Coloca en `assets/capacitor/`:

| Archivo               | Tamaño    | Nota                                      |
| --------------------- | --------- | ----------------------------------------- |
| `icon-only.png`       | 1024×1024 | icono cuadrado, fondo sólido              |
| `icon-foreground.png` | 1024×1024 | símbolo centrado, transparente (adaptive) |
| `icon-background.png` | 1024×1024 | color/fondo sólido                        |
| `splash.png`          | 2732×2732 | logo centrado sobre fondo de marca        |
| `splash-dark.png`     | 2732×2732 | variante oscura (opcional)                |

Generación (Fase 0, tras instalar Capacitor):

```bash
npm i -D @capacitor/assets
npx capacitor-assets generate --ios --assetPath assets/capacitor
```

Esto crea automáticamente todos los tamaños de icono y LaunchScreen para iOS.

## 3) Logo en la app

- SVG optimizado → `src/shared/assets/` para usar como componente/`<img>` en la UI (splash interna, header, onboarding).
- Respetar el uso de color del Cap. 3: el logo va en Nova Navy; gradiente Nova Blue → Nova Cyan permitido para el FAB y estados activos.

## Checklist cuando subas los logos

- [ ] Original(es) en `assets/brand/source/`
- [ ] Icono maestro 1024×1024 en `assets/brand/icon/`
- [ ] Master favicon 512×512 en `assets/brand/favicon/`
- [ ] `favicon.ico` generado en `public/`
- [ ] Inputs de Capacitor en `assets/capacitor/`
- [ ] Iconos + splash iOS generados
- [ ] SVG del logo en `src/shared/assets/`
