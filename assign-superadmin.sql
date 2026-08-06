-- ============================================
-- ASIGNAR ROL DE SUPERADMIN A UN USUARIO
-- ============================================

-- 1. Primero, ver los roles disponibles
SELECT id, name FROM roles ORDER BY id;

-- 2. Ver el usuario registrado (copia su ID de auth.users)
SELECT id, email FROM auth.users;

-- 3. Asignar rol SUPERADMIN al usuario
-- Reemplaza 'AQUI_ID_USUARIO' con el ID real del usuario
-- Reemplaza 'AQUI_ID_ROL' con el ID del rol SUPERADMIN

-- Opción A: Si ya sabes el ID del rol SUPERADMIN (típicamente 1)
UPDATE profiles 
SET role_id = 1  -- ID del rol SUPERADMIN
WHERE id = 'AQUI_ID_USUARIO';

-- Opción B: Si no sabes el ID, usa esta consulta dinámica
UPDATE profiles 
SET role_id = (SELECT id FROM roles WHERE name = 'SUPERADMIN')
WHERE id = 'AQUI_ID_USUARIO';

-- 4. Verificar que se aplicó correctamente
SELECT 
    p.id,
    p.full_name,
    p.document_number,
    r.name as role_name
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id;

-- ============================================
-- Si el usuario no tiene perfil, créalo primero:
-- ============================================
-- INSERT INTO profiles (id, full_name, document_number, role_id)
-- VALUES (
--     'ID_DEL_USUARIO_AUTH',
--     'Nombre Completo',
--     'Número de Documento',
--     (SELECT id FROM roles WHERE name = 'SUPERADMIN')
-- );