-- =====================================================
-- MIGRACIÓN: Funciones RPC para Dashboard
-- Fecha: 16 de julio de 2026
-- Descripción: Funciones que el frontend espera pero no existían
-- =====================================================

-- Permitir a usuarios autenticados insertar logs de seguridad
-- (la política anterior solo permitía service_role)
CREATE POLICY "authenticated_insert_security_logs" ON security_logs
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Función para obtener KPIs del dashboard
CREATE OR REPLACE FUNCTION get_dashboard_kpis(start_date DATE, end_date DATE)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_count INT;
    pending_count INT;
    confirmed_count INT;
    completed_count INT;
    cancelled_count INT;
    no_show_count INT;
BEGIN
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'pending'),
        COUNT(*) FILTER (WHERE status = 'confirmed'),
        COUNT(*) FILTER (WHERE status = 'completed'),
        COUNT(*) FILTER (WHERE status = 'cancelled'),
        COUNT(*) FILTER (WHERE status = 'no_show')
    INTO total_count, pending_count, confirmed_count, completed_count, cancelled_count, no_show_count
    FROM appointments
    WHERE scheduled_date BETWEEN start_date AND end_date;

    result := json_build_object(
        'total_appointments', total_count,
        'pending_appointments', pending_count,
        'confirmed_appointments', confirmed_count,
        'completed_appointments', completed_count,
        'cancelled_appointments', cancelled_count,
        'no_show_count', no_show_count
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener tendencia mensual de citas
CREATE OR REPLACE FUNCTION get_monthly_appointments(year_param INT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'month', month_num,
            'total', total_count,
            'completed', completed_count,
            'cancelled', cancelled_count
        )
        ORDER BY month_num
    ) INTO result
    FROM (
        SELECT
            EXTRACT(MONTH FROM scheduled_date)::INT AS month_num,
            COUNT(*) AS total_count,
            COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
            COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_count
        FROM appointments
        WHERE EXTRACT(YEAR FROM scheduled_date) = year_param
        GROUP BY EXTRACT(MONTH FROM scheduled_date)
    ) monthly_data;

    RETURN COALESCE(result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear perfil de usuario (usada en registro)
CREATE OR REPLACE FUNCTION create_profile_for_user(
    user_id UUID,
    user_full_name TEXT,
    user_email TEXT,
    user_document_number TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    default_role_id INT;
    new_profile JSON;
BEGIN
    -- Obtener rol APRENDIZ por defecto
    SELECT id INTO default_role_id FROM roles WHERE name = 'APRENDIZ' LIMIT 1;
    
    -- Si no existe el rol, usar ID 6 como fallback
    IF default_role_id IS NULL THEN
        default_role_id := 6;
    END IF;

    -- Crear o actualizar perfil
    INSERT INTO profiles (id, full_name, email, document_number, role_id, is_active)
    VALUES (user_id, user_full_name, user_email, user_document_number, default_role_id, true)
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        document_number = EXCLUDED.document_number;

    -- Retornar el perfil creado
    SELECT json_build_object(
        'id', p.id,
        'full_name', p.full_name,
        'email', p.email,
        'role_id', p.role_id
    ) INTO new_profile
    FROM profiles p
    WHERE p.id = user_id;

    RETURN new_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
