import { supabase } from "./supabase";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const FUNCTIONS_BASE = `${SUPABASE_URL}/functions/v1`;

// Obtener token de sesión actual
async function getSessionToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

// Wrapper para llamadas a Edge Functions
async function callEdgeFunction(functionName, options = {}) {
  const token = await getSessionToken();
  
  if (!token) {
    throw new Error("No active session");
  }

  const { method = "GET", body = null, params = {} } = options;
  
  // Construir URL con parámetros
  let url = `${FUNCTIONS_BASE}/${functionName}`;
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  const fetchOptions = {
    method,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
  };

  if (body && method !== "GET") {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `Edge function error: ${response.status}`);
  }
  
  return data;
}

// ============== ADMIN USERS ==============

export const AdminUsersAPI = {
  // Listar usuarios
  async list({ page = 1, limit = 20, search = "", role = "" } = {}) {
    return callEdgeFunction("admin-users", {
      params: { page, limit, search, role },
    });
  },

  // Crear usuario
  async create({ email, password, fullName, documentNumber, roleId, dependencyId }) {
    return callEdgeFunction("admin-users", {
      method: "POST",
      body: { email, password, fullName, documentNumber, roleId, dependencyId },
    });
  },

  // Actualizar usuario
  async update(userId, updates) {
    return callEdgeFunction(`admin-users/${userId}`, {
      method: "PUT",
      body: updates,
    });
  },

  // Eliminar usuario
  async delete(userId) {
    return callEdgeFunction(`admin-users/${userId}`, {
      method: "DELETE",
    });
  },
};

// ============== ADMIN CONFIG ==============

export const AdminConfigAPI = {
  // Obtener configuración
  async get() {
    return callEdgeFunction("admin-config");
  },

  // Actualizar configuración
  async update(key, value) {
    return callEdgeFunction("admin-config", {
      method: "PUT",
      body: { key, value },
    });
  },

  // Actualizar múltiples configuraciones
  async updateBatch(configs) {
    return callEdgeFunction("admin-config/batch", {
      method: "PUT",
      body: { configs },
    });
  },
};

// ============== HELPER PARA VERIFICAR DISPONIBILIDAD ==============

export async function checkEdgeFunctionsAvailable() {
  try {
    const token = await getSessionToken();
    if (!token) return false;
    
    const response = await fetch(`${FUNCTIONS_BASE}/admin-users`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
    });
    
    // Si responde (aunque sea 401/403), las functions están desplegadas
    return response.status !== 404;
  } catch {
    return false;
  }
}
