import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  createAdminClient,
  authenticateUser,
  isAdmin,
  errorResponse,
  successResponse,
} from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
};

serve(async (req: Request) => {
  // Manejar preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createAdminClient();
    
    // Verificar autenticación
    const authResult = await authenticateUser(req, supabaseAdmin);
    
    if (!authResult.success) {
      return errorResponse(authResult.error ?? "Unauthorized", 401);
    }

    // Verificar permisos de administrador
    if (!isAdmin(authResult.user!)) {
      return errorResponse("Forbidden: Admin access required", 403);
    }

    const url = new URL(req.url);
    const method = req.method;

    // GET /admin-config - Obtener configuración
    if (method === "GET" && url.pathname === "/admin-config") {
      const { data, error } = await supabaseAdmin
        .from("system_config")
        .select("*");

      if (error) throw error;

      // Convertir a objeto clave-valor
      const config: Record<string, string> = {};
      data?.forEach((item: { key: string; value: string }) => {
        config[item.key] = item.value;
      });

      return successResponse({ config });
    }

    // PUT /admin-config - Actualizar configuración
    if (method === "PUT" && url.pathname === "/admin-config") {
      const body = await req.json();
      const { key, value } = body;

      if (!key || value === undefined) {
        return errorResponse("Key and value are required");
      }

      // Obtener valor actual
      const { data: oldConfig } = await supabaseAdmin
        .from("system_config")
        .select("*")
        .eq("key", key)
        .single();

      // Upsert configuración
      const { data, error } = await supabaseAdmin
        .from("system_config")
        .upsert({
          key,
          value,
          updated_by: authResult.user!.id,
          updated_at: new Date().toISOString(),
        }, { onConflict: "key" })
        .select()
        .single();

      if (error) throw error;

      // Registrar en auditoría
      await supabaseAdmin.from("audit_logs").insert({
        user_id: authResult.user!.id,
        action: "UPDATE_CONFIG",
        entity_type: "config",
        entity_id: key,
        old_data: oldConfig,
        new_data: data,
        user_agent: req.headers.get("user-agent"),
      });

      return successResponse({ config: data });
    }

    // PUT /admin-config/batch - Actualizar múltiples configuraciones
    if (method === "PUT" && url.pathname === "/admin-config/batch") {
      const body = await req.json();
      const { configs } = body;

      if (!configs || !Array.isArray(configs)) {
        return errorResponse("Configs array is required");
      }

      const results = [];

      for (const { key, value } of configs) {
        const { data, error } = await supabaseAdmin
          .from("system_config")
          .upsert({
            key,
            value,
            updated_by: authResult.user!.id,
            updated_at: new Date().toISOString(),
          }, { onConflict: "key" })
          .select()
          .single();

        if (error) {
          console.error(`Error updating config ${key}:`, error);
        } else {
          results.push(data);
        }
      }

      return successResponse({ configs: results });
    }

    return errorResponse("Not found", 404);
  } catch (error) {
    console.error("Error in admin-config:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
  }
});
