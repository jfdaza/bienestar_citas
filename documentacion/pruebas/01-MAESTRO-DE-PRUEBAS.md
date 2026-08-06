# MAESTRO DE PRUEBAS DE SOFTWARE
## Sistema: Gestión de Citas - Bienestar SENA

---

## 1. CONCEPTOS FUNDAMENTALES DE PRUEBAS DE SOFTWARE

### 1.1 Definición
Las **pruebas de software** son un conjunto de actividades sistemáticas que permiten evaluar si un producto de software cumple con los requisitos especificados y está libre de defectos. Según IEEE 829, es el proceso de ejecutar un programa con la intención de encontrar errores.

### 1.2 Objetivos
| Objetivo | Descripción |
|----------|-------------|
| **Verificación** | Confirmar que el software cumple con los requisitos funcionales |
| **Validación** | Asegurar que el software satisface las necesidades del usuario |
| **Detección de defectos** | Identificar errores antes de la producción |
| **Generación de confianza** | Proporcionar evidencia de la calidad del producto |
| **Prevención** | Evitar que defectos lleguen al usuario final |

### 1.3 Propiedades a verificar
- **Funcionalidad**: ¿El sistema hace lo que debe hacer?
- **Confiabilidad**: ¿El sistema funciona sin fallos?
- **Usabilidad**: ¿El sistema es fácil de usar?
- **Rendimiento**: ¿El sistema responde en tiempos aceptables?
- **Seguridad**: ¿El sistema protege la información?
- **Mantenibilidad**: ¿El código es fácil de modificar?

---

## 2. NIVELES DE PRUEBAS

### 2.1 Modelo de Pruebas en V (Adaptado al Proyecto)

```
Requisitos de Usuario ──────────────── Pruebas de Aceptación (E2E)
        │                                       │
    Diseño ───────────────────────────── Pruebas de Integración
        │                                       │
  Arquitectura ─────────────────────── Pruebas de Sistema
        │                                       │
    Componentes ────────────────────── Pruebas Unitarias
        │                                       │
      Código ───────────────────────── Pruebas de Componente
```

### 2.2 Descripción por Nivel

#### Nivel 1: Pruebas Unitarias
- **Objetivo**: Verificar funciones y componentes aislados
- **Herramienta**: Vitest + Testing Library
- **Alcance**: Validación de esquemas Zod, hooks, funciones puras
- **Responsable**: Desarrollador

#### Nivel 2: Pruebas de Integración
- **Objetivo**: Verificar interacción entre componentes
- **Herramienta**: Vitest + Testing Library + Mocks de Supabase
- **Alcance**: Hooks con repositorios, formularios con validación
- **Responsable**: Desarrollador

#### Nivel 3: Pruebas de Sistema (E2E)
- **Objetivo**: Verificar flujos completos del usuario
- **Herramienta**: Playwright
- **Alcance**: Login, navegación, CRUD de citas por rol
- **Responsable**: QA / Desarrollador

#### Nivel 4: Pruebas de Aceptación
- **Objetivo**: Validar con el usuario real
- **Herramienta**: Manual + checklist
- **Alcance**: Flujo completo de agendamiento de citas
- **Responsable**: Product Owner / Usuario

---

## 3. TIPOS DE PRUEBAS

### 3.1 Pruebas Funcionales

| Tipo | Descripción | Aplicación en el Proyecto |
|------|-------------|---------------------------|
| **Unitarias** | Prueban unidades de código aisladas | Validación Zod, funciones del AppointmentRepository |
| **Integración** | Prueban interacción entre módulos | useForm + Zod + useAppointments |
| **E2E (End-to-End)** | Simulan escenarios completos del usuario | Login → Dashboard → Agendar cita |
| **Regresión** | Verifican que cambios no rompan funcionalidad existente | Ejecución automática tras cada commit |

### 3.2 Pruebas No Funcionales

