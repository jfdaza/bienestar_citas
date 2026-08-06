# Plan de Respaldo de Datos

## Sistema de Gestión de Citas - SENA Bienestar

---

## 1. Información General

| Campo | Valor |
|-------|-------|
| **Proyecto** | Sistema de Gestión de Citas - SENA Bienestar |
| **Base de Datos** | Supabase (PostgreSQL) |
| **Entorno** | Producción |
| **Responsable** | Equipo de Desarrollo SENA |
| **Frecuencia de Respaldo** | Diaria |
| **Retención de Respaldos** | 30 días |

---

## 2. Objetivo

Establecer las políticas, procedimientos y herramientas para la protección continua de la información del sistema de gestión de citas, garantizando la posibilidad de recuperación ante fallos, errores humanos o desastres.

---

## 3. Alcance de Respaldo

### 3.1 Componentes a Respalдар

| Componente | Tipo | Prioridad | Frecuencia |
|------------|------|-----------|------------|
| **Base de datos Supabase** | Datos | Crítica | Diaria |
| **Edge Functions** | Código | Alta | Por deploy |
| **Migraciones SQL** | Schema | Alta | Por cambio |
| **Variables de entorno** | Configuración | Crítica | Por cambio |
| **Código fuente** | Código | Alta | Continua (Git) |
| **Documentación** | Archivos | Media | Por cambio |

### 3.2 Tablas de Base de Datos

| Tabla | Registros | Tamaño Estimado | Crítica |
|-------|-----------|-----------------|---------|
| profiles | Variable | ~1 KB por registro | Alta |
| appointments | Variable | ~2 KB por registro | Alta |
| roles | 6 | ~1 KB total | Crítica |
| dependencies | Variable | ~1 KB total | Crítica |
| audit_logs | Variable | ~3 KB por registro | Media |
| system_config | Variable | ~1 KB total | Media |
| security_logs | Variable | ~2 KB por registro | Baja |

---

## 4. Estrategia de Respaldo

### 4.1 Modelo 3-2-1

Se aplica el modelo de protección de datos **3-2-1**:

- **3** copias de los datos
- **2** medios de almacenamiento diferentes
- **1** copia fuera del sitio (offsite)

### 4.2 Tipos de Respaldo

| Tipo | Descripción | Frecuencia | Retención |
|------|-------------|------------|-----------|
| **Completo** | Dump total de la BD | Semanal | 30 días |
| **Incremental** | Cambios desde último completo | Diario | 14 días |
| **Diferencial** | Cambios desde último incremental | Cada 6 horas | 7 días |
| **Transaccional** | WAL (Write-Ahead Log) | Continuo | 3 días |

### 4.3 Almacenamiento

| Ubicación | Tipo | Propósito |
|-----------|------|-----------|
| Supabase Dashboard | Automático | Backup nativo de Supabase |
| Google Drive / OneDrive | Cloud | Backup externo |
| Disco local | Físico | Backup rápido local |
| Repositorio Git | Versionado | Código y configuración |

---

## 5. Procedimiento de Respaldo

### 5.1 Respaldo Automático (Supabase)

Supabase realiza respaldos automáticos según el plan contratado:

- **Plan Free**: Respaldos diarios (7 días de retención)
- **Plan Pro**: Respaldos diarios (30 días de retención)
- **Enterprise**: Respaldos point-in-time recovery

**Verificación manual de respaldos:**

1. Ir a Supabase Dashboard > Settings > Backups
2. Verificar fecha del último backup exitoso
3. Confirmar tamaño esperado
4. Registrar en bitácora de respaldos

### 5.2 Respaldo Manual via Supabase CLI

```bash
# Autenticar con Supabase
npx supabase login

# Vincular proyecto
npx supabase link --project-ref rtoyvifyinoeywfnmvyy

# Respaldo completo de la base de datos
npx supabase db dump > backup_$(date +%Y%m%d_%H%M%S).sql

# Respaldo solo de schema (sin datos)
npx supabase db dump --schema-only > schema_$(date +%Y%m%d_%H%M%S).sql

# Respaldo de funciones edge
npx supabase functions download > functions_backup.zip
```

