# Software Architecture (Cap. 2)

**Feature First** (por dominio, no por tipo de archivo). Cinco objetivos: fácil de entender, mantener, escalar, probar y reemplazar. El proyecto **no está acoplado a Supabase**.

## Flujo de datos (nunca se rompe)

```
UI → Hook → Service → Repository → Supabase → PostgreSQL → ... → UI
```

## Capas y responsabilidades

- **Component:** mostrar información + capturar eventos. Nada más. Nunca consulta Supabase.
- **Hook:** puente UI ↔ Service; usa TanStack Query.
- **Service:** **toda** la lógica de negocio (cálculos, validaciones, permisos, insights). Habla con varios Repositories.
- **Repository:** solo persistencia (CRUD). Nunca lógica de negocio.

## Estado (separación estricta)

- **Servidor →** TanStack Query (cache, invalidaciones, optimistic updates).
- **Global →** Zustand (usuario, workspace, tema, preferencias). Nada más.
- **Local →** React.

## Módulos (Cap. 2.9 / 2.20)

`auth · workspace · dashboard · accounts · categories · transactions · calendar · budgets · goals · reports · notifications · settings · profile`. Cada módulo es independiente y sigue la **misma** estructura interna. Escalar = añadir carpeta en `modules/` sin tocar las demás.

ADRs relacionados: 001–015. Ver [`../adr`](../adr).
