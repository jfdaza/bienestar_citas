# Auditoría Técnica — Gestión de Citas Bienestar SENA

## Resumen ejecutivo
Sistema de gestión de citas para el SENA construido con React + Vite + Supabase. La arquitectura feature-based es correcta a alto nivel, pero tiene **una vulnerabilidad de seguridad crítica** (service role key expuesta en frontend), **función de logging de seguridad que no hace nada**, y **DRY violations severas** que duplican lógica de calendario, formato de tiempo y patrones de UI en 6+ archivos. El mayor riesgo sin intervenir es la exposición de credenciales admin en el bundle de producción.

## Scorecard

| Categoría | Puntuación | Problemas encontrados |
|---|---|---|
| SOLID | 5/10 | 6 violaciones |
| Arquitectura | 5/10 | 5 problemas |
| Deuda técnica | 4/10 | 12 ítems |
| Anti-patrones | 5/10 | 8 instancias |
| Patrones faltantes | 6/10 | 3 oportunidades |
| **Promedio** | **5/10** | |

---

## 🔴 Crítico — Fix antes de deploy

### 1. Service Role Key expuesta en el frontend
- **Categoría**: Seguridad / Arquitectura
- **Dónde**: `src/lib/supabase.js:13-24`, `src/providers/AuthProvider.jsx:17`, `src/features/auth/pages/Register.jsx:5`
- **Problema**: `VITE_SUPABASE_SERVICE_ROLE_KEY` se importa y usa en el cliente. Esta key bypasea RLS y tiene privilegios de admin. Cualquier usuario puede inspeccionar el bundle y obtenerla.
- **Por qué importa**: Con esta key alguien puede leer/escribor/borrar cualquier dato en la base de datos,saltándose todas las reglas de seguridad Row Level Security.
- **Fix sugerido**: Eliminar `supabaseAdmin` del frontend. Todas las operaciones admin deben hacerse via Edge Functions o API server-side.

### 2. `logSecurityEvent` es un no-op
- **Categoría**: Deuda / Seguridad
- **Dónde**: `src/hooks/useSecurity.js:125-127`
- **Problema**: La función `logSecurityEvent` solo hace `return;` — no registra nada. Sin embargo se llama en `AuthProvider.jsx:182,190` y `Register.jsx:145,161,165` creando una falsa sensación de seguridad.
- **Por qué importa**: Los eventos de seguridad (login fallido, registro) no se están auditando. En un entorno educativo/SAVA esto es un requisito de compliance.
- **Fix sugerido**: Implementar logging real via Supabase o Edge Function, o eliminar las llamadas para no ser engañoso.

### 3. CSP header bloquea recursos en Vercel
- **Categoría**: Arquitectura / Deploy
- **Dónde**: `index.html:13`
- **Problema**: El Content-Security-Policy usa `default-src 'self'` y `script-src 'self'`. En Vercel con dominio custom o deploy previews, los assets servidos desde CDN de Vercel pueden ser bloqueados. Además, el CSP está hardcodeado y no se adapta al entorno.
- **Por qué importa**: Causa los errores 404 que impiden que la app funcione en producción.
- **Fix sugerido**: Relaxear CSP para permitir dominios de Vercase, o移除 CSP meta tag y usar headers de Vercel.

---

## 🟠 Alto

### 4. Utilidades de calendario duplicadas (DRY)
- **Categoría**: Deuda técnica
- **Dónde**: `src/features/appointments/components/AppointmentForm.jsx:12-30` vs `src/features/appointments/components/CalendarView.jsx:5-23`
- **Problema**: `MONTH_NAMES`, `DAYS_OF_WEEK`, `getDaysInMonth`, `getFirstDayOfMonth`, `formatDateStr` están copiados idénticos en ambos archivos. También `prevMonth`/`nextMonth` (AppointmentForm:147-163 vs CalendarView:92-108).
- **Por qué importa**: Cualquier bug fix o cambio de localización debe hacerse en 2 lugares. Ya hay inconsistencia: CalendarView usa `"07:00"` como hora inicial vs AppointmentForm usa `"8:00 a. m."`.
- **Fix sugerido**: Extraer a `src/shared/utils/calendar.js`.

