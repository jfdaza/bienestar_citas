import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  TableRow, TableCell, Table, WidthType, BorderStyle, ShadingType,
  PageBreak, Tab, TabStopType, TabStopPosition
} from "docx";
import { writeFileSync } from "fs";
import { resolve } from "path";

const root = process.cwd();

function greenLine() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "39A900" } },
    spacing: { after: 300 },
  });
}

function sectionTitle(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 32, color: "39A900", font: "Helvetica" })],
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 500, after: 200 },
  });
}

function subTitle(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 26, color: "1A1A1A", font: "Helvetica" })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
  });
}

function subSubTitle(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 22, color: "2563EB", font: "Helvetica" })],
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
  });
}

function bodyText(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 20, font: "Helvetica" })],
    spacing: { before: 80, after: 80 },
  });
}

function bulletItem(text) {
  return new Paragraph({
    children: [
      new TextRun({ text: "• ", color: "39A900", font: "Helvetica" }),
      new TextRun({ text, size: 20, font: "Helvetica" }),
    ],
    indent: { left: 400 },
    spacing: { before: 60, after: 60 },
  });
}

function boldBody(label, text) {
  return new Paragraph({
    children: [
      new TextRun({ text: label, bold: true, size: 20, font: "Helvetica" }),
      new TextRun({ text, size: 20, font: "Helvetica" }),
    ],
    spacing: { before: 80, after: 80 },
  });
}

function makeTable(headers, rows, colWidths) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h) =>
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18, font: "Helvetica", color: "FFFFFF" })] })],
        shading: { type: ShadingType.SOLID, color: "39A900" },
      })
    ),
  });

  const dataRows = rows.map((row, ri) =>
    new TableRow({
      children: row.map((cell) =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: cell, size: 18, font: "Helvetica" })] })],
          shading: ri % 2 === 0 ? { type: ShadingType.SOLID, color: "F0FDF4" } : undefined,
        })
      ),
    })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

function emptyLine() {
  return new Paragraph({ spacing: { after: 100 } });
}

// ============== BUILD DOCUMENT ==============

const children = [];

