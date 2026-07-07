# PetColinas — Sistema de Gestión Veterinaria

## Contexto del proyecto

App de gestión para la clínica veterinaria PetColinas (República Dominicana). SPA React de un único archivo `index.html` (~5858 líneas), sin build tool — usa Babel en el browser y React 18 desde CDN. Backend: Supabase (Postgres + Auth).

**Repo:** `victorbeltre/petcolinas-app`  
**Branch de desarrollo:** `claude/resume-petcolinas-dev-XirXq`  
**URL Supabase:** `https://ulrzzddovkioxeaarnjk.supabase.co`  
**Moneda:** RD$ (pesos dominicanos)  
**Fecha base:** 2026

---

## Arquitectura

### Patrón de datos
- `useSupabase(table, seed)` — hook que arranca con datos seed locales, luego sincroniza con Supabase al cargar. Sync bidireccional: lee al montar, escribe en cada cambio.
- Cada tabla tiene su `SEED` embebido en el archivo para funcionar offline.
- **Facturas** es la excepción: solo usa `localStorage` (`pc_facturas`), NO está en Supabase.
- Soft-delete via `sessionStorage` (`pc_deleted_<tabla>`).
- Historial de deshacer (20 pasos) en memoria, sin persistencia.

### Auth
- Supabase Auth JWT. Sesión guardada en `localStorage` como `pc_session`.
- `supaGetSession()` valida expiración en cada carga.
- Si no hay sesión válida → pantalla `LoginScreen`.

### Estado global
- Sin Redux ni Context API. Cada módulo recibe props desde `PetColinasApp`.
- `tab` controla qué módulo se muestra.

---

## Mapa de componentes (líneas en index.html)

| Componente | Línea | Descripción |
|---|---|---|
| `LoginScreen` | 214 | Pantalla de autenticación |
| `normalizeRow` | 341 | Normaliza filas DB → estado React |
| `denormalizeRow` | 432 | Invierte para escribir a Supabase |
| `EMPLEADOS_INIT` | 555 | Seed de empleados |
| `VENTAS_SEED` | 691 | Seed de ventas históricas |
| `GASTOS_SEED` | 1166 | Seed de gastos |
| `CLIENTES_SEED` | 1183 | Seed de clientes/mascotas |
| `SEGUIMIENTOS_SEED` | 1596 | Seed de seguimientos |
| `FACTURAS_SEED` | 2002 | Seed histórico de facturas |
| `Facturas` | 2135 | Módulo de facturación |
| `ImportarExcel` | 2842 | Importación de datos desde Excel/CSV |
| `PetColinas` | 3066 | Componente raíz (maneja auth) |
| `INVENTARIO_SEED` | ~3090 | Seed de inventario (35 productos) |
| `PetColinasApp` | 3124 | App principal post-login, maneja tabs |
| `Seguimientos` | 3514 | Módulo de seguimientos/recordatorios |
| `ClientesInactivos` | 3833 | Vista de clientes sin visitas recientes |
| `AlertaSeguimientos` | 3965 | Widget de alertas de seguimientos |
| `AlertaClientesInactivos` | 3981 | Widget de clientes inactivos |
| `Dashboard` | 4008 | KPIs, comisiones, gráficos mensuales |
| `Ventas` | 4382 | Registro y gestión de ventas |
| `InventarioAnalytics` | 4908 | Análisis de inventario |
| `Inventario` | 5063 | Gestión de stock/productos |
| `Nomina` | 5280 | Nómina de empleados |
| `Gastos` | 5334 | Registro de gastos |
| `Reportes` | 5419 | Reportes por período |
| PetIA (motor) | 5495 | `IA_SEGMENTOS`, `iaPerfilCliente`, `iaOportunidades` + helpers `_e`, `IAChip`, `WABtn` |
| `CRM` | 5725 | CRM 360°: lista con asistente PetIA, ficha con tabs (Resumen IA, Historial, Salud, Seguimientos, Bitácora, Galería) |

### PetIA (inteligencia local del CRM)