### 5. `formatTimeAgo` duplicada
- **Categoría**: Deuda técnica
- **Dónde**: `src/features/appointments/components/NotificationsView.jsx:7-20` vs `src/features/admin/components/AuditLogViewer.jsx:63-76`
- **Problema**: Función idéntica copiada en dos archivos.
- **Por qué importa**: Si hay un bug de formato (ej: no soporta meses), se debe arreglar en 2 lugares.
- **Fix sugerido**: Extraer a `src/shared/utils/format.js`.

### 6. `supabaseAdmin` usado en componentes UI
- **Categoría**: Arquitectura / Seguridad
- **Dónde**: `src/features/appointments/components/AppointmentForm.jsx:6,109`, `src/features/admin/components/UserManagement.jsx:3`, `src/features/auth/pages/Register.jsx:5`
- **Problema**: Múltiples componentes importan `supabaseAdmin` directamente para hacer queries, bypassando el repository layer.
- **Por qué importa**: Mezcla capas (UI → DB directamente), hace imposible testear, y expone la service role key en el bundle.
- **Fix sugerido**: Mover todas las queries a los repositories existentes (`appointments.repository.js`, `admin.repository.js`).

### 7. Manejo de errores inconsistente en repositorios
- **Categoría**: Deuda técnica
- **Dónde**: `src/features/appointments/api/appointments.repository.js:162,176`, `src/features/dashboard/api/dashboard.repository.js:27,32,49`
- **Problema**: `checkAvailability` retorna `true` (disponible) cuando hay error de DB, y `countPending` retorna `0` cuando falla. Esto podría permitir reservas duplicadas o exceder límites.
- **Por qué importa**: Un error de red podría permitir que un usuario agende más citas de las permitidas.
- **Fix sugerido**: Lanzar errores en vez de retornar valores por defecto falsos.

### 8. Estilos inline masivos ignorando design system
- **Categoría**: Deuda técnica
- **Dónde**: `CalendarView.jsx` (364 líneas JSX), `ProfileMenu.jsx` (300+ líneas), `NotificationsView.jsx` (210 líneas), `AprendizDashboard.jsx` (198 líneas)
- **Problema**: ~80% de los componentes usan inline styles con colores hardcodeados (`#39A900`, `#6B7280`) en vez de las CSS variables ya definidas en `variables.css`.
- **Por qué importa**: Imposible hacer theming, dark mode, o cambios de diseño globales. Los colores están en 15+ archivos.
- **Fix sugerido**: Migrar gradualmente a las CSS classes existentes en `layout.css`, `buttons.css`.

---

## 🟡 Medio

### 9. `ProfileMenu.jsx` tiene dos componentes
- **Categoría**: SOLID (SRP)
- **Dónde**: `src/features/appointments/components/ProfileMenu.jsx:7-246` (EditProfileModal) + `248-563` (ProfileMenu)
- **Problema**: `EditProfileModal` y `ProfileMenu` están en el mismo archivo de 564 líneas.
- **Fix sugerido**: Separar en archivos independientes.

### 10. `handleSaveProfile` es fake
- **Categoría**: Deuda técnica
- **Dónde**: `src/features/appointments/components/ProfileMenu.jsx:258-262`
- **Problema**: La función solo setea estado local con un comentario "In a real app...". Los usuarios piensan que su perfil se guardó pero no se persiste.
- **Fix sugerido**: Implementar guardado real via repository, o mostrar warning de que es demo.

### 11. Nombres de acciones inconsistentes en audit log
- **Categoría**: Anti-patrón
- **Dónde**: `src/features/admin/api/admin.repository.js:111` (`'update_user'`) vs `:189` (`'CREATE_USER'`)
- **Problema**: Mezcla snake_case y UPPER_SNAKE_CASE para las mismas acciones.
- **Fix sugerido**: Unificar a un solo formato.

