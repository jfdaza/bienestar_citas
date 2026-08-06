# Plan de Migración de Datos

## Sistema de Gestión de Citas - SENA Bienestar

---

## 1. Información General

| Campo | Valor |
|-------|-------|
| **Proyecto** | Sistema de Gestión de Citas - SENA Bienestar |
| **Base de Datos** | Supabase (PostgreSQL) |
| **Entorno** | Producción |
| **Responsable** | Equipo de Desarrollo SENA |
| **Fecha de Migración** | Por definir |
| **Versión** | 1.0 |

---

## 2. Objetivo

Establecer el procedimiento estructurado para la migración de datos del sistema de gestión de citas, garantizando la integridad, consistencia y disponibilidad de la información durante el proceso de transferencia entre entornos.

---

## 3. Alcance de la Migración

### 3.1 Tablas a Migrar

| Tabla | Registros Esperados | Prioridad |
|-------|---------------------|-----------|
| **profiles** | Variable | Alta |
| **appointments** | Variable | Alta |
| **roles** | 6 registros fijos | Alta |
| **dependencies** | Variable | Alta |
| **audit_logs** | Variable | Media |
| **system_config** | Variable | Media |
| **security_logs** | Variable | Baja |

### 3.2 Datos Estátlicos Críticos

**Tabla roles** (datos fijos que deben preservarse):

| ID | Nombre | Descripción |
|----|--------|-------------|
| 1 | SUPERADMIN | Administrador del sistema |
| 2 | COORDINACION | Coordinador de bienestar |
| 3 | APRENDIZ | Aprendiz SENA |
| 4 | PSICOLOGIA | Profesional de psicología |
| 5 | ENFERMERIA | Profesional de enfermería |
| 6 | TRABAJO_SOCIAL | Profesional de trabajo social |

---

## 4. Estrategia de Migración

### 4.1 Fases del Proceso

| Fase | Descripción | Duración Estimada |
|------|-------------|-------------------|
| **Fase 1** | Preparación y validación | 2 horas |
| **Fase 2** | Exportación de datos | 1 hora |
| **Fase 3** | Transformación y validación | 2 horas |
| **Fase 4** | Importación en destino | 1 hora |
| **Fase 5** | Verificación post-migración | 2 horas |
| **Fase 6** | Documentación y cierre | 1 hora |

**Tiempo total estimado:** 9 horas

### 4.2 Orden de Migración

El orden es crítico debido a las dependencias foráneas (Foreign Keys):

```
1. roles (sin dependencias)
2. dependencies (sin dependencias)
3. profiles (depende de roles y dependencies)
4. appointments (depende de profiles y dependencies)
5. system_config (depende de profiles)
6. audit_logs (depende de profiles)
7. security_logs (independiente)
```

---

## 5. Procedimiento Detallado

### 5.1 Fase 1: Preparación

**Acciones:**

1. Verificar acceso a Supabase Dashboard
2. Confirmar credenciales de servicio (service_role)
3. Crear backup completo del entorno destino
4. Notificar a stakeholders del mantenimiento
5. Validar espacio en disco disponible

**Comandos de verificación:**

```bash
# Verificar conexión a Supabase
npx supabase status

# Verificar espacio en disco
df -h
```

### 5.2 Fase 2: Exportación

**Método recomendado:** Supabase CLI + SQL Directo

**Pasos:**

1. Exportar estructura de tablas (schema)
2. Exportar datos por tabla en orden de dependencia
3. Generar checksums de integridad

**Comandos de exportación:**

```bash
# Exportar schema completo
npx supabase db dump --schema-only > schema_backup.sql

# Exportar datos
npx supabase db dump > data_backup.sql

# Exportar tablas individuales (por orden)
psql $DATABASE_URL -c "COPY roles TO STDOUT WITH CSV HEADER" > roles.csv
psql $DATABASE_URL -c "COPY dependencies TO STDOUT WITH CSV HEADER" > dependencies.csv
psql $DATABASE_URL -c "COPY profiles TO STDOUT WITH CSV HEADER" > profiles.csv
psql $DATABASE_URL -c "COPY appointments TO STDOUT WITH CSV HEADER" > appointments.csv
```

### 5.3 Fase 3: Transformación

**Validaciones a realizar:**

| Validación | Método | Acción si falla |
|------------|--------|-----------------|
| Integridad referencial | JOIN entre tablas | Corregir IDs huérfanos |
| Formato de fechas | Regex + parsing | Convertir a formato ISO 8601 |
| Campos obligatorios | NOT NULL check | Registrar y revisar |
| Duplicados | COUNT + DISTINCT | Eliminar duplicados |
| Encoding de caracteres | UTF-8 validation | Recodificar |

