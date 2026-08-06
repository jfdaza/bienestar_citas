-- ============================================
-- ASIGNAR SUPERADMIN AL USUARIO
-- ing.jfdq@gmail.com
-- ============================================

-- 1. Buscar el usuario por email
SELECT id, email FROM auth.users WHERE email = 'ing.jfdq@gmail.com';

-- 2. Asignar rol SUPERADMIN (ejecutar después de copiar el ID del paso 1)
UPDATE profiles 
SET role_id = (SELECT id FROM roles WHERE name = 'SUPERADMIN')
WHERE id = (SELECT id FROM auth.users WHERE email = 'ing.jfdq@gmail.com');

-- 3. Verificar que se aplicó
SELECT 
    u.email,
    p.full_name,
    p.document_number,
    r.name as role_name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN roles r ON p.role_id = r.id
WHERE u.email = 'ing.jfdq@gmail.com';