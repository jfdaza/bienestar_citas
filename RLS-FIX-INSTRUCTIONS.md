# Corrección del Error de Recursión RLS en Supabase

## Error Identificado
```
infinite recursion detected in policy for relation "profiles"
```

## Solución

### Paso 1: Ejecutar SQL en Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Copia y pega el siguiente SQL:

```sql
-- Eliminar políticas problemáticas
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Crear políticas simples SIN recursión
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

5. Haz clic en **Run** para ejecutar

### Paso 2: Verificar la corrección

1. Recarga tu aplicación
2. Inicia sesión
3. El error debería desaparecer

## Si el error persiste

Ejecuta esta consulta adicional para ver las políticas actuales:

```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

Esto te mostrará todas las políticas activas. Si ves alguna con subqueries que hagan referencia a `profiles`, eliminala.

## Archivos modificados en el código

- `src/providers/AuthProvider.jsx` - Mejorado manejo de errores con fallback
- `fix-rls-policies.sql` - SQL para corregir las políticas
- `RLS-FIX-INSTRUCTIONS.md` - Este archivo de instrucciones