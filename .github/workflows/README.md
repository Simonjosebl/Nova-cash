# CI/CD Workflows (Cap. 11.8)

Aquí van los workflows de GitHub Actions. El pipeline de CI (a crear en Fase 0) debe ejecutar, en orden, en cada push/PR:

1. Instalar dependencias
2. ESLint
3. Prettier (check)
4. TypeScript check
5. Unit tests (Vitest)
6. Integration tests
7. Build web (Vite)
8. Validación de Capacitor
9. Reporte de cobertura

Si cualquier paso falla → no hay merge (ADR-053). CD: dev automático, staging tras merge a `develop`, **producción solo manual vía Release** (ADR-051).