- Todo el análisis corre en el navegador, sin llamadas externas ni API keys.
- `iaPerfilCliente(cliente, ventas)` calcula por cliente: segmento (VIP/Leal/Prometedor/Nuevo/En riesgo/Dormido/Sin visitas), score 0-100, riesgo de abandono (%), frecuencia de visita aprendida, próxima visita estimada, consumo por área (grooming/vet/pet shop), lealtad (10.º baño gratis), alertas de salud (vacunas vencidas, antipulgas, esterilización) y recomendaciones cross-sell.
- `iaOportunidades(...)` genera la lista de acciones del día (seguimientos vencidos, vacunas, cumpleaños, reactivaciones) con links de WhatsApp prellenados.
- Mensajes de WhatsApp personalizados por plantilla (`perfil.wa.plantillas`, sugerida en `perfil.wa.sugerida`).
- Bitácora de contactos por cliente en `localStorage` (`pc_crm_bitacora`) — no está en Supabase, igual que facturas.
- Fechas: el motor solo acepta fechas `YYYY-MM-DD` válidas (`iaFechaValida`) — hay ventas con fechas malformadas en el seed.

---

## Tablas Supabase

| Tabla | Uso |
|---|---|
| `pc_ventas` | Servicios vendidos (grooming, veterinaria, farmacia, medicamentos) |
| `pc_clientes` | CRM — mascotas y propietarios |
| `pc_seguimientos` | Recordatorios / seguimientos post-consulta |
| `pc_inventario` | Stock de productos |
| `pc_gastos` | Egresos del negocio |
| `pc_empleados` | Empleados (Alexander, Aylein, Leydeli) |
| `pc_pagos` | Pagos de nómina |

---

## Empleados

- **Alexander Ramírez** — Groomer, RD$25,000/mes
- **Aylein Santiago** — Médico Veterinaria, RD$25,000/mes
- **Leydeli Aybar** — Apoyo Operativo

---

## Colores del sistema (constante `C`)

```js
verde   = #1a6b3a   // color primario
verdeL  = #e8f5ee   // verde claro (fondos)
azul    = #1e40af
azulL   = #eff6ff
rojo    = #b8232a
rojoL   = #fef2f2
gold    = #92600a
goldL   = #fffbeb
negro   = #1a1d23
grisd   = #5a6472
gris    = #f4f5f6
```

---

## Funciones utilitarias clave

```js
RD(n)         // formatea número como "RD$ 1,234"
hoy()         // fecha actual ISO YYYY-MM-DD
useLS(key, def) // useState con localStorage
supaFetch(table, method, body, params) // wrapper REST Supabase
```

---

## Áreas de venta (campo `area` en ventas)

`grooming` | `veterinaria` | `farmacia` | `medicamentos`

---

## Ruflo MCP

Ruflo v3.5.80 está instalado y activo (transport stdio).

```bash
npx ruflo mcp status          # verificar estado
npx ruflo memory list         # ver contexto guardado
npx ruflo memory search -q "query"  # búsqueda semántica
```

**Memoria guardada en:** `.claude/memory.db`

Contexto almacenado en:
- `petcolinas/project` — descripción general del proyecto
- `petcolinas/componentes` — mapa de líneas por componente
- `petcolinas/arquitectura` — patrones y decisiones de diseño

Para recuperar al inicio de sesión:
```bash
npx ruflo memory retrieve -k "petcolinas/project"
```

---

## Notas importantes

- El archivo `index.html` es un monolito de ~5858 líneas. Al editar, usar siempre `offset` y `limit` en el Read para no cargar todo.
- Los datos seed contienen información real de clientes dominicanos — manejar con cuidado, no exponer en logs públicos.
- Fechas en el seed usan corrección: años `2026` futuros se normalizan a `2025` automáticamente en `normalizeRow`.
- El inventario tiene dos fuentes: `INVENTARIO_SEED` manual + `inventarioDeGastos` (auto-generado desde gastos de categoría "Inventario").
- `todosClientes` combina CRM real + clientes auto-detectados desde ventas (sin ficha CRM).
- Browser automation con Ruflo requiere `agent-browser` — no disponible en este entorno sin acceso a internet para descarga.

---

## Comandos útiles en desarrollo

```bash
# Servidor local para probar la app
python3 -m http.server 8080

# Ver estado del branch
git status && git log --oneline -5

# Push al branch de desarrollo
git push -u origin claude/resume-petcolinas-dev-XirXq

# Guardar contexto en Ruflo
npx ruflo memory store -k "petcolinas/<clave>" -v '<valor json>'
```
