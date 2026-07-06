# assets — Fuentes de marca y activos nativos

Activos **fuente** (los que editas), separados del código y de lo servido en web.

```
assets/
├── brand/
│   ├── source/     # 📥 originales de los logos (sube aquí)
│   ├── logo/svg/   # logo vectorial optimizado
│   ├── logo/png/   # exportaciones PNG
│   ├── icon/       # icono maestro 1024×1024
│   ├── favicon/    # master 512×512 para favicon
│   └── splash/     # arte de splash 2732×2732
└── capacitor/      # inputs para @capacitor/assets (icon-only, icon-foreground,
                    #   icon-background, splash, splash-dark)
```

- Los **originales** se versionan; los **derivados** generados van a `assets/generated/` (ignorado) o a la carpeta nativa iOS.
- El favicon `.ico` final se genera en `public/favicon.ico`.
- Guía completa: [`docs/branding/README.md`](../docs/branding/README.md).
