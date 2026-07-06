# shared — Código reutilizable (Cap. 2.9)

**No contiene lógica de negocio.** Todo lo transversal usado por varios módulos.

```
shared/
├── components/   # Componentes compartidos de alto nivel
├── ui/           # Design System: Button, Input, Card, BottomSheet, FAB, Toast... (shadcn/ui)
├── hooks/        # Hooks genéricos reutilizables
├── utils/        # Utilidades transversales (nombres específicos)
├── services/     # Servicios transversales (no de dominio)
├── schemas/      # Schemas Zod compartidos
├── constants/    # Constantes compartidas (tokens, enums globales)
├── types/        # Tipos compartidos (AppError, DTOs base, respuestas)
├── config/       # Configuración compartida
└── assets/       # Assets compartidos (logo SVG de la app va aquí)
```

Los componentes del Design System (Cap. 3.14) viven en `ui/` y respetan tokens, estados, loading, error, disabled, animación, accesibilidad y pruebas antes de usarse.