// ---- COVER PAGE ----
children.push(new Paragraph({ spacing: { before: 2000 } }));
children.push(
  new Paragraph({
    children: [new TextRun({ text: "SENA", bold: true, size: 60, color: "39A900", font: "Helvetica" })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
  })
);
children.push(
  new Paragraph({
    children: [new TextRun({ text: "Bienestar", bold: true, size: 48, color: "1A1A1A", font: "Helvetica" })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
  })
);
children.push(greenLine());
children.push(
  new Paragraph({
    children: [new TextRun({ text: "Sistema de Gestión de Citas", bold: true, size: 36, color: "1A1A1A", font: "Helvetica" })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  })
);
children.push(
  new Paragraph({
    children: [new TextRun({ text: "Documento de Presentación del Producto", size: 24, color: "6B7280", font: "Helvetica" })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  })
);
children.push(
  new Paragraph({
    children: [new TextRun({ text: "Versión 1.0 — Julio 2026", size: 22, color: "9CA3AF", font: "Helvetica" })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 600 },
  })
);
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 1. INFORMACIÓN GENERAL ----
children.push(sectionTitle("1. Información General del Producto"));
children.push(makeTable(
  ["Campo", "Detalle"],
  [
    ["Nombre del Sistema", "Gestión de Citas — SENA Bienestar"],
    ["Versión", "0.0.0 (Versión 1.0 funcional)"],
    ["Fecha de Documento", "Julio 2026"],
    ["Tipo de Aplicación", "Aplicación Web (PWA — Progressive Web App)"],
    ["Arquitectura", "Frontend SPA + Backend BaaS (Supabase)"],
    ["Estado Actual", "Funcional — En fase de pruebas y ajustes"],
  ]
));
children.push(emptyLine());

// ---- 2. DESCRIPCIÓN ----
children.push(sectionTitle("2. Descripción del Producto"));
children.push(bodyText(
  "El Sistema de Gestión de Citas de Bienestar SENA es una aplicación web diseñada para gestionar de forma integral las citas de los servicios de bienestar del SENA (Servicio Nacional de Aprendizaje). Permite a los aprendices agendar citas con profesionales de Psicología, Enfermería y Trabajo Social, mientras ofrece a los profesionales y coordinadores herramientas de gestión, seguimiento y análisis de datos."
));
children.push(emptyLine());
children.push(bodyText("El sistema está orientado a:"));
children.push(bulletItem("Aprendices del SENA que necesitan servicios de bienestar"));
children.push(bulletItem("Profesionales de Psicología, Enfermería y Trabajo Social"));
children.push(bulletItem("Coordinadores de bienestar que supervisan la operación"));
children.push(bulletItem("Administradores del sistema que gestionan usuarios y configuración"));
children.push(emptyLine());

// ---- 3. OBJETIVOS ----
children.push(sectionTitle("3. Objetivos del Sistema"));
children.push(subTitle("3.1 Objetivo General"));
children.push(bodyText(
  "Digitalizar y optimizar el proceso de gestión de citas de bienestar del SENA, mejorando la experiencia del aprendiz, la eficiencia operativa de los profesionales y la capacidad de monitoreo de los coordinadores."
));
children.push(subTitle("3.2 Objetivos Específicos"));
children.push(bulletItem("Permitir a los aprendices agendar, modificar y cancelar citas de forma autónoma"));
children.push(bulletItem("Facilitar a los profesionales la gestión diaria de citas (confirmar, completar, marcar inasistencia)"));
children.push(bulletItem("Proveer a los coordinadores dashboards con KPIs y métricas en tiempo real"));
children.push(bulletItem("Implementar un panel administrativo para gestión de usuarios y auditoría"));
children.push(bulletItem("Garantizar la seguridad y privacidad de los datos de los usuarios"));
children.push(emptyLine());

// ---- 4. TECNOLOGÍAS ----
children.push(sectionTitle("4. Stack Tecnológico"));
children.push(makeTable(
  ["Capa", "Tecnología", "Versión"],
  [
    ["Frontend", "React", "19.2.4"],
    ["Bundler", "Vite", "8.0.4"],
    ["Routing", "React Router DOM", "7.14.0"],
    ["Formularios", "React Hook Form + Zod", "7.72.1 / 4.3.6"],
    ["Backend / BaaS", "Supabase (PostgreSQL + Auth + Edge Functions)", "2.103.0"],
    ["Gráficas", "Recharts", "3.8.1"],
    ["Iconos", "Lucide React", "1.8.0"],
    ["Notificaciones", "Sonner (Toast)", "2.0.7"],
    ["Fechas", "date-fns", "4.1.0"],
    ["Reportes", "jsPDF + pdfmake + docx", "4.2.1 / 0.3.11 / 9.7.1"],
    ["Testing", "Vitest + Playwright", "4.1.9 / 1.61.0"],
    ["Linter", "ESLint", "9.39.4"],
  ]
));
children.push(emptyLine());

// ---- 5. MÓDULOS ----
children.push(sectionTitle("5. Módulos y Funcionalidades"));
children.push(emptyLine());

// 5.1 Auth
children.push(subTitle("5.1 Módulo de Autenticación"));
children.push(bulletItem("Inicio de sesión con email y contraseña"));
children.push(bulletItem("Registro de usuarios nuevos en 2 pasos (datos personales + credenciales)"));
children.push(bulletItem("Cierre de sesión automático al cerrar la pestaña del navegador"));
children.push(bulletItem("Persistencia de sesión al recargar la página"));
children.push(bulletItem("Validación de contraseña fuerte (mín. 8 caracteres, mayúscula, número, carácter especial)"));
children.push(bulletItem("Rate limiting: máximo 3 registros por cada 10 minutos"));
children.push(bulletItem("Verificación de duplicados (email y número de documento)"));
children.push(bulletItem("Registro de eventos de seguridad (login exitoso, fallido, registro)"));
children.push(emptyLine());

// 5.2 Aprendiz
children.push(subTitle("5.2 Panel del Aprendiz"));
children.push(bulletItem("Vista de inicio con resumen de citas y estadísticas"));
children.push(bulletItem("Creación de nuevas citas con flujo de 4 pasos: Servicio → Fecha → Hora → Confirmación"));
children.push(bulletItem("Selección de servicio: Psicología, Enfermería o Trabajo Social"));
children.push(bulletItem("Calendario semanal para selección de fecha"));
children.push(bulletItem("Selección de franja horaria (8:00 AM a 5:00 PM, bloques de 60 min)"));
children.push(bulletItem("Modificación de citas pendientes o confirmadas"));
children.push(bulletItem("Cancelación de citas pendientes con confirmación"));
children.push(bulletItem("Vista de notificaciones y perfil"));
children.push(bulletItem("Navegación inferior tipo móvil (Inicio, Mis Citas, Notificaciones, Perfil)"));
children.push(bulletItem("Restricción: máximo 2 citas pendientes simultáneas"));
children.push(bulletItem("Validación: no fines de semana, con 24h de anticipación, horario laboral"));
children.push(emptyLine());

// 5.3 Profesional
children.push(subTitle("5.3 Panel del Profesional"));
children.push(bulletItem("Vista de citas del día filtradas por estado (Pendientes, Confirmadas, Completadas)"));
children.push(bulletItem("Confirmación de asistencia del aprendiz"));
children.push(bulletItem("Marcado de inasistencia (No Show)"));
children.push(bulletItem("Completar atención con notas"));
children.push(bulletItem("Sistema de notificaciones de nuevas citas pendientes"));
children.push(bulletItem("Indicador de badge con contador de notificaciones no leídas"));
children.push(bulletItem("Estadísticas: citas programadas, pendientes, completadas"));
children.push(bulletItem("Filtrado por dependencia asignada automáticamente"));
children.push(emptyLine());

// 5.4 Coordinación
children.push(subTitle("5.4 Panel de Coordinación"));
children.push(bulletItem("Dashboard ejecutivo con KPIs principales"));
children.push(bulletItem("Gráfico de cumplimiento de citas (tasa de completadas vs canceladas/no-show)"));
children.push(bulletItem("Gráfico de barras: Citas por dependencia (Psicología, Enfermería, Trabajo Social)"));
children.push(bulletItem("Gráfico de tendencia mensual de citas"));
children.push(bulletItem("Tabla de rendimiento de profesionales (ranking por citas completadas)"));
children.push(bulletItem("Filtro de rango de fechas (Hoy, Último mes, Últimos 3 meses)"));
children.push(bulletItem("Accesos rápidos: Top profesionales, Distribución horaria, Reportes, Historial"));
children.push(emptyLine());

// 5.5 Admin
children.push(subTitle("5.5 Panel de Administración"));
children.push(subSubTitle("Gestión de Usuarios"));
children.push(bulletItem("Listado de todos los usuarios con paginación"));
children.push(bulletItem("Búsqueda por nombre o número de documento (con debounce)"));
children.push(bulletItem("Filtrado por rol (SuperAdmin, Coordinación, Psicología, Enfermería, Trabajo Social, Aprendiz)"));
children.push(bulletItem("Edición de usuario: nombre, documento, rol, dependencia, estado"));
children.push(bulletItem("Activación / Desactivación de usuarios"));
children.push(bulletItem("Eliminación de usuarios (de_auth + perfil)"));
children.push(bulletItem("Creación de usuarios nuevos con asignación de rol y dependencia"));
children.push(subSubTitle("Registro de Auditoría"));
children.push(bulletItem("Timeline visual de todas las acciones administrativas"));
children.push(bulletItem("Filtrado por acción, entidad o administrador"));
children.push(bulletItem("Detalle de cambios (valores anteriores vs nuevos)"));
children.push(bulletItem("Tipos de acciones: Crear, Actualizar, Eliminar usuarios; Modificar configuración"));
children.push(bulletItem("Timestamp relativo (Hace X min, Hace X días)"));
children.push(emptyLine());

// ---- 6. MODELO DE ROLES ----
children.push(sectionTitle("6. Modelo de Roles y Permisos"));
children.push(makeTable(
  ["Rol", "ID", "Permisos Principales"],
  [
    ["SUPERADMIN", "1", "Gestión completa de usuarios, auditoría, configuración del sistema"],
    ["COORDINACION", "2", "Dashboard ejecutivo, métricas, reportes, supervisión de todos los profesionales"],
    ["PSICOLOGIA", "3", "Gestión de citas de Psicología, confirmar/completar/cancelar"],
    ["ENFERMERIA", "4", "Gestión de citas de Enfermería, confirmar/completar/cancelar"],
    ["TRABAJO_SOCIAL", "5", "Gestión de citas de Trabajo Social, confirmar/completar/cancelar"],
    ["APRENDIZ", "6", "Agendar, modificar y cancelar propias citas, ver notificaciones"],
  ]
));
children.push(emptyLine());

// ---- 7. BASE DE DATOS ----
children.push(sectionTitle("7. Modelo de Base de Datos"));
children.push(bodyText("El sistema utiliza Supabase (PostgreSQL) con las siguientes tablas principales:"));
children.push(makeTable(
  ["Tabla", "Descripción", "Relaciones"],
  [
    ["profiles", "Perfiles de usuario (nombre, email, documento, rol, dependencia)", "→ roles, → dependencies"],
    ["roles", "Roles del sistema con permisos JSON", "—"],
    ["dependencies", "Departamentos/áreas de bienestar", "—"],
    ["appointments", "Citas agendadas (fecha, hora, estado, motivo, notas)", "→ profiles, → dependencies"],
    ["audit_logs", "Registro de acciones administrativas", "→ profiles"],
    ["security_logs", "Eventos de seguridad (login, registro, intentos fallidos)", "—"],
    ["system_config", "Configuración del sistema (key-value)", "—"],
  ]
));
children.push(emptyLine());
children.push(bodyText("Estados de una cita: pending → confirmed → completed / cancelled / no_show"));
children.push(emptyLine());

// ---- 8. SEGURIDAD ----
children.push(sectionTitle("8. Características de Seguridad"));
children.push(subTitle("8.1 Implementadas"));
children.push(bulletItem("Autenticación con Supabase Auth (email + contraseña)"));
children.push(bulletItem("Protección de rutas con componente ProtectedRoute"));
children.push(bulletItem("Cierre de sesión automático al cerrar pestaña (beforeunload)"));
children.push(bulletItem("Rate limiting en registro (3 intentos / 10 min)"));
children.push(bulletItem("Validación de contraseña fuerte (8+ chars, mayúscula, número, especial)"));
children.push(bulletItem("Sanitización de inputs contra XSS"));
children.push(bulletItem("Validación de email y contraseña"));
children.push(bulletItem("Protección CSRF con tokens generados"));
children.push(bulletItem("Headers CSP configurados en index.html"));
children.push(bulletItem("Registro de eventos de seguridad en tabla security_logs"));
children.push(bulletItem("Verificación periódica de token (cada minuto)"));
children.push(bulletItem("Creación de perfil automático si no existe al iniciar sesión"));
children.push(emptyLine());

children.push(subTitle("8.2 Pendientes de Implementar"));
children.push(bulletItem("Migración de service role key a Edge Functions (crítico)"));
children.push(bulletItem("RLS (Row Level Security) en todas las tablas de Supabase"));
children.push(bulletItem("Autorización server-side para operaciones admin"));
children.push(bulletItem("Flujo de verificación de email"));
children.push(bulletItem("Timeout de sesión configurable"));
children.push(bulletItem("Restricciones por IP"));
children.push(emptyLine());

// ---- 9. RENDIMIENTO ----
children.push(sectionTitle("9. Características de Rendimiento"));
children.push(makeTable(
  ["Característica", "Estado", "Detalle"],
  [
    ["Lazy Loading", "Implementado", "Todos los componentes de página se cargan bajo demanda via React.lazy()"],
    ["Memoización", "Implementado", "useMemo en dashboards para stats y listas filtradas"],
    ["useCallback", "Implementado", "Hooks optimizados con dependencias controladas"],
    ["Actualizaciones Optimistas", "Implementado", "UI se actualiza inmediatamente al crear/modificar citas"],
    ["Skeleton Loaders", "Implementado", "Indicadores de carga placeholders durante fetching"],
    ["Carga Paralela", "Implementado", "Promise.all para queries independientes"],
    ["Debounce", "Implementado", "300ms en búsquedas de usuarios"],
    ["PWA", "Implementado", "Manifest + Service Worker para instalabilidad y cache offline"],
    ["Code Splitting", "Implementado", "Por rutas con Suspense"],
    ["Paginación", "Parcial", "Solo en gestión de usuarios, pendiente en citas"],
  ]
));
children.push(emptyLine());

// ---- 10. ESTRUCTURA ----
children.push(sectionTitle("10. Estructura del Proyecto"));
children.push(makeTable(
  ["Directorio", "Contenido"],
  [
    ["src/features/auth/", "Páginas de Login y Register"],
    ["src/features/appointments/", "Dashboard del aprendiz, profesional, formularios, cards, calendario"],
    ["src/features/dashboard/", "Panel de coordinación con KPIs, gráficas y tablas"],
    ["src/features/admin/", "Gestión de usuarios y registro de auditoría"],
    ["src/providers/", "AuthProvider con contexto de autenticación global"],
    ["src/hooks/", "useSecurity (rate limiting, validación de token, CSRF)"],
    ["src/lib/", "Configuración de Supabase y Edge Functions"],
    ["src/routes/", "Enrutamiento y protección de rutas"],
    ["src/shared/", "Componentes compartidos (Unauthorized)"],
    ["supabase/functions/", "Edge Functions para operaciones admin"],
    ["supabase/migrations/", "Migraciones SQL (RLS básico)"],
    ["e2e/", "Tests end-to-end con Playwright"],
  ]
));
children.push(emptyLine());

// ---- 11. SCRIPTS ----
children.push(sectionTitle("11. Scripts Disponibles"));
children.push(makeTable(
  ["Comando", "Descripción"],
  [
    ["npm run dev", "Iniciar servidor de desarrollo"],
    ["npm run build", "Generar build de producción"],
    ["npm run preview", "Vista previa del build"],
    ["npm run lint", "Verificación de código con ESLint"],
    ["npm run test", "Ejecutar tests unitarios (Vitest)"],
    ["npm run test:run", "Ejecutar tests una vez"],
    ["npm run test:e2e", "Ejecutar tests end-to-end (Playwright)"],
    ["npm run test:e2e:report", "Ver reporte de tests E2E"],
  ]
));
children.push(emptyLine());

// ---- 12. SERVICIOS ----
children.push(sectionTitle("12. Servicios de Bienestar Disponibles"));
children.push(makeTable(
  ["Servicio", "Descripción", "Departamento"],
  [
    ["Psicología", "Apoyo emocional y bienestar mental", "Psicología"],
    ["Enfermería", "Atención en salud y orientación", "Enfermería"],
    ["Trabajo Social", "Apoyo social y acompañamiento", "Trabajo Social"],
  ]
));
children.push(emptyLine());

// ---- 13. VALIDACIONES ----
children.push(sectionTitle("13. Reglas de Negocio y Validaciones"));
children.push(subTitle("13.1 Agendamiento de Citas"));
children.push(bulletItem("No se permiten citas los fines de semana"));
children.push(bulletItem("Mínimo 24 horas de anticipación para agendar"));
children.push(bulletItem("Horario permitido: 8:00 AM a 5:00 PM"));
children.push(bulletItem("Duración de cada cita: 60 minutos"));
children.push(bulletItem("Máximo 2 citas pendientes por aprendiz"));
children.push(bulletItem("Verificación de disponibilidad (no duplicar horario)"));
children.push(bulletItem("Motivo opcional, máximo 250 caracteres"));
children.push(emptyLine());

children.push(subTitle("13.2 Estados de Cita"));
children.push(makeTable(
  ["Estado", "Descripción", "Quién lo cambia"],
  [
    ["pending", "Cita creada, esperando confirmación del profesional", "Sistema (al crear)"],
    ["confirmed", "Profesional confirmó la asistencia", "Profesional"],
    ["completed", "Atención realizada exitosamente", "Profesional"],
    ["cancelled", "Cita cancelada por el aprendiz", "Aprendiz"],
    ["no_show", "El aprendiz no se presentó", "Profesional"],
  ]
));
children.push(emptyLine());

children.push(subTitle("13.3 Registro de Usuario"));
children.push(bulletItem("Nombre y apellido obligatorios"));
children.push(bulletItem("Tipo de documento: CC, TI, CE, PA"));
children.push(bulletItem("Correo electrónico válido"));
children.push(bulletItem("Contraseña: mínimo 8 caracteres, 1 mayúscula, 1 número, 1 carácter especial"));
children.push(bulletItem("Confirmación de contraseña obligatoria"));
children.push(bulletItem("Rol por defecto: APRENDIZ"));
children.push(bulletItem("Verificación de duplicados (email y documento)"));
children.push(emptyLine());

// ---- 14. ESTADO ----
children.push(sectionTitle("14. Estado Actual del Producto"));
children.push(subTitle("14.1 Funcionalidades Completadas"));
children.push(bulletItem("Sistema de autenticación completo (login, registro, sesión persistente)"));
children.push(bulletItem("Panel del Aprendiz con CRUD de citas"));
children.push(bulletItem("Panel del Profesional con gestión diaria"));
children.push(bulletItem("Panel de Coordinación con dashboard ejecutivo y gráficas"));
children.push(bulletItem("Panel de Administración con gestión de usuarios y auditoría"));
children.push(bulletItem("Sistema de roles y permisos (6 roles)"));
children.push(bulletItem("Validaciones de negocio en formularios"));
children.push(bulletItem("Notificaciones toast para feedback al usuario"));
children.push(bulletItem("Diseño responsive con navegación inferior móvil"));
children.push(bulletItem("Tests E2E con Playwright para todos los roles"));
children.push(bulletItem("Build de producción optimizado"));
children.push(bulletItem("PWA instalable"));
children.push(emptyLine());

children.push(subTitle("14.2 Pendientes Críticos"));
children.push(bulletItem("Migrar service role key a Edge Functions (seguridad)"));
children.push(bulletItem("Implementar RLS robusto en todas las tablas"));
children.push(bulletItem("CI/CD pipeline (GitHub Actions)"));
children.push(bulletItem("Dockerfile para containerización"));
children.push(bulletItem("Monitoreo de errores (Sentry o similar)"));
children.push(emptyLine());

children.push(subTitle("14.3 Pendientes Mejorables"));
children.push(bulletItem("Paginación en listado de citas"));
children.push(bulletItem("Virtualización de listas largas"));
children.push(bulletItem("Mover estilos inline a archivos CSS"));
children.push(bulletItem("Configuración de entornos (.env.staging, .env.production)"));
children.push(bulletItem("Health checks y scripts de despliegue"));
children.push(bulletItem("Configuración de hosting/nginx"));
children.push(emptyLine());

// ---- 15. CALIFICACIÓN ----
children.push(sectionTitle("15. Calificación General del Producto"));
children.push(makeTable(
  ["Área", "Calificación", "Observación"],
  [
    ["Funcionalidad", "8/10", "Todos los módulos principales están operativos"],
    ["Seguridad", "6/10", "Buenas prácticas implementadas, pendiente migración service role"],
    ["Rendimiento", "8/10", "Optimizaciones aplicadas (lazy loading, memo, debounce)"],
    ["UX / Diseño", "7/10", "Interfaz intuitiva, responsive, con skeleton loaders"],
    ["Testing", "7/10", "Tests E2E completos, pendiente más unit tests"],
    ["Documentación", "6/10", "Informes técnicos existentes, pendiente documentación de usuario"],
    ["Infraestructura", "4/10", "Sin CI/CD, sin Docker, sin monitoreo"],
    ["General", "7/10", "Producto funcional y sólido, requiere ajustes de producción"],
  ]
));
children.push(emptyLine());

// ---- 16. CONCLUSIÓN ----
children.push(sectionTitle("16. Conclusión"));
children.push(bodyText(
  "El Sistema de Gestión de Citas de Bienestar SENA es una aplicación web moderna, construida con tecnologías de vanguardia (React 19, Supabase, Vite), que ofrece una experiencia completa para la gestión de citas de bienestar. El sistema cuenta con 4 paneles diferenciados por rol, un modelo de seguridad robusto con mejoras continuas, y un rendimiento optimizado con las mejores prácticas de React."
));
children.push(emptyLine());
children.push(bodyText(
  "El producto se encuentra en un estado funcional sólido, con todas las funcionalidades principales implementadas y operativas. Los pendientes identificados están relacionados principalmente con la preparación para producción (infraestructura, CI/CD, monitoreo) y la migración de la service role key a Edge Functions por razones de seguridad."
));
children.push(emptyLine());
children.push(bodyText(
  "Este documento sirve como referencia para el cliente sobre las capacidades, estado y roadmap del sistema."
));

// ---- BUILD ----
const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children,
    },
  ],
  styles: {
    default: {
      document: {
        run: { font: "Helvetica", size: 22 },
      },
    },
  },
});

const buffer = await Packer.toBuffer(doc);
const outputPath = resolve(root, "PRESENTACION-PRODUCTO.docx");
writeFileSync(outputPath, buffer);
console.log(`Documento generado: ${outputPath}`);