### 5.3 Respaldo via SQL Directo

```bash
# Variables de entorno
export DB_URL="postgresql://postgres:[PASSWORD]@db.rtoyvifyinoeywfnmvyy.supabase.co:5432/postgres"

# Respaldo completo con pg_dump
pg_dump $DB_URL > full_backup_$(date +%Y%m%d).sql

# Respaldo de tablas individuales
pg_dump $DB_URL -t roles > backup_roles.sql
pg_dump $DB_URL -t dependencies > backup_dependencies.sql
pg_dump $DB_URL -t profiles > backup_profiles.sql
pg_dump $DB_URL -t appointments > backup_appointments.sql
pg_dump $DB_URL -t audit_logs > backup_audit_logs.sql
pg_dump $DB_URL -t system_config > backup_system_config.sql
pg_dump $DB_URL -t security_logs > backup_security_logs.sql
```

### 5.4 Respaldo de Edge Functions

```bash
# Descargar todas las funciones
mkdir -p backup_functions
cd backup_functions

# Función admin-users
mkdir -p admin-users
npx supabase functions download admin-users

# Función admin-config
mkdir -p admin-config
npx supabase functions download admin-config

# Comprimir
tar -czf ../edge_functions_$(date +%Y%m%d).tar.gz .
```

### 5.5 Respaldo de Configuración

```bash
# Copiar archivos de configuración críticos
cp .env .env.backup.$(date +%Y%m%d)
cp .env.example .env.example.backup.$(date +%Y%m%d)

# Respaldo de package.json
cp package.json package.json.backup.$(date +%Y%m%d)

# Respaldo de configuración de Supabase
cp -r supabase/ supabase_backup_$(date +%Y%m%d)/
```

---

## 6. Programación de Respaldos

### 6.1 Cronograma Semanal

| Día | Hora | Tipo | Descripción |
|-----|------|------|-------------|
| Lunes | 02:00 | Completo | Respaldo semanal completo |
| Martes | 02:00 | Incremental | Cambios del día |
| Miércoles | 02:00 | Incremental | Cambios del día |
| Jueves | 02:00 | Incremental | Cambios del día |
| Viernes | 02:00 | Incremental | Cambios del día |
| Sábado | 02:00 | Incremental | Cambios del día |
| Domingo | 02:00 | Incremental | Cambios del día |

### 6.2 Respaldos Adicionales

Se realizarán respaldos adicionales antes de:

- Migraciones de base de datos
- Actualizaciones de código en producción
- Cambios en configuración de Supabase
- Cambios en Edge Functions
- Cambios en RLS policies

---

## 7. Verificación de Integridad

### 7.1 Checksums

```bash
# Generar checksum del backup
sha256sum backup_20240101.sql > backup_20240101.sql.sha256

# Verificar checksum
sha256sum -c backup_20240101.sql.sha256
```

### 7.2 Validación de Contenido

```sql
-- Verificar conteos post-restauración
SELECT
  'roles' as tabla, COUNT(*) as registros FROM roles
UNION ALL
SELECT 'dependencies', COUNT(*) FROM dependencies
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs
UNION ALL
SELECT 'system_config', COUNT(*) FROM system_config
UNION ALL
SELECT 'security_logs', COUNT(*) FROM security_logs;

-- Verificar integridad referencial
SELECT COUNT(*) as foreign_keys_validas
FROM appointments a
JOIN profiles p ON a.user_id = p.id
JOIN profiles pr ON a.professional_id = pr.id
JOIN dependencies d ON a.dependency_id = d.id;
```

### 7.3 Prueba de Restauración

Se realizará una prueba de restauración completa **mensualmente**:

1. Crear entorno de prueba aislado
2. Restaurar último backup completo
3. Aplicar incrementales pendientes
4. Ejecutar suite de validación
5. Documentar resultados
6. Destruir entorno de prueba

---

## 8. Recuperación ante Desastres

### 8.1 Tiempos Objetivo