| Tipo | Descripción | Aplicación en el Proyecto |
|------|-------------|---------------------------|
| **Carga** | Evalúan comportamiento bajo alta demanda | Múltiples usuarios agendando citas simultáneamente |
| **Estrés** | Buscan el punto de quiebre del sistema | 100+ conexiones concurrentes a Supabase |
| **Usabilidad** | Evalúan facilidad de uso | Formulario multi-paso de 4 pasos |
| **Seguridad** | Verifican protección de datos | RBAC por roles, validación de sesión |
| **Accesibilidad** | Verifican acceso para personas con discapacidad | Labels, roles ARIA, contraste de colores |

### 3.3 Pruebas Basadas en Estructura

| Tipo | Descripción | Aplicación |
|------|-------------|------------|
| **Caja Blanca** | Prueban la lógica interna del código | Cobertura de ramas en appointmentSchema |
| **Caja Negra** | Prueban sin conocer la implementación | Tests E2E con Playwright |
| **Caja Gris** | Combinación de ambas | Tests de integración con conocimiento parcial |

### 3.4 Pruebas Basadas en Experiencia

| Tipo | Descripción | Aplicación |
|------|-------------|------------|
| **Exploratoria** | Pruebas manuales sin scripts predefinidos | Explorar flujos no previstos |
| **Ad-hoc** | Pruebas dirigidas por intuición del tester | Verificar edge cases específicos |

---

## 4. ENFOQUES DE PRUEBAS

### 4.1 Enfoque Basado en Requisitos (Requirements-Based Testing)
Se derivan casos de prueba directamente de los requisitos funcionales:

| Requisito | Caso de Prueba | Tipo |
|-----------|----------------|------|
| RF-01: Login con credenciales válidas | TC-AUTH-03 a TC-AUTH-06 | E2E |
| RF-02: Login con credenciales inválidas | TC-AUTH-02 | E2E |
| RF-03: RBAC por roles | TC-AUTH-07 | E2E |
| RF-04: Agendar cita | TC-APR-04 | E2E |
| RF-05: Validar fecha laboral | appointmentSchema.test | Unitaria |
| RF-06: Máximo 2 citas pendientes | useAppointments.test | Integración |

### 4.2 Enfoque Basado en Riesgos (Risk-Based Testing)
Priorización de pruebas según impacto:

| Riesgo | Probabilidad | Impacto | Prioridad de Prueba |
|--------|--------------|---------|---------------------|
| Fallo en autenticación | Alta | Crítica | **MÁXIMA** |
| Pérdida de datos de citas | Media | Alta | **ALTA** |
| Error en validación de fechas | Alta | Media | **ALTA** |
| Fallo en RBAC | Baja | Crítica | **MEDIA** |
| Degradación de rendimiento | Media | Media | **MEDIA** |

### 4.3 Enfoque Basado en Modelos (Model-Based Testing)
Se modelan los estados de una cita:

```
           ┌─────────────┐
           │   PENDING   │ ← Estado inicial
           └──────┬──────┘
                  │
        ┌─────────┼─────────┐
        ▼                   ▼
┌──────────────┐   ┌──────────────┐
│  CONFIRMED   │   │  CANCELLED   │
└──────┬───────┘   └──────────────┘
       │
       ▼
┌──────────────┐
│  COMPLETED   │
└──────────────┘
```

### 4.4 Enfoque Basado en Checklists
Lista de verificación para cada sprint:

- [ ] Todos los tests unitarios pasan
- [ ] Cobertura de código > 70%
- [ ] Tests E2E pasan en los 4 roles
- [ ] No hay errores en consola
- [ ] Validación de formularios funciona correctamente
- [ ] RBAC funciona por cada rol
- [ ] Responsive design en móvil y desktop

---

## 5. HERRAMIENTAS TECNOLÓGICAS

### 5.1 Stack de Pruebas del Proyecto

