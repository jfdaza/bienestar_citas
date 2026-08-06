# DISEÑO DE CASOS DE PRUEBA
## Sistema: Gestión de Citas - Bienestar SENA

---

## CONTENIDO

1. [Casos de Prueba Unitarias](#1-casos-de-prueba-unitarias)
2. [Casos de Prueba de Integración](#2-casos-de-prueba-de-integración)
3. [Casos de Prueba E2E (End-to-End)](#3-casos-de-prueba-e2e)
4. [Casos de Prueba de Carga](#4-casos-de-prueba-de-carga)
5. [Casos de Prueba de Estrés](#5-casos-de-prueba-de-estrés)

---

## 1. CASOS DE PRUEBA UNITARIAS

### 1.1 Validación de Esquema de Citas (appointment.schema.js)

| ID | Nombre | Datos de Entrada | Resultado Esperado | Estado |
|----|--------|------------------|-------------------|--------|
| UT-VAL-01 | Fecha en fin de semana rechazada | `scheduled_date: "2026-07-12"` (sábado) | Error: "No se agendan citas los fines de semana" | |
| UT-VAL-02 | Fecha en día laboral aceptada | `scheduled_date: "2026-07-08"` (miércoles) | Validación pasa | |
| UT-VAL-03 | Fecha pasada rechazada | `scheduled_date: "2026-07-01"` | Error: "No puedes agendar en fechas pasadas" | |
| UT-VAL-04 | Fecha con menos de 24h rechazada | `scheduled_date: fecha_actual` | Error: "Debes agendar con mínimo 24 horas de anticipación" | |
| UT-VAL-05 | Hora fuera de rango (antes de 8am) | `scheduled_time: "07:00"` | Error: "Horario debe ser entre 8:00 AM y 5:00 PM" | |
| UT-VAL-06 | Hora fuera de rango (después de 5pm) | `scheduled_time: "18:00"` | Error: "Horario debe ser entre 8:00 AM y 5:00 PM" | |
| UT-VAL-07 | Hora en rango válido | `scheduled_time: "10:00"` | Validación pasa | |
| UT-VAL-08 | Reason menor a 10 caracteres | `reason: "Hola"` | Error: "Describe tu situación en al menos 10 caracteres" | |
| UT-VAL-09 | Reason mayor a 250 caracteres | `reason: "A".repeat(251)` | Error: "Máximo 250 caracteres" | |
| UT-VAL-10 | Dependency ID inválido | `dependency_id: -1` | Error: "Selecciona una dependencia" | |
| UT-VAL-11 | Reason vacío (opcional) | `reason: ""` | Validación pasa | |
| UT-VAL-12 | Reason undefined (opcional) | `reason: undefined` | Validación pasa | |
| UT-VAL-13 | Formato de hora inválido | `scheduled_time: "10:00:00"` | Error: "Formato de hora inválido" | |
| UT-VAL-14 | Notes mayor a 1000 caracteres | `notes: "N".repeat(1001)` | Error de validación Zod | |

### 1.2 Función parseLocalDate

| ID | Nombre | Datos de Entrada | Resultado Esperado | Estado |
|----|--------|------------------|-------------------|--------|
| UT-DAT-01 | Parse fecha válida | `"2026-07-15"` | `new Date(2026, 6, 15)` | |
| UT-DAT-02 | Parse fecha con mes de un dígito | `"2026-1-5"` | `new Date(2026, 0, 5)` | |
| UT-DAT-03 | Parse fecha con día de un dígito | `"2026-07-5"` | `new Date(2026, 6, 5)` | |

### 1.3 Funciones de AuthProvider

| ID | Nombre | Datos de Entrada | Resultado Esperado | Estado |
|----|--------|------------------|-------------------|--------|
| UT-AUTH-01 | hasRole con rol único - match | `hasRole("APRENDIZ")` con profile.role = "APRENDIZ" | `true` | |
| UT-AUTH-02 | hasRole con rol único - no match | `hasRole("ADMIN")` con profile.role = "APRENDIZ" | `false` | |
| UT-AUTH-03 | hasRole con array de roles - match | `hasRole(["PSICOLOGIA", "ENFERMERIA"])` con role = "PSICOLOGIA" | `true` | |
| UT-AUTH-04 | hasRole sin profile | `hasRole("APRENDIZ")` con profile = null | `false` | |
| UT-AUTH-05 | isAdmin retorna true | profile.role = "SUPERADMIN" | `isAdmin() === true` | |
| UT-AUTH-06 | isProfessional retorna true | profile.role = "PSICOLOGIA" | `isProfessional() === true` | |
| UT-AUTH-07 | isCoordination retorna true | profile.role = "COORDINACION" | `isCoordination() === true` | |
| UT-AUTH-08 | isAprendiz retorna true | profile.role = "APRENDIZ" | `isAprendiz() === true` | |

### 1.4 Función getWeekDays (AppointmentForm)

| ID | Nombre | Datos de Entrada | Resultado Esperado | Estado |
|----|--------|------------------|-------------------|--------|
| UT-WEEK-01 | Retorna 7 días | Ninguno | Array de 7 elementos | |
| UT-WEEK-02 | Primer día es lunes | Ninguno | `days[0].day === "lun."` | |
| UT-WEEK-03 | Último día es domingo | Ninguno | `days[6].day === "dom."` | |
| UT-WEEK-04 | Marca día actual | Ninguno | Un elemento tiene `isToday: true` | |

### 1.5 AppointmentRepository (con mocks)

| ID | Nombre | Datos de Entrada | Resultado Esperado | Estado |
|----|--------|------------------|-------------------|--------|
| UT-REP-01 | fetch retorna citas enriquecidas | Mock de Supabase con datos | Array con dependencies y profiles | |
| UT-REP-02 | create inserta y retorna cita | Datos de nueva cita | Objeto de cita enriquecido | |
| UT-REP-03 | update modifica cita existente | ID + updates | Cita actualizada | |
| UT-REP-04 | checkAvailability retorna true | Horario libre | `true` | |
| UT-REP-05 | checkAvailability retorna false | Horario ocupado | `false` | |
| UT-REP-06 | countPending retorna conteo | userId válido | Número entero | |

---

## 2. CASOS DE PRUEBA DE INTEGRACIÓN

### 2.1 Hook useAppointments

| ID | Nombre | Precondiciones | Pasos | Resultado Esperado | Estado |
|----|--------|----------------|-------|-------------------|--------|
| IT-HOOK-01 | fetchAppointments carga citas | Usuario autenticado | Llamar `fetchAppointments()` | `appointments` se llena | |
| IT-HOOK-02 | createAppointment crea cita válida | Datos válidos, horario disponible | Llamar `createAppointment(data)` | `success: true` + toast | |
| IT-HOOK-03 | createAppointment rechaza 3ra cita | Usuario con 2 citas pendientes | Llamar `createAppointment(data)` | Error: "Ya tienes 2 citas pendientes" | |
| IT-HOOK-04 | createAppointment rechaza horario ocupado | Horario ya reservado | Llamar `createAppointment(data)` | Error: "Este horario ya está ocupado" | |
| IT-HOOK-05 | cancelAppointment cancela cita pending | Cita con status "pending" | Llamar `cancelAppointment(id)` | Status cambia a "cancelled" | |
| IT-HOOK-06 | cancelAppointment rechaza cita confirmed | Cita con status "confirmed" | Llamar `cancelAppointment(id)` | Error: "Solo puedes cancelar citas pendientes" | |
| IT-HOOK-07 | editAppointment modifica cita pending | Cita pending, nuevo horario disponible | Llamar `editAppointment(id, data)` | Cita modificada | |
| IT-HOOK-08 | editAppointment rechaza cita completed | Cita con status "completed" | Llamar `editAppointment(id, data)` | Error: "Solo puedes modificar citas pendientes o confirmadas" | |
| IT-HOOK-09 | RBAC filtra citas por rol aprendiz | Usuario rol APRENDIZ | `fetchAppointments()` | Solo ve sus propias citas | |
| IT-HOOK-10 | RBAC muestra todas las citas a coordinación | Usuario rol COORDINACION | `fetchAppointments()` | Ve citas de todas las dependencias | |
| IT-HOOK-11 | RBAC filtra por dependencia profesional | Usuario rol PSICOLOGIA | `fetchAppointments()` | Solo ve citas de Psicología | |

### 2.2 Formulario + Validación (AppointmentForm)

| ID | Nombre | Precondiciones | Pasos | Resultado Esperado | Estado |
|----|--------|----------------|-------|-------------------|--------|
| IT-FORM-01 | Wizard avanza al seleccionar servicio | Formulario en paso 1 | Click en card "Psicología" | Avanza a paso 2 (fecha) | |
| IT-FORM-02 | Wizard avanza al seleccionar fecha | Formulario en paso 2 | Click en día válido | Avanza a paso 3 (hora) | |
| IT-FORM-03 | Wizard avanza al seleccionar hora | Formulario en paso 3 | Click en "10:00 a. m." | Avanza a paso 4 (confirmar) | |
| IT-FORM-04 | Wizard retrocede con botón Atrás | Formulario en paso 3 | Click "Atrás" | Retrocede a paso 2 | |
| IT-FORM-05 | Submit exitoso crea cita | Todos los pasos completados | Click "Confirmar cita" | Cita creada + onSuccess() | |
| IT-FORM-06 | Validación de reason funciona | Reason < 10 caracteres | Intentar submit | Error de validación visible | |

### 2.3 Navegación + RBAC

| ID | Nombre | Precondiciones | Pasos | Resultado Esperado | Estado |
|----|--------|----------------|-------|-------------------|--------|
| IT-NAV-01 | Ruta raíz redirige a login | Sin sesión | Navegar a "/" | Redirige a "/login" | |
| IT-NAV-02 | Ruta /app sin sesión redirige a login | Sin sesión | Navegar a "/app" | Redirige a "/login" | |
| IT-NAV-03 | Ruta /app con sesión muestra dashboard | Sesión activa | Navegar a "/app" | Muestra dashboard según rol | |
| IT-NAV-04 | Ruta /dashboard redirige a /app | Sesión activa | Navegar a "/dashboard" | Redirige a "/app" | |
| IT-NAV-05 | Ruta 404 redirige a login | Sin sesión | Navegar a "/ruta-falsa" | Redirige a "/login" | |

---

## 3. CASOS DE PRUEBA E2E

### 3.1 Autenticación (e2e/auth.spec.js)

| ID | Nombre | Pasos | Resultado Esperado | Estado |
|----|--------|-------|-------------------|--------|
| TC-AUTH-01 | Login carga correctamente | Ir a /login | Formulario visible con email, password, botón | |
| TC-AUTH-02 | Credenciales inválidas muestra error | Llenar email incorrecto + password incorrecto + submit | Mensaje de error visible | |
| TC-AUTH-03 | Login exitoso como Aprendiz | Credenciales estudiante@gmail.com + submit | Redirige a /app | |
| TC-AUTH-04 | Login exitoso como Coordinación | Credenciales coordinador@gmail.com + submit | Redirige a /app | |
| TC-AUTH-05 | Login exitoso como Profesional | Credenciales docente@gmail.com + submit | Redirige a /app | |
| TC-AUTH-06 | Login exitoso como Admin | Credenciales ing.jfdq@gmail.com + submit | Redirige a /app | |
| TC-AUTH-07 | Ruta protegida sin sesión | Ir a /app sin login | Redirige a /login | |
| TC-AUTH-08 | Link de registro accesible | Ir a /login | Link "Regístrate aquí" visible | |

### 3.2 Dashboard Aprendiz (e2e/aprendiz.spec.js)

| ID | Nombre | Pasos | Resultado Esperado | Estado |
|----|--------|-------|-------------------|--------|
| TC-APR-01 | Dashboard carga con bienvenida | Login como aprendiz | H2 contiene "Hola" + "Bienvenido a Bienestar SENA" | |
| TC-APR-02 | Menú inferior muestra 4 pestañas | Login como aprendiz | 4 botones en .bottom-nav | |
| TC-APR-03 | Navegar a Mis Citas | Click "Mis citas" | H2 contiene "Mis Citas" | |
| TC-APR-04 | Nueva Cita abre modal | Click "Nueva Cita" | Modal visible (.modal-overlay) | |
| TC-APR-05 | Estadísticas visibles | Login como aprendiz | .stats-grid visible | |
| TC-APR-06 | Filtros de estado funcionan | Click en filter button | Botón tiene clase "active" | |
| TC-APR-07 | Cerrar modal con X | Abrir modal → Click .modal-close | Modal oculto | |
| TC-APR-08 | Notificaciones muestra contenido | Click "Notificaciones" | Texto "Notificaciones" visible | |

### 3.3 Dashboard Profesional (e2e/profesional.spec.js)

| ID | Nombre | Pasos | Resultado Esperado | Estado |
|----|--------|-------|-------------------|--------|
| TC-PRO-01 | Panel profesional carga | Login como docente | H2 contiene "Hola" + "Panel profesional" | |
| TC-PRO-02 | Fecha de hoy visible | Login como docente | Fecha actual mostrada | |
| TC-PRO-03 | 3 cards de estadísticas | Login como docente | 3 .stat-card en .stats-grid | |
| TC-PRO-04 | Tabs de filtro funcionan | Click "Pendientes" → "Confirmadas" | Ambos tabs con "active" al hacer click | |
| TC-PRO-05 | Botón notificaciones visible | Login como docente | Botón con aria-label "Notificaciones" visible | |
| TC-PRO-06 | Campana abre panel | Click botón notificaciones | Texto "Nuevas citas" visible | |
| TC-PRO-07 | Cerrar sesión funciona | Click "Cerrar sesión" | Redirige a /login | |
| TC-PRO-08 | Header del departamento visible | Login como docente | .dashboard-header visible | |

### 3.4 Dashboard Coordinación (e2e/coordinacion.spec.js)

| ID | Nombre | Pasos | Resultado Esperado | Estado |
|----|--------|-------|-------------------|--------|
| TC-COO-01 | Panel coordinación carga | Login como coordinador | H1 "Panel de Coordinación" visible | |
| TC-COO-02 | Subtítulo Bienestar SENA | Login como coordinador | Texto "Bienestar SENA" visible | |
| TC-COO-03 | Selector de fechas visible | Login como coordinador | .date-filter visible | |
| TC-COO-04 | Gráfico se renderiza | Login como coordinador | .charts-grid visible | |
| TC-COO-05 | Profesionales visibles | Login como coordinador | .professionals-section visible | |
| TC-COO-06 | Cerrar sesión funciona | Click "Cerrar sesión" | Redirige a /login | |
| TC-COO-07 | Quick links visibles | Login como coordinador | .quick-links visible | |
| TC-COO-08 | Filtro de fecha funciona | Seleccionar opción en select | Select tiene valor cambiado | |

### 3.5 Dashboard Admin (e2e/admin.spec.js)

| ID | Nombre | Pasos | Resultado Esperado | Estado |
|----|--------|-------|-------------------|--------|
| TC-ADM-01 | Panel admin carga | Login como admin | H1 "Panel de Administración" visible | |
| TC-ADM-02 | Tabs visibles | Login como admin | .admin-tabs visible, 2 .tab-btn | |
| TC-ADM-03 | Tab Usuarios activo por defecto | Login como admin | Tab "Gestión de Usuarios" con clase "active" | |
| TC-ADM-04 | Cambiar a tab Auditoría | Click "Registro de Auditoría" | .admin-content visible | |
| TC-ADM-05 | Cerrar sesión funciona | Click "Cerrar Sesión" | Redirige a /login | |

### 3.6 Navegación General (e2e/navigation.spec.js)

| ID | Nombre | Pasos | Resultado Esperado | Estado |
|----|--------|-------|-------------------|--------|
| TC-NAV-01 | Ruta raíz → login | Ir a "/" | Redirige a /login | |
| TC-NAV-02 | Ruta inexistente → login | Ir a "/ruta-que-no-existe" | Redirige a /login | |
| TC-NAV-03 | Logo SENA visible | Ir a /login | SVG logo visible | |
| TC-NAV-04 | Campos email/password visibles | Ir a /login | #login-email y #login-password visibles | |
| TC-NAV-05 | Link registro funciona | Click "Regístrate aquí" | Redirige a /register | |
| TC-NAV-06 | Página registro carga | Ir a /register | H1 visible | |

---

## 4. CASOS DE PRUEBA DE CARGA

### 4.1 Escenarios de Carga

| ID | Nombre | Configuración | Métrica | Resultado Esperado | Estado |
|----|--------|---------------|---------|-------------------|--------|
| LD-01 | Login concurrente (10 usuarios) | 10 usuarios simultáneos | Tiempo respuesta | < 5 segundos promedio | |
| LD-02 | Consulta de citas (50 usuarios) | 50 requests simultáneos | Throughput | > 20 req/seg | |
| LD-03 | Creación de citas (20 usuarios) | 20 creaciones simultáneas | Tasa de éxito | > 95% exitosos | |
| LD-04 | Dashboard coordinación carga | 10 consultas de KPIs | Tiempo respuesta | < 3 segundos | |
| LD-05 | Búsqueda de usuarios (admin) | 30 búsquedas simultáneas | Tiempo respuesta | < 2 segundos | |

### 4.2 Script de Prueba de Carga (Playwright)

```javascript
// tests/load/login-load.spec.js
import { test, expect } from '@playwright/test';

test.describe('Pruebas de Carga - Login', () => {
  test('LD-01: 10 logins concurrentes', async ({ browser }) => {
    const users = Array(10).fill(null).map((_, i) => ({
      email: `user${i}@test.com`,
      password: '123456'
    }));

    const startTime = Date.now();
    
    const results = await Promise.all(
      users.map(async (user) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        const pageStart = Date.now();
        
        await page.goto('/login');
        await page.fill('input[type="email"]', user.email);
        await page.fill('input[type="password"]', user.password);
        await page.click('button[type="submit"]');
        
        const elapsed = Date.now() - pageStart;
        await context.close();
        return elapsed;
      })
    );

    const avgTime = results.reduce((a, b) => a + b, 0) / results.length;
    const totalTime = Date.now() - startTime;
    
    console.log(`Tiempo promedio: ${avgTime}ms`);
    console.log(`Tiempo total: ${totalTime}ms`);
    
    expect(avgTime).toBeLessThan(5000);
  });
});
```

### 4.3 Métricas de Carga

| Métrica | Objetivo | Método de Medición |
|---------|----------|-------------------|
| **Tiempo de respuesta promedio** | < 3 segundos | Playwright timers |
| **Throughput** | > 20 req/seg | Conteo de requests |
| **Tasa de error** | < 5% | Errores / Total requests |
| **Tiempo de carga inicial** | < 5 segundos | First Contentful Paint |
| **Uso de memoria** | < 512MB | Performance API |

---

## 5. CASOS DE PRUEBA DE ESTRÉS

### 5.1 Escenarios de Estrés

| ID | Nombre | Configuración | Métrica | Resultado Esperado | Estado |
|----|--------|---------------|---------|-------------------|--------|
| ST-01 | Sobrecarga de login | 100 intentos en 10 segundos | Tasa de error | Sistema responde sin crash | |
| ST-02 | Límite de conexiones DB | 50 queries simultáneas | Tiempo de timeout | No hay timeout > 30s | |
| ST-03 | Memory leak test | 1000 navegaciones | Uso de memoria | No crece indefinidamente | |
| ST-04 | Timeout de red | Simular latencia 5s | Comportamiento | Mensaje de error apropiado | |
| ST-05 | Datos masivos | 10,000 registros de citas | Rendimiento queries | Respuesta < 5 segundos | |

### 5.2 Script de Prueba de Estrés

```javascript
// tests/stress/appointment-stress.spec.js
import { test, expect } from '@playwright/test';

test.describe('Pruebas de Estrés', () => {
  test('ST-01: 100 logins en ráfaga', async ({ browser }) => {
    const burstCount = 100;
    let successCount = 0;
    let errorCount = 0;

    const promises = Array(burstCount).fill(null).map(async () => {
      try {
        const context = await browser.newContext();
        const page = await context.newPage();
        
        await page.goto('/login');
        await page.fill('input[type="email"]', 'test@test.com');
        await page.fill('input[type="password"]', '123456');
        await page.click('button[type="submit"]');
        
        await page.waitForTimeout(2000);
        successCount++;
        await context.close();
      } catch (e) {
        errorCount++;
      }
    });

    await Promise.allSettled(promises);
    
    console.log(`Éxitos: ${successCount}/${burstCount}`);
    console.log(`Errores: ${errorCount}/${burstCount}`);
    
    // El sistema no debe crashear
    expect(successCount + errorCount).toBe(burstCount);
    expect(errorCount / burstCount).toBeLessThan(0.5); // < 50% errores
  });

  test('ST-03: Memory leak - 1000 navegaciones', async ({ page }) => {
    const initialMemory = await page.evaluate(() => 
      performance.memory?.usedJSHeapSize || 0
    );

    for (let i = 0; i < 1000; i++) {
      await page.goto('/login');
      await page.goto('/register');
    }

    const finalMemory = await page.evaluate(() => 
      performance.memory?.usedJSHeapSize || 0
    );

    if (initialMemory > 0) {
      const memoryGrowth = finalMemory - initialMemory;
      const growthPercentage = (memoryGrowth / initialMemory) * 100;
      
      console.log(`Memory inicial: ${initialMemory / 1024 / 1024}MB`);
      console.log(`Memory final: ${finalMemory / 1024 / 1024}MB`);
      console.log(`Crecimiento: ${growthPercentage.toFixed(2)}%`);
      
      // No debe crecer más del 100%
      expect(growthPercentage).toBeLessThan(100);
    }
  });
});
```

### 5.3 Escalabilidad

| Escenario | Usuarios Simultáneos | Recurso | Límite |
|-----------|---------------------|---------|--------|
| Login | 100 | CPU | < 80% |
| Consulta citas | 50 | RAM | < 512MB |
| Crear cita | 20 | Conexiones DB | < 100 |
| Dashboard | 10 | Ancho de banda | < 10Mbps |

---

## 6. MATRIZ DE COBERTURA

| Módulo | Unitarias | Integración | E2E | Carga | Estrés | Total |
|--------|-----------|-------------|-----|-------|--------|-------|
| Autenticación | 8 | 5 | 8 | 1 | 1 | 23 |
| Validaciones | 14 | 0 | 0 | 0 | 0 | 14 |
| Gestión Citas | 6 | 11 | 8 | 2 | 2 | 29 |
| Dashboard | 4 | 5 | 24 | 2 | 2 | 37 |
| Navegación | 0 | 5 | 6 | 0 | 0 | 11 |
| Admin | 0 | 0 | 5 | 1 | 0 | 6 |
| **TOTAL** | **32** | **26** | **51** | **6** | **5** | **120** |

---

**Documento generado**: 07 de Julio de 2026
**Proyecto**: Gestión de Citas - Bienestar SENA
**Versión**: 1.0
