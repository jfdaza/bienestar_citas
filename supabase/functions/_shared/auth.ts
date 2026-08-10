import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface AuthUser {
  id: string;
  email: string;
  role_id: number;
  role_name: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

// Crear cliente admin con service role
export function createAdminClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
}

// Crear cliente con JWT del usuario
export function createUserClient(authHeader: string): SupabaseClient {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: authHeader },
    },
  });
}

// Verificar autenticación y obtener usuario
export async function authenticateUser(
  req: Request,
  supabaseAdmin: SupabaseClient
): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader) {
    return { success: false, error: "No authorization header" };
  }

  const token = authHeader.replace("Bearer ", "");
  
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  
  if (authError || !user) {
    return { success: false, error: "Invalid or expired token" };
  }

  // Obtener perfil y rol del usuario
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("role_id, roles(name)")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { success: false, error: "User profile not found" };
  }

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email ?? "",
      role_id: profile.role_id,
      role_name: profile.roles?.name ?? "",
    },
  };
}

// Verificar si el usuario es administrador
export function isAdmin(user: AuthUser): boolean {
  return user.role_name === "SUPERADMIN" || user.role_name === "COORDINACION";
}

// Verificar si el usuario tiene un rol específico
export function hasRole(user: AuthUser, roles: string[]): boolean {
  return roles.includes(user.role_name);
}

// Headers CORS comunes
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Respuesta de error
export function errorResponse(message: string, status: number = 400): Response {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    }
  );
}

// Respuesta de éxito
export function successResponse(data: unknown, status: number = 200): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    }
  );
}
