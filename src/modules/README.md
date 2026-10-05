# modules — Dominios (Feature First, Cap. 2 / 7.6)

Cada módulo es **independiente** y sigue **exactamente** la misma estructura. Nunca importar archivos internos de otro módulo; comunicarse solo mediante servicios públicos.

## Módulos (Cap. 2.9)

`auth · workspace · dashboard · accounts · categories · transactions · calendar · budgets · goals · reports · notifications · settings · profile · legal`

_(`legal` — Política de Privacidad y Términos, páginas públicas. Ver Resolución R-05.)_

_(Collaborators — Fase 11 — vive dentro de `workspace/` por ser gestión de miembros/invitaciones.)_

## Estructura estándar de cada módulo

```
<modulo>/
├── components/     # UI del dominio (solo mostrar + capturar eventos)
├── pages/          # Pantallas / rutas
├── hooks/          # useX — puente hacia Services (TanStack Query)
├── services/       # Lógica de negocio (única capa que la contiene)
├── repositories/   # Persistencia (CRUD contra Supabase)
├── schemas/        # Validaciones Zod (x.schema.ts)
├── store/          # Estado local del módulo (Zustand si aplica)
├── types/          # Tipos del dominio (x.types.ts, IX)
├── constants/      # Constantes del dominio
├── utils/          # Utilidades del dominio (nombres específicos, no utils.ts)
├── tests/          # *.test.ts (unit + integración)
└── dto/            # CreateXDTO, UpdateXDTO, XResponseDTO...
```

## Orden de construcción por módulo (Cap. 7.7)

`Diseñar → Schema → Types → Repository → Service → Hook → UI → Testing`. Nunca empezar por la UI.
