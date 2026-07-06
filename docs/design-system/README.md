# Design System (Cap. 3)

Debe sentirse como una app de Apple: simple, elegante, muy rápida, clara, humana. **Nunca** usar colores directamente — siempre **tokens**.

## Paleta

| Token       | Hex       | Uso                                                         |
| ----------- | --------- | ----------------------------------------------------------- |
| Nova Navy   | `#0F172A` | Logo, header, botón principal, tabs activas                 |
| Nova Blue   | `#2563EB` | Links, elementos interactivos                               |
| Nova Cyan   | `#06B6D4` | Gradientes, estados activos                                 |
| Nova Green  | `#22C55E` | Ingresos, metas, éxitos                                     |
| Nova Orange | `#F59E0B` | Advertencias, pagos próximos                                |
| Nova Red    | `#EF4444` | **Solo errores** — nunca gastos (los gastos no son errores) |

Neutros: Background `#F8FAFC` · Surface `#FFFFFF` · Border `#E5E7EB` · Text `#111827` / `#6B7280` · Disabled `#CBD5E1`.

## Fundamentos

- **Tipografía:** Inter (fallback SF Pro). Escala 40/32/28/24/20/18/16/14/12. Nunca < 12.
- **Espaciado:** sistema de 8pt (4,8,12,16,24,32,40,48,64,80). Nunca márgenes arbitrarios.
- **Radius:** botones 16 · cards 24 · bottom sheets 32.
- **Sombras:** muy sutiles (no Material).
- **Emojis = identidad** (categorías, cuentas, eventos). **Iconos (Lucide) = solo acciones** (editar, eliminar, compartir…).
- **Motion:** 150–250ms (máx 350). Tap → scale 0.97. Loading → Skeleton, nunca spinner infinito.
- **FAB único** centro-inferior, gradiente Blue→Cyan (gasto/ingreso/transferencia/meta/evento).
- **Navegación:** bottom tab de 5 (🏠 Inicio · 💸 Movimientos · 📅 Calendario · 📊 Reportes · 👤 Perfil).
- **Estados:** toda pantalla con loading, skeleton, error (mensaje humano), vacío (ilustración+texto+botón), contenido. Nunca pantallas en blanco.
- **Accesibilidad:** contraste AA, touch targets 44px, VoiceOver, Dynamic Type.
- **Dark Mode:** no en el MVP, pero la arquitectura debe permitirlo.

Componentes globales y _Definition of Done_ de componente: ver `PRODUCT.MD` Cap. 3.14 y siguientes.