| Métrica | Objetivo |
|---------|----------|
| **RTO** (Recovery Time Objective) | < 4 horas |
| **RPO** (Recovery Point Objective) | < 24 horas |
| **MTO** (Maximum Tolerable Outage) | < 8 horas |

### 8.2 Procedimiento de Recuperación

**Escenario 1: Corrupción de datos menor**
1. Identificar registros afectados
2. Restaurar desde backup incremental
3. Aplicar transacciones perdidas manualmente
4. Verificar integridad

**Escenario 2: Corrupción de datos mayor**
1. Activar ventana de mantenimiento
2. Restaurar último backup completo
3. Aplicar incrementales
4. Verificar toda la información
5. Notificar a usuarios

**Escenario 3: Pérdida total de la base de datos**
1. Crear nueva instancia Supabase
2. Restaurar schema desde backup
3. Restaurar datos desde backup completo
4. Aplicar todos los incrementales
5. Reconfigurar Edge Functions
6. Actualizar variables de entorno
7. Ejecutar suite completa de pruebas
8. Notificar a todos los usuarios

---

## 9. Monitoreo y Alertas

### 9.1 Métricas a Monitorear

| Métrica | Umbral de Alerta | Acción |
|---------|-------------------|--------|
| Tamaño de BD | > 1 GB | Revisar y limpiar |
| Tasa de crecimiento | > 100 MB/día | Investigar causa |
| Backup fallido | Cualquier fallo | Reintentar y notificar |
| Tiempo de backup | > 30 minutos | Optimizar proceso |
| Espacio en disco | < 20% libre | Ampliar almacenamiento |

### 9.2 Notificaciones

| Evento | Canal | Destinatario |
|--------|-------|--------------|
| Backup exitoso | Email | DBA |
| Backup fallido | Email + SMS | DBA + Líder |
| Alerta de espacio | Email | DBA + Líder |
| Recuperación exitosa | Email | Todos los stakeholders |
| Recuperación fallida | Email + SMS | Equipo completo |

---

## 10. Bitácora de Respaldos

### 10.1 Formato de Registro

| Fecha | Tipo | Tamaño | Checksum | Estado | Responsable |
|-------|------|--------|----------|--------|-------------|
| ____/____/____ | Completo/Incremental | ____ MB | ____________ | Exitoso/Fallido | ____________ |

### 10.2 Plantilla de Registro

```
Fecha: [FECHA]
Hora Inicio: [HORA]
Hora Fin: [HORA]
Tipo: [COMPLETO/INCREMENTAL/DIFERENCIAL]
Tamaño: [TAMANIO]
Checksum: [SHA256]
Estado: [EXITOSO/FALLIDO]
Observaciones: [OBSERVACIONES]
Responsable: [NOMBRE]
```

---

## 11. Responsables

| Rol | Nombre | Responsabilidad |
|-----|--------|-----------------|
| DBA Principal | Por definir | Ejecución y monitoreo de respaldos |
| DBA Backup | Por definir | Suplencia del DBA Principal |
| Líder de Proyecto | Por definir | Aprobación de procedimientos |
| Auditor | Por definir | Verificación periódica |

---

## 12. Cumplimiento y Auditoría

### 12.1 Revisión Mensual

- [ ] Verificar que todos los respaldos diarios se completaron
- [ ] Validar integridad de al menos un backup aleatorio
- [ ] Revisar métricas de crecimiento
- [ ] Actualizar documentación si hay cambios
- [ ] Realizar prueba de restauración

### 12.2 Revisión Trimestral

- [ ] Auditar retención de respaldos
- [ ] Probar recuperación completa en entorno de prueba
- [ ] Revisar y actualizar procedimientos
- [ ] Capacitar al equipo en procedimientos de recuperación
- [ ] Evaluar necesidad de cambios en la estrategia

---

## 13. Aprobaciones

| Rol | Firma | Fecha |
|-----|-------|-------|
| Líder de Proyecto | _____________ | ____/____/____ |
| DBA Principal | _____________ | ____/____/____ |
| Auditor de TI | _____________ | ____/____/____ |
