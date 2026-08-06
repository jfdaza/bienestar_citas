# Plan de Instalación

## Sistema de Gestión de Citas - SENA Bienestar

---

## 1. Información General

| Campo | Valor |
|-------|-------|
| **Proyecto** | Sistema de Gestión de Citas - SENA Bienestar |
| **Tipo** | Aplicación Web PWA |
| **Stack Tecnológico** | React + Vite + Supabase |
| **Versión** | 1.0 |
| **Fecha de Instalación** | Por definir |
| **Responsable** | Equipo de Desarrollo SENA |

---

## 2. Objetivo

Establecer los procedimientos detallados para la instalación, configuración y puesta en marcha del Sistema de Gestión de Citas en los diferentes entornos (desarrollo, pruebas y producción).

---

## 3. Prerrequisitos

### 3.1 Requisitos del Servidor (Producción)

| Componente | Mínimo | Recomendado |
|------------|--------|-------------|
| **Sistema Operativo** | Linux Ubuntu 20.04+ | Linux Ubuntu 22.04 LTS |
| **CPU** | 2 núcleos | 4+ núcleos |
| **RAM** | 4 GB | 8+ GB |
| **Disco** | 20 GB SSD | 50+ GB SSD |
| **Conexión** | 10 Mbps | 100+ Mbps |
| **SSL** | Obligatorio | Let's Encrypt |

### 3.2 Requisitos del Cliente (Desarrollo)

| Componente | Versión Mínima | Versión Recomendada |
|------------|----------------|---------------------|
| **Node.js** | 18.0+ | 20.x LTS |
| **npm** | 9.0+ | 10.x |
| **Git** | 2.30+ | 2.40+ |
| **Editor** | VS Code | VS Code + extensiones |
| **Navegador** | Chrome 90+ | Chrome最新版 |

### 3.3 Cuentas Requeridas

| Servicio | Propósito | URL |
|----------|-----------|-----|
| **Supabase** | Base de datos + Auth + API | https://supabase.com |
| **GitHub** | Repositorio de código | https://github.com |
| **Vercel/Netlify** | Despliegue frontend (opcional) | https://vercel.com |
| **Node.js** | Runtime | https://nodejs.org |

---

## 4. Arquitectura del Sistema

### 4.1 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENTE (Navegador)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   React UI  │  │  React Router│  │   Service Worker    │ │
│  │  (Vite)     │  │             │  │     (PWA)           │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (Backend)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  PostgreSQL  │  │  Auth API   │  │   Edge Functions    │ │
│  │    (BD)      │  │  (GoTrue)   │  │   (Deno)           │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │    RLS      │  │  Realtime   │  │   Storage           │ │
│  │  (Seguridad)│  │  (Sockets)  │  │   (Archivos)        │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| **Frontend** | React | 19.x |
| **Build Tool** | Vite | 8.x |
| **Routing** | React Router | 7.x |
| **Formularios** | React Hook Form + Zod | 7.x / 4.x |
| **Gráficas** | Recharts | 3.x |
| **Backend** | Supabase | 2.x |
| **Base de Datos** | PostgreSQL | 15+ |
| **Auth** | Supabase Auth (GoTrue) | - |
| **Edge Functions** | Deno | - |
| **PWA** | Service Worker | - |

---

## 5. Instalación en Entorno de Desarrollo

### 5.1 Clonar el Repositorio

```bash
# Clonar desde GitHub
git clone https://github.com/[ORGANIZACION]/gestion-citas.git

# Navegar al directorio
cd gestion-citas

# Verificar estructura
ls -la
```

### 5.2 Instalar Dependencias

```bash
# Instalar dependencias de Node.js
npm install

# Verificar instalación
npm list --depth=0
```

### 5.3 Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar archivo .env con credenciales reales
```

**Contenido mínimo del archivo `.env`:**

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://[TU-PROYECTO].supabase.co
VITE_SUPABASE_ANON_KEY=[TU-ANON-KEY]
VITE_SUPABASE_SERVICE_ROLE_KEY=[TU-SERVICE-ROLE-KEY]
```

