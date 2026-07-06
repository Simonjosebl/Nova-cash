# Supabase (Cap. 5 / 9 / 11)

Backend del proyecto. Toda la lógica persistente y crítica vive aquí, nunca en el Frontend.

```
supabase/
├── migrations/   # YYYYMMDD_HHMM_descripcion.sql — versionadas, nunca editar antiguas
├── functions/    # Edge Functions: accept-invitation, send-email, send-push,
│                 #   generate-insights, cleanup, future-import
├── policies/     # Documentación/SQL de RLS por tabla (parten de workspace_members)
└── seeds/        # Solo desarrollo: workspace demo, usuarios, categorías, transacciones
```

Reglas:

- Un **proyecto Supabase por ambiente** (dev/stage/prod); nunca reutilizar.
- **RLS habilitado desde el día 1** en todas las tablas (ADR-018/034).
- **Storage privado** con acceso firmado.
- **Soft Delete** en todo; consultas filtran `deleted_at IS NULL`.
- Secrets solo por variables de entorno; nunca la Service Role Key en el Frontend.