| Herramienta | Versión | Uso | Configuración |
|-------------|---------|-----|---------------|
| **Vitest** | 4.1.9 | Pruebas unitarias e integración | `vite.config.js` (test section) |
| **Testing Library** | 16.3.2 | Testing de componentes React | `@testing-library/react` |
| **jsdom** | 29.1.1 | Entorno DOM para Vitest | `environment: "jsdom"` |
| **Playwright** | 1.61.0 | Pruebas E2E cross-browser | `playwright.config.js` |
| **jest-dom** | 6.9.1 | Matchers personalizados DOM | `src/test/setup.js` |
| **ESLint** | 9.39.4 | Linting estático | `eslint.config.js` |

### 5.2 Configuración de Vitest

```javascript
// vite.config.js
test: {
  globals: true,
  environment: "jsdom",
  setupFiles: "./src/test/setup.js",
  css: true,
}
```

### 5.3 Configuración de Playwright

```javascript
// playwright.config.js
use: {
  baseURL: "http://localhost:5173",
  headless: true,
  screenshot: "only-on-failure",
  trace: "retain-on-failure",
  viewport: { width: 1280, height: 720 },
},
projects: [
  { name: "chromium", use: { browserName: "chromium" } },
],
```

### 5.4 Comandos de Ejecución

| Comando | Descripción |
|---------|-------------|
| `npm run test` | Ejecutar tests unitarios en modo watch |
| `npm run test:run` | Ejecutar tests unitarios una vez |
| `npm run test:e2e` | Ejecutar tests E2E con Playwright |
| `npm run test:e2e:report` | Ver reporte HTML de tests E2E |
| `npm run lint` | Ejecutar linter ESLint |
| `npm run build` | Verificar que el build funciona |

---

## 6. DISEÑO DE CASOS DE PRUEBA

### 6.1 Formato Estándar de Caso de Prueba

| Campo | Descripción |
|-------|-------------|
| **ID** | Identificador único del caso |
| **Nombre** | Descripción breve de la prueba |
| **Precondiciones** | Estado necesario antes de ejecutar |
| **Pasos** | Acciones específicas a realizar |
| **Datos de prueba** | Valores de entrada |
| **Resultado esperado** | Comportamiento esperado |
| **Resultado real** | Lo que realmente sucedió (se llena al ejecutar) |
| **Estado** | Pass / Fail / Blocked |

### 6.2 Matriz de Trazabilidad

```
Requisito → Caso de Prueba → Script → Resultado
   RF-01    →  TC-AUTH-03    → auth.spec.js → PASS
   RF-02    →  TC-AUTH-02    → auth.spec.js → PASS
   RF-03    →  TC-AUTH-07    → auth.spec.js → PASS
   RF-04    →  TC-APR-04     → aprendiz.spec.js → PASS
```

---

## 7. CRITERIOS DE ACEPTACIÓN

### 7.1 Criterios de Salida (Exit Criteria)

| Criterio | Meta |
|----------|------|
| Todos los tests unitarios pasan | 100% |
| Tests E2E pasan | 100% |
| Cobertura de código | ≥ 70% |
| Errores críticos en producción | 0 |
| Tiempo de respuesta | < 3 segundos |

### 7.2 Criterios de Bloqueo (Block Criteria)

| Criterio | Acción |
|----------|--------|
| Tests unitarios fallan | No se puede hacer deploy |
| Tests E2E fallan | No se puede hacer deploy |
| Build falla | No se puede hacer deploy |
| Errores de seguridad | Bloqueo inmediato |

---

## 8. RIESGOS Y MITIGACIÓN

| Riesgo | Mitigación |
|--------|------------|
| Tests falsos positivos | Revisar assertions, usar data-testid |
| Flakiness en E2E | Usar waitFor, retries, timeouts adecuados |
| Mocks incompletos | Documentar contratos de interfaces |
| Cobertura baja | Monitorear覆盖率 con reports |
| Tiempo de ejecución | Paralelizar tests unitarios |

---

**Documento generado**: 07 de Julio de 2026
**Proyecto**: Gestión de Citas - Bienestar SENA
**Versión**: 1.0