### 5.4 Verificar Configuración

```bash
# Iniciar servidor de desarrollo
npm run dev

# Abrir navegador en http://localhost:5173
# Verificar que la app carga correctamente
# Verificar conexión a Supabase en consola del navegador
```

### 5.5 Comandos de Desarrollo

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar servidor de desarrollo |
| `npm run build` | Construir para producción |
| `npm run preview` | Vista previa de producción |
| `npm run lint` | Verificar código con ESLint |
| `npm run test` | Ejecutar pruebas unitarias |
| `npm run test:run` | Ejecutar pruebas (una vez) |
| `npm run test:e2e` | Ejecutar pruebas E2E |

---

## 6. Instalación en Entorno de Producción

### 6.1 Opción A: Vercel (Recomendado)

**Pasos:**

1. Crear cuenta en Vercel (https://vercel.com)
2. Conectar repositorio de GitHub
3. Configurar variables de entorno en Vercel Dashboard
4. Configurar dominio personalizado (opcional)
5. Activar deploy automático

**Configuración en Vercel:**

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**Variables de entorno en Vercel:**

```
VITE_SUPABASE_URL=https://[TU-PROYECTO].supabase.co
VITE_SUPABASE_ANON_KEY=[TU-ANON-KEY]
VITE_SUPABASE_SERVICE_ROLE_KEY=[TU-SERVICE-ROLE-KEY]
```

### 6.2 Opción B: Netlify

**Pasos:**

1. Crear cuenta en Netlify (https://netlify.com)
2. Conectar repositorio de GitHub
3. Configurar variables de entorno
4. Configurar build settings
5. Activar deploy

**Configuración en Netlify:**

```
Build Command: npm run build
Publish Directory: dist
```

### 6.3 Opción C: Servidor Propio (VPS/Dedicado)

**Paso 1: Configurar servidor**

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Nginx
sudo apt install nginx -y

# Instalar Node.js (via NVM)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

**Paso 2: Configurar SSL**

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com
```

**Paso 3: Clonar y construir**

```bash
# Clonar repositorio
cd /var/www
sudo git clone https://github.com/[ORGANIZACION]/gestion-citas.git
cd gestion-citas

# Instalar dependencias
sudo npm install

# Configurar variables de entorno
sudo cp .env.example .env
sudo nano .env  # Editar con credenciales

# Construir para producción
sudo npm run build
```

**Paso 4: Configurar Nginx**

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;

    root /var/www/gestion-citas/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Paso 5: Iniciar servidor**

```bash
# Reiniciar Nginx
sudo systemctl restart nginx

# Verificar estado
sudo systemctl status nginx
```

---

## 7. Configuración de Supabase

### 7.1 Crear Proyecto en Supabase

1. Ir a https://supabase.com y crear cuenta
2. Click en "New Project"
3. Seleccionar región (recommend: South America o closest)
4. Configurar nombre del proyecto y contraseña
5. Esperar creación (~2 minutos)

### 7.2 Obtener Credenciales

En Supabase Dashboard > Settings > API:

| Campo | Ubicación |
|-------|-----------|
| **Project URL** | Settings > API > Project URL |
| **Anon Key** | Settings > API > anon public |
| **Service Role Key** | Settings > API > service_role |

### 7.3 Ejecutar Migraciones

**Opción A: Via Supabase Dashboard**

1. Ir a SQL Editor
2. Copiar contenido de `supabase/migrations/20240715_rls_basic.sql`
3. Ejecutar el script completo

**Opción B: Via Supabase CLI**

```bash
# Vincular proyecto
npx supabase link --project-ref [TU-PROJECT-REF]

# Ejecutar migraciones pendientes
npx supabase db push
```

### 7.4 Desplegar Edge Functions

```bash
# Desplegar todas las funciones
npx supabase functions deploy admin-users
npx supabase functions deploy admin-config
```

### 7.5 Configurar autenticación

En Supabase Dashboard > Authentication > Providers:

1. Habilitar Email/Password provider
2. Configurar URL de redirección: `https://tu-dominio.com`
3. Configurar Templates de email (opcional)
4. Habilitar MFA si es necesario

---

## 8. Configuración Post-Instalación

### 8.1 Crear Usuario Superadmin

Ejecutar en SQL Editor de Supabase:

```sql
-- Crear usuario superadmin
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@sena.edu.co',
  crypt('TuContraseñaSegura123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Asignar perfil de superadmin
INSERT INTO profiles (id, full_name, email, document_number, role_id, dependency_id, is_active)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@sena.edu.co'),
  'Super Administrador',
  'admin@sena.edu.co',
  '000000000',
  (SELECT id FROM roles WHERE name = 'SUPERADMIN'),
  NULL,
  TRUE
);
```

### 8.2 Verificar funcionamiento

1. Acceder a la aplicación
2. Iniciar sesión con credenciales de superadmin
3. Verificar panel de administración
4. Crear usuario de prueba
5. Crear cita de prueba
6. Verificar notificaciones

---

## 9. Plan de Mantenimiento

### 9.1 Mantenimiento Preventivo

| Actividad | Frecuencia | Responsable |
|-----------|------------|-------------|
| Actualizar dependencias (npm) | Mensual | Desarrollador |
| Revisar logs de errores | Semanal | DBA |
| Verificar respaldos | Diario | DBA |
| Optimizar consultas | Trimestral | DBA |
| Auditoría de seguridad | Trimestral | Seguridad |
| Actualizar SSL | Anual | DevOps |

### 9.2 Mantenimiento Correctivo

| Problema | Acción | Tiempo Máximo |
|----------|--------|---------------|
| Caída del servicio | Reiniciar servicios | 15 minutos |
| Errores de BD | Restaurar backup | 2 horas |
| Vulnerabilidad de seguridad | Aplicar parche | 24 horas |
| Rendimiento degradado | Optimizar consultas | 4 horas |

---

## 10. Solución de Problemas

### 10.1 Problemas Comunes

| Problema | Causa | Solución |
|----------|-------|----------|
| "Faltan variables de entorno" | `.env` no configurado | Verificar archivo `.env` |
| Error de conexión a Supabase | URL o Key incorrecta | Verificar credenciales |
| Página en blanco | Error de build | Revisar console y rebuild |
| Errores 401 en API | Token expirado | Re-login o refresh token |
| RLS bloquea acceso | Política incorrecta | Revisar políticas RLS |

### 10.2 Logs útiles

```bash
# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Ver logs de Node.js (si aplica)
journalctl -u node-app -f

# Ver logs de Supabase (via Dashboard)
# Supabase Dashboard > Logs > Edge Functions
```

---

## 11. Seguridad

### 11.1 Checklist de Seguridad

- [ ] HTTPS habilitado y funcionando
- [ ] Variables de entorno no expuestas en código
- [ ] Service Role Key solo en servidor
- [ ] RLS habilitado en todas las tablas
- [ ] Autenticación configurada correctamente
- [ ] Rate limiting habilitado
- [ ] Headers de seguridad configurados
- [ ] Logs de auditoría activos

### 11.2 Credenciales por Defecto (Cambiar en Producción)

| Credencial | Valor por Defecto | Acción |
|------------|-------------------|--------|
| Contraseña Superadmin | TuContraseñaSegura123! | CAMBIAR |
| Email Superadmin | admin@sena.edu.co | PERSONALIZAR |

---

## 12. Contacto y Soporte

| Rol | Nombre | Contacto |
|-----|--------|----------|
| Líder de Proyecto | Por definir | Por definir |
| Desarrollador Principal | Por definir | Por definir |
| DBA | Por definir | Por definir |
| Soporte Técnico | Por definir | Por definir |

---

## 13. Aprobaciones

| Rol | Firma | Fecha |
|-----|-------|-------|
| Líder de Proyecto | _____________ | ____/____/____ |
| Arquitecto de Software | _____________ | ____/____/____ |
| DBA | _____________ | ____/____/____ |
| Responsable de Seguridad | _____________ | ____/____/____ |