### 12. Datos hardcodeados en CoordinationDashboard
- **Categoría**: Deuda técnica
- **Dónde**: `src/features/dashboard/pages/CoordinationDashboard.jsx:115,169,181`
- **Problema**: Porcentajes de tendencia hardcodeados (`"+18% vs semana anterior"`) que no vienen de datos reales.
- **Por qué importa**: Los usuarios ven datos falsos que no reflejan la realidad.
- **Fix sugerido**: Calcular desde datos reales o eliminar si no hay data.

### 13. Links muertos en CoordinationDashboard
- **Categoría**: Deuda técnica
- **Dónde**: `src/features/dashboard/pages/CoordinationDashboard.jsx:209-236`
- **Problema**: Cuatro `<a href="#">` que no van a ningún lado.
- **Fix sugerido**: Implementar o eliminar.

### 14. `DependencyChart` importa Recharts pero no lo usa
- **Categoría**: Deuda técnica
- **Dónde**: `src/features/dashboard/components/DependencyChart.jsx:1-3`
- **Problema**: Importa `BarChart`, `Bar`, `XAxis`, etc. de recharts pero usa barras HTML custom.
- **Fix sugerido**: Eliminar imports no usados.

### 15. CSV injection en useDashboard
- **Categoría**: Seguridad
- **Dónde**: `src/features/dashboard/api/hooks/useDashboard.js:70-76`
- **Problema**: La generación de CSV no sanitiza valores de celdas. Un nombre con `=CMD(...)` podría ejecutar comandos al abrir en Excel.
- **Fix sugerido**: Prefijar celdas que empiezan con `=`, `+`, `-`, `@` con `'`.

---

## 🟢 Bajo / Nice-to-have

- `Login.jsx` no tiene rate limiting (Register sí lo tiene)
- `KPICard.jsx` tiene lógica de icono duplicada (switch en `getIcon` y `getIconBg`)
- Placeholder links `<a href="#">` en Login.jsx:93-94 para Terms/Privacy
- `useAdmin.js` tiene `fetchUsers` con dependencias vacías en useCallback (stale closure risk)
- `admin.repository.js` tiene función `createUser` de 76 líneas

---

## ✅ Lo que está bien

1. **Arquitectura feature-based limpia**: `features/auth`, `features/appointments`, `features/admin`, `features/dashboard` — separación clara por dominio.
2. **Lazy loading de rutas**: `AppRoutes.jsx` usa `React.lazy` correctamente para code splitting.
3. **CSS Design System completo**: `variables.css` con tokens de color, spacing, typography, shadows — bien pensado.
4. **Validación con Zod**: `appointment.schema.js` tiene validación robusta de fechas, horas y fines de semana.
5. **Rate limiting client-side**: `useSecurity.js` implementa rate limiting para formularios.

---

## Plan de acción sugerido

1. **Eliminar `supabaseAdmin` del frontend** — ~4h — CRÍTICO seguridad
2. **Implementar `logSecurityEvent` real o eliminar llamadas** — ~1h — CRÍTICO compliance
3. **Fix CSP header para Vercel** — ~30min — CRÍTICO deploy
4. **Extraer utilidades de calendario a shared/** — ~1h — ALTO DRY
5. **Extraer `formatTimeAgo` a shared/** — ~15min — ALTO DRY
6. **Fix error handling en repositorios** — ~1h — ALTO confiabilidad
7. **Migrar inline styles a CSS classes** — ~4h — MEDIO mantenibilidad

---

## Notas de tecnología / Stack

- **Vite 8 + React 19**: Stack moderno, bien elegido.
- **Supabase**: RLS está configurado pero bypaseado por `supabaseAdmin` en el frontend — esto anula completamente la seguridad de Supabase.
- **react-hook-form + zod**: Buen combo de validación, pero `Register.jsx` no lo usa (validación manual).
- **Sonner para toast**: Bien, pero los errores se manejan inconsistently (a veces toast, a veces console.error, a veces nada).
