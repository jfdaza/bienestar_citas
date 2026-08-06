# PLAN DE PRUEBAS
## Sistema: Gestión de Citas - Bienestar SENA

---

## 1. INFORMACIÓN GENERAL

| Campo | Valor |
|-------|-------|
| **Nombre del Proyecto** | Gestión de Citas - Bienestar SENA |
| **Versión del Plan** | 1.0 |
| **Fecha de Elaboración** | 07 de Julio de 2026 |
| **Responsable de Pruebas** | Equipo de Desarrollo |
| **Herramientas** | Vitest, Playwright, Testing Library |
| **Entorno de Pruebas** | Local (localhost:5173) + Supabase (Dev) |

---

## 2. ALMACÉN DE ARTICULOS (TEST ITEMS)

### 2.1 Módulos del Sistema

| ID | Módulo | Descripción | Componentes Principales |
|----|--------|-------------|-------------------------|
| MOD-01 | **Autenticación** | Login, registro, sesión | Login.jsx, Register.jsx, AuthProvider.jsx |
| MOD-02 | **Gestión de Citas** | CRUD de citas | AppointmentForm.jsx, useAppointments.js, AppointmentRepository.js |
| MOD-03 | **Dashboard Aprendiz** | Panel del estudiante | AprendizDashboard.jsx, CalendarView.jsx, NotificationsView.jsx |
| MOD-04 | **Dashboard Profesional** | Panel del profesional | ProfessionalDashboard.jsx, ProfessionalTable.jsx |
| MOD-05 | **Dashboard Coordinación** | Panel de coordinación | CoordinationDashboard.jsx, charts |
| MOD-06 | **Administración** | Gestión de usuarios y auditoría | AdminDashboard.jsx, UserManagement.jsx, AuditLogViewer.jsx |
| MOD-07 | **Navegación** | Rutas y protección | AppRoutes.jsx, ProtectedRoute.jsx |
| MOD-08 | **Validaciones** | Esquemas de validación | appointment.schema.js (Zod) |

---

## 3. FUNCIONES A PROBAR

### 3.1 Funcionalidades por Módulo

#### MOD-01: Autenticación
- [ ] Login con credenciales válidas (4 roles)
- [ ] Login con credenciales inválidas
- [ ] Registro de nuevo usuario (2 pasos)
- [ ] Cierre de sesión
- [ ] Restauración de sesión al recargar
- [ ] RBAC: Redirección según rol

#### MOD-02: Gestión de Citas
- [ ] Crear nueva cita (wizard 4 pasos)
- [ ] Seleccionar servicio (Psicología, Enfermería, Trabajo Social)
- [ ] Seleccionar fecha (solo días laborales)
- [ ] Seleccionar horario (8:00 - 17:00)
- [ ] Validar máximo 2 citas pendientes por aprendiz
- [ ] Verificar disponibilidad de horario
- [ ] Editar cita pendiente/confirmada
- [ ] Cancelar cita pendiente
- [ ] Cambiar estado de cita (profesional)

#### MOD-03: Dashboard Aprendiz
- [ ] Visualizar bienvenida personalizada
- [ ] Ver estadísticas (citas pendientes, completadas, total)
- [ ] Navegar por pestañas (Inicio, Mis Citas, Calendario, Notificaciones)
- [ ] Ver notificaciones con badge
- [ ] Expandir/colapsar notificaciones
- [ ] Marcar notificaciones como leídas

#### MOD-04: Dashboard Profesional
- [ ] Ver citas asignadas por dependencia
- [ ] Filtrar por estado (Pendientes, Confirmadas, Completadas)
- [ ] Confirmar cita
- [ ] Completar cita con notas
- [ ] Ver estadísticas del día

#### MOD-05: Dashboard Coordinación
- [ ] Ver KPIs generales
- [ ] Gráfico de citas por dependencia
- [ ] Evolución mensual
- [ ] Ranking de profesionales
- [ ] Filtro por rango de fechas

#### MOD-06: Administración
- [ ] Gestionar usuarios (CRUD)
- [ ] Cambiar roles de usuario
- [ ] Activar/desactivar usuarios
- [ ] Ver log de auditoría
- [ ] Filtrar logs por acción/fecha

---

## 4. ENFOQUE DE PRUEBAS

### 4.1 Estrategia por Nivel

| Nivel | Enfoque | Herramienta | Cobertura Objetivo |
|-------|---------|-------------|-------------------|
| **Unitarias** | Caja Blanca | Vitest | Funciones puras, validaciones |
| **Integración** | Caja Gris | Vitest + mocks | Hooks + repositorios |
| **E2E** | Caja Negra | Playwright | Flujos completos |
| **Carga** | No funcional | Playwright (scripts) | Respuesta bajo demanda |
| **Estrés** | No funcional | Scripts personalizados | Punto de quiebre |

