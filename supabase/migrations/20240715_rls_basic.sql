-- =====================================================
-- MIGRACIÓN: Habilitar RLS básico en todas las tablas
-- Fecha: 15 de julio de 2026
-- Descripción: Implementa RLS con políticas que permiten
-- el acceso actual pero adding protección básica
-- =====================================================

-- =====================================================
-- 1. TABLA PROFILES
-- =====================================================

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios autenticados pueden leer todos los perfiles
-- (Necesario para mostrar nombres en citas, etc.)
CREATE POLICY "authenticated_read_profiles" ON profiles
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Política: Usuarios pueden actualizar su propio perfil
CREATE POLICY "users_update_own_profile" ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Política: Service role puede hacer todo (para Edge Functions)
CREATE POLICY "service_role_all_profiles" ON profiles
    FOR ALL
    USING (auth.role() = 'service_role');

-- =====================================================
-- 2. TABLA APPOINTMENTS
-- =====================================================

-- Habilitar RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios autenticados pueden leer todas las citas
-- (Necesario para coordinación y profesionales)
CREATE POLICY "authenticated_read_appointments" ON appointments
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Política: Usuarios pueden crear citas
CREATE POLICY "authenticated_insert_appointments" ON appointments
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Política: Usuarios pueden actualizar citas
CREATE POLICY "authenticated_update_appointments" ON appointments
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Política: Service role puede hacer todo
CREATE POLICY "service_role_all_appointments" ON appointments
    FOR ALL
    USING (auth.role() = 'service_role');

-- =====================================================
-- 3. TABLA ROLES
-- =====================================================

-- Habilitar RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer roles (necesario para UI)
CREATE POLICY "authenticated_read_roles" ON roles
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Política: Service role puede hacer todo
CREATE POLICY "service_role_all_roles" ON roles
    FOR ALL
    USING (auth.role() = 'service_role');

-- =====================================================
-- 4. TABLA DEPENDENCIES
-- =====================================================

-- Habilitar RLS
ALTER TABLE dependencies ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer dependencias (necesario para UI)
CREATE POLICY "authenticated_read_dependencies" ON dependencies
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Política: Service role puede hacer todo
CREATE POLICY "service_role_all_dependencies" ON dependencies
    FOR ALL
    USING (auth.role() = 'service_role');

-- =====================================================
-- 5. TABLA AUDIT_LOGS
-- =====================================================

-- Habilitar RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Política: Solo admins pueden leer logs de auditoría
CREATE POLICY "admins_read_audit_logs" ON audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role_id IN (
                SELECT id FROM roles WHERE name IN ('SUPERADMIN', 'COORDINACION')
            )
        )
    );

-- Política: Service role puede insertar logs
CREATE POLICY "service_role_insert_audit_logs" ON audit_logs
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- Política: Service role puede leer logs
CREATE POLICY "service_role_read_audit_logs" ON audit_logs
    FOR SELECT
    USING (auth.role() = 'service_role');

-- =====================================================
-- 6. TABLA SYSTEM_CONFIG
-- =====================================================

-- Habilitar RLS
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios autenticados pueden leer configuración
CREATE POLICY "authenticated_read_system_config" ON system_config
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Política: Service role puede hacer todo
CREATE POLICY "service_role_all_system_config" ON system_config
    FOR ALL
    USING (auth.role() = 'service_role');

-- =====================================================
-- 7. TABLA SECURITY_LOGS (nueva - para logging de seguridad)
-- =====================================================

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action TEXT NOT NULL,
    email TEXT,
    ip_address TEXT,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Política: Solo service role puede acceder
CREATE POLICY "service_role_all_security_logs" ON security_logs
    FOR ALL
    USING (auth.role() = 'service_role');

-- =====================================================
-- 8. ÍNDICES PARA MEJORAR RENDIMIENTO
-- =====================================================

-- Índice para profiles por email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Índice para profiles por document_number
CREATE INDEX IF NOT EXISTS idx_profiles_document ON profiles(document_number);

-- Índice para appointments por user_id
CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments(user_id);

-- Índice para appointments por status
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Índice para appointments por scheduled_date
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(scheduled_date);

-- Índice para audit_logs por created_at
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- Índice para security_logs por created_at
CREATE INDEX IF NOT EXISTS idx_security_logs_created ON security_logs(created_at DESC);

-- =====================================================
-- 9. FUNCIONES RPC PARA OPERACIONES SEGURO
-- =====================================================

-- Función para obtener perfil con rol (bypasea RLS con SECURITY DEFINER)
CREATE OR REPLACE FUNCTION get_profile_with_role(user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'id', p.id,
        'full_name', p.full_name,
        'email', p.email,
        'document_number', p.document_number,
        'role_id', p.role_id,
        'role_name', r.name,
        'is_active', p.is_active
    ) INTO result
    FROM profiles p
    LEFT JOIN roles r ON p.role_id = r.id
    WHERE p.id = user_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un usuario es admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM profiles p
        JOIN roles r ON p.role_id = r.id
        WHERE p.id = user_id
        AND r.name IN ('SUPERADMIN', 'COORDINACION')
    ) INTO is_admin;
    
    RETURN is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. COMENTARIOS EN TABLAS
-- =====================================================

COMMENT ON TABLE profiles IS 'Perfiles de usuario del sistema';
COMMENT ON TABLE appointments IS 'Citas agendadas en el sistema';
COMMENT ON TABLE roles IS 'Roles del sistema (SUPERADMIN, COORDINACION, etc.)';
COMMENT ON TABLE dependencies IS 'Dependencias del SENA (Psicología, Enfermería, etc.)';
COMMENT ON TABLE audit_logs IS 'Registro de acciones administrativas';
COMMENT ON TABLE system_config IS 'Configuración del sistema';
COMMENT ON TABLE security_logs IS 'Logs de seguridad y intentos de acceso';
