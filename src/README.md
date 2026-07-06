# src — Código de la aplicación (Cap. 2.9 / 7.4)

Nunca crear carpetas fuera de esta estructura.

```
src/
├── app/          # App.tsx, providers, router, theme, navigation. Nada más.
├── shared/       # Reutilizable, SIN lógica de negocio (ver shared/README.md)
├── modules/      # Dominios de la app (ver modules/README.md)
├── config/       # Configuración de la app (constantes de entorno tipadas, flags)
├── lib/          # Integraciones externas (cliente Supabase, etc.)
├── styles/       # Estilos globales, tokens Tailwind, tema
├── assets/       # Assets globales de la app (imágenes, fuentes)
├── types/        # Tipos globales/compartidos
└── constants/    # Constantes globales
```

El flujo de datos siempre es `UI → Hook → Service → Repository → Supabase`.