### 4.2 Técnicas de Diseño de Pruebas

| Técnica | Aplicación |
|---------|------------|
| **Partición de equivalencia** | Horarios: mañana (8-12), tarde (14-17) |
| **Análisis de valor límite** | Fechas: hoy, mañana, fin de semana |
| **Transiciones de estado** | Estados de cita: pending → confirmed → completed |
| **Descubrimiento de errores** | Credenciales inválidas, datos faltantes |
| **Tablas de decisión** | RBAC: rol → permisos → dashboard |

---

## 5. RECURSOS NECESARIOS

### 5.1 Infraestructura

| Recurso | Especificación |
|---------|----------------|
| **Servidor de desarrollo** | Vite Dev Server (localhost:5173) |
| **Base de datos** | Supabase (proyecto Dev) |
| **Navegador** | Chromium (Playwright) |
| **Node.js** | v18+ |
| **RAM** | Mínimo 4GB |

### 5.2 Datos de Prueba

| Usuario | Email | Password | Rol |
|---------|-------|----------|-----|
| Aprendiz | estudiante@gmail.com | 123456 | APRENDIZ |
| Profesional | docente@gmail.com | 123456 | PSICOLOGIA |
| Coordinador | coordinador@gmail.com | 123456 | COORDINACION |
| Admin | ing.jfdq@gmail.com | 123456 | SUPERADMIN |

---

## 6. PROGRAMACIÓN DE PRUEBAS

### 6.1 Cronograma

| Fase | Actividad | Duración | Dependencia |
|------|-----------|----------|-------------|
| 1 | Pruebas unitarias (continuo) | Todo el desarrollo | Código escrito |
| 2 | Pruebas de integración | Post-develop | Tests unitarios OK |
| 3 | Pruebas E2E | Post-integración | Ambiente Dev disponible |
| 4 | Pruebas de carga | Pre-deploy | Tests E2E OK |
| 5 | Pruebas de estrés | Pre-deploy | Pruebas de carga OK |
| 6 | Regresión | Post-fix | Cualquier cambio |

### 6.2 Ejecución Automatizada

```bash
# Tests unitarios (se ejecutan en cada commit)
npm run test:run

# Tests E2E (se ejecutan antes de cada deploy)
npm run test:e2e

# Lint (se ejecuta en cada commit)
npm run lint
```

---

## 7. CRITERIOS DE ACEPTACIÓN

### 7.1 Pruebas Unitarias
- [ ] Todos los tests pasan (0 failures)
- [ ] Cobertura de código ≥ 70%
- [ ] No hay tests skipped

### 7.2 Pruebas de Integración
- [ ] Hooks funcionan correctamente con mocks
- [ ] Formularios validan correctamente
- [ ] Navegación entre componentes funciona

### 7.3 Pruebas E2E
- [ ] Login funciona para los 4 roles
- [ ] Cada rol accede a su dashboard correcto
- [ ] CRUD de citas funciona end-to-end
- [ ] RBAC bloquea acceso no autorizado

### 7.4 Pruebas No Funcionales
- [ ] Tiempo de respuesta < 3 segundos
- [ ] Sistema soporta 50+ usuarios simultáneos
- [ ] No hay memory leaks visibles

---

## 8. ENTREGABLES

| Entregable | Formato | Ubicación |
|------------|---------|-----------|
| Plan de Pruebas | Markdown | `documentacion/pruebas/02-PLAN-DE-PRUEBAS.md` |
| Casos de Prueba | Markdown | `documentacion/pruebas/03-DISENO-CASOS-DE-PRUEBA.md` |
| Resultados de Pruebas | Markdown | `documentacion/pruebas/04-DOCUMENTACION-DE-PRUEBAS.md` |
| Reporte E2E | HTML | `e2e/report/index.html` |
| Scripts E2E | JavaScript | `e2e/*.spec.js` |
| Scripts Unitarios | JavaScript | `src/test/*.test.jsx` |

---

## 9. RIESGOS DEL PLAN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Supabase caído | Baja | Alto | Usar datos mock |
| Tests flaky | Media | Medio | Reintentos + timeouts |
| Cobertura insuficiente | Media | Alto | Monitoreo continuo |
| Falta de datos de prueba | Baja | Medio | Scripts de seed |

---

## 10. APROBACIÓN

| Rol | Nombre | Fecha | Firma |
|-----|--------|-------|-------|
| Líder Técnico | _____________ | ___/___/2026 | _________ |
| Product Owner | _____________ | ___/___/2026 | _________ |
| QA Lead | _____________ | ___/___/2026 | _________ |

---

**Documento generado**: 07 de Julio de 2026
**Proyecto**: Gestión de Citas - Bienestar SENA
**Versión**: 1.0
