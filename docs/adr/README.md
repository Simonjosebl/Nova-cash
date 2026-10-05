# Registro de Decisiones Arquitectónicas (ADR)

Las 62 decisiones están definidas en `PRODUCT.MD`. Este índice las consolida. **No pueden contradecirse** al implementar. Nuevas decisiones se agregan como `docs/adr/ADR-0XX-titulo.md` y, si afectan producto/arquitectura, también a `PRODUCT.MD`.

## Arquitectura (Cap. 2)

- **001** React + Vite · **002** Capacitor (no React Native) · **003** Supabase backend · **004** PostgreSQL única BD · **005** Feature First · **006** Repository Pattern obligatorio · **007** TypeScript strict · **008** No `any` · **009** Negocio solo en Services · **010** Supabase solo vía Repositories · **011** TanStack Query (remoto) · **012** Zustand (global) · **013** Tailwind + shadcn/ui · **014** Framer Motion · **015** RLS desde el día 1.

## Base de datos (Cap. 5)

- **016** UUID obligatorio · **017** Soft Delete obligatorio · **018** RLS obligatorio · **019** Workspace como núcleo · **020** PostgreSQL única fuente de verdad · **021** Auditoría inmutable · **022** Migraciones versionadas · **023** Storage privado · **024** Realtime solo eventos críticos.

## Engineering (Cap. 7)

- **025** Feature First · **026** TS strict · **027** Repository Pattern · **028** Commits convencionales · **029** No `any` · **030** Todo cambio requiere documentación · **031** Todo cambio requiere pruebas · **032** Toda regla vive en PRODUCT BOOK.

## Seguridad (Cap. 9)

- **033** Zero Trust · **034** RLS en todas las tablas · **035** Workspace como límite de seguridad · **036** Soft Delete · **037** Operación crítica → auditoría · **038** Nunca confiar en el Frontend · **039** Autorización depende del Workspace · **040** Secrets solo por variables de entorno.

## Testing (Cap. 10)

- **041** Testing obligatorio · **042** Cobertura mínima 85% · **043** Business Rules 100% · **044** No PR con pruebas fallidas · **045** Migraciones probadas en base limpia · **046** Funcionalidad crítica con E2E · **047** Nunca datos de producción en tests · **048** Calidad sobre velocidad.

## DevOps (Cap. 11)

- **049** Tres ambientes · **050** Cambios solo por migraciones · **051** Nunca deploy manual a producción · **052** Semantic Versioning · **053** CI obligatorio en PRs · **054** Backup antes de migraciones críticas · **055** Secrets solo por entorno · **056** Capacitor única capa nativa.

## Roadmap (Cap. 12)

- **057** Desarrollo incremental por fases · **058** Ninguna fase inicia con la anterior incompleta · **059** Dashboard es el centro · **060** Integrar Nova Insights cuando corresponda · **061** MVP prioriza estabilidad · **062** Toda decisión futura respeta el PRODUCT BOOK.

## Resoluciones de ambigüedades (Cap. 12)

- **063** El MVP soporta que un usuario pertenezca a y alterne entre múltiples Workspaces; se difiere solo la analítica consolidada cross-Workspace (Resolución R-01).
- **064** El tema oscuro se prepara a nivel de arquitectura; actualizado: se activa en la UI con un switch de tema (Resolución R-02, actualización).