**Script de validación:**

```sql
-- Verificar integridad referencial
SELECT p.id, p.full_name
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
WHERE r.id IS NULL;

-- Verificar dependencias huérfanas
SELECT p.id, p.full_name
FROM profiles p
LEFT JOIN dependencies d ON p.dependency_id = d.id
WHERE d.id IS NULL;

-- Contar registros por tabla
SELECT 'roles' as tabla, COUNT(*) as total FROM roles
UNION ALL
SELECT 'dependencies', COUNT(*) FROM dependencies
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments;
```

### 5.4 Fase 4: Importación

**Orden de importación (respetar FK):**

```sql
-- 1. Roles
COPY roles FROM 'roles.csv' WITH CSV HEADER;

-- 2. Dependencies
COPY dependencies FROM 'dependencies.csv' WITH CSV HEADER;

-- 3. Profiles (verificar role_id y dependency_id)
COPY profiles FROM 'profiles.csv' WITH CSV HEADER;

-- 4. Appointments (verificar user_id y professional_id)
COPY appointments FROM 'appointments.csv' WITH CSV HEADER;

-- 5. System Config
COPY system_config FROM 'system_config.csv' WITH CSV HEADER;

-- 6. Audit Logs
COPY audit_logs FROM 'audit_logs.csv' WITH CSV HEADER;

-- 7. Security Logs
COPY security_logs FROM 'security_logs.csv' WITH CSV HEADER;
```

### 5.5 Fase 5: Verificación Post-Migración

**Checklist de verificación:**

- [ ] Conteo de registros coincide entre origen y destino
- [ ] Todas las Foreign Keys son válidas
- [ ] No existen registros huérfanos
- [ ] Funciones RPC operan correctamente
- [ ] RLS policies están activas
- [ ] Edge Functions responden correctamente
- [ ] Autenticación funciona (login/logout)
- [ ] Flujo completo de citas opera correctamente

**Queries de verificación:**

```sql
-- Verificar conteos
SELECT
  (SELECT COUNT(*) FROM roles) as roles_count,
  (SELECT COUNT(*) FROM dependencies) as dependencies_count,
  (SELECT COUNT(*) FROM profiles) as profiles_count,
  (SELECT COUNT(*) FROM appointments) as appointments_count;

-- Verificar FKs rotas
SELECT COUNT(*) as broken_fks
FROM profiles p
WHERE p.role_id NOT IN (SELECT id FROM roles)
   OR p.dependency_id NOT IN (SELECT id FROM dependencies);

-- Verificar funcionamiento de RPC
SELECT * FROM get_dashboard_kpis(
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE
);
```

---

## 6. Plan de Retorno (Rollback)

### 6.1 Criterios de Activación

- Pérdida de datos superior al 1%
- Foreign keys rotas irreparables
- Time out superior a 2 horas
- Fallo en más del 20% de las validaciones

### 6.2 Procedimiento de Rollback

1. Detener inmediatamente la importación
2. Restaurar backup del entorno destino
3. Verificar integridad del backup restaurado
4. Documentar causa raíz del fallo
5. Replanificar migración con correcciones

---

## 7. Responsables

| Rol | Nombre | Contacto |
|-----|--------|----------|
| Líder de Migración | Por definir | Por definir |
| DBA Supervisor | Por definir | Por definir |
| QA Validator | Por definir | Por definir |
| Stakeholder Principal | Por definir | Por definir |

---

## 8. Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Pérdida de datos | Baja | Crítico | Múltiples backups + verificación |
| Timeout de migración | Media | Alto | Migración por lotes |
| Incompatibilidad de schema | Baja | Alto | Validación previa completa |
| Caída del servicio | Baja | Medio | Ventana de mantenimiento programada |
| Corrupción de datos | Baja | Crítico | Checksums + auditoría |

---

## 9. Cronograma

| Actividad | Día 1 | Día 2 | Día 3 |
|-----------|-------|-------|-------|
| Preparación | X | | |
| Exportación | X | | |
| Transformación | | X | |
| Importación | | X | |
| Verificación | | | X |
| Documentación | | | X |

---

## 10. Aprobaciones

| Rol | Firma | Fecha |
|-----|-------|-------|
| Líder de Proyecto | _____________ | ____/____/____ |
| DBA | _____________ | ____/____/____ |
| QA Lead | _____________ | ____/____/____ |
