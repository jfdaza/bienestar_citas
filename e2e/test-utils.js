// Test credentials - use environment variables in CI/CD
// For local development, set these in your .env.test file
/* eslint-disable no-undef */
export const TEST_CREDENTIALS = {
  estudiante: {
    email: process.env.TEST_ESTUDIANTE_EMAIL || "estudiante@gmail.com",
    password: process.env.TEST_ESTUDIANTE_PASSWORD || "123456",
  },
  coordinador: {
    email: process.env.TEST_COORDINADOR_EMAIL || "coordinador@gmail.com",
    password: process.env.TEST_COORDINADOR_PASSWORD || "123456",
  },
  docente: {
    email: process.env.TEST_DOCENTE_EMAIL || "docente@gmail.com",
    password: process.env.TEST_DOCENTE_PASSWORD || "123456",
  },
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || "ing.jfdq@gmail.com",
    password: process.env.TEST_ADMIN_PASSWORD || "123456",
  },
};
/* eslint-enable no-undef */
