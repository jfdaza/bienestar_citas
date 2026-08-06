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
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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

    // GET /admin-users - Listar usuarios
    if (method === "GET" && url.pathname === "/admin-users") {
      const page = parseInt(url.searchParams.get("page") ?? "1");
      const limit = parseInt(url.searchParams.get("limit") ?? "20");
      const search = url.searchParams.get("search") ?? "";
      const role = url.searchParams.get("role") ?? "";

      let query = supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact" });

      if (search) {
        query = query.or(`full_name.ilike.%${search}%, document_number.ilike.%${search}%`);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;

      // Enriquecer con roles y dependencies
      const { data: roles } = await supabaseAdmin.from("roles").select("id, name, description");
      const { data: deps } = await supabaseAdmin.from("dependencies").select("id, name");

      const roleMap: Record<number, unknown> = {};
      roles?.forEach((r: { id: number }) => { roleMap[r.id] = r; });
      const depMap: Record<number, unknown> = {};
      deps?.forEach((d: { id: number }) => { depMap[d.id] = d; });

      let enriched = data?.map((u: { role_id: number; dependency_id: number }) => ({
        ...u,
        roles: roleMap[u.role_id] || null,
        dependencies: depMap[u.dependency_id] || null,
      })) ?? [];

      // Filtrar por rol si se especifica
      if (role) {
        enriched = enriched.filter((u: { roles: { name: string } }) => u.roles?.name === role);
      }

      return successResponse({
        users: enriched,
        total: count,
        page,
        totalPages: Math.ceil((count ?? 0) / limit),
      });
    }

    // POST /admin-users - Crear usuario
    if (method === "POST" && url.pathname === "/admin-users") {
      const body = await req.json();
      const { email, password, fullName, documentNumber, roleId, dependencyId } = body;

      if (!email || !password || !fullName) {
        return errorResponse("Email, password and fullName are required");
      }

      // Crear usuario en Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName, document_number: documentNumber },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");

      // Esperar a que el trigger cree el profile
      let profile = null;
      let attempts = 0;
      while (attempts < 10) {
        await new Promise((r) => setTimeout(r, 500));
        const { data, error } = await supabaseAdmin
          .from("profiles")
          .select("*")
          .eq("id", authData.user.id)
          .single();

        if (!error && data) {
          profile = data;
          break;
        }
        attempts++;
      }

      if (!profile) {
        throw new Error("Timeout waiting for profile creation");
      }

      // Actualizar profile con datos adicionales
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({
          full_name: fullName,
          document_number: documentNumber,
          role_id: roleId,
          dependency_id: dependencyId,
        })
        .eq("id", authData.user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Registrar en auditoría
      await supabaseAdmin.from("audit_logs").insert({
        user_id: authResult.user!.id,
        action: "CREATE_USER",
        entity_type: "user",
        entity_id: authData.user.id,
        new_data: updatedProfile,
        user_agent: req.headers.get("user-agent"),
      });

      return successResponse({ user: updatedProfile }, 201);
    }

    // PUT /admin-users/:id - Actualizar usuario
    if (method === "PUT" && url.pathname.startsWith("/admin-users/")) {
      const userId = url.pathname.split("/")[2];
      const body = await req.json();
      const { roleId, dependencyId, isActive, fullName, documentNumber } = body;

      // Obtener datos actuales
      const { data: oldData } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      // Actualizar usuario
      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (roleId !== undefined) updates.role_id = roleId;
      if (dependencyId !== undefined) updates.dependency_id = dependencyId;
      if (isActive !== undefined) updates.is_active = isActive;
      if (fullName !== undefined) updates.full_name = fullName;
      if (documentNumber !== undefined) updates.document_number = documentNumber;

      const { data: newData, error } = await supabaseAdmin
        .from("profiles")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;

      // Registrar en auditoría
      await supabaseAdmin.from("audit_logs").insert({
        user_id: authResult.user!.id,
        action: "UPDATE_USER",
        entity_type: "user",
        entity_id: userId,
        old_data: oldData,
        new_data: newData,
        user_agent: req.headers.get("user-agent"),
      });

      return successResponse({ user: newData });
    }

    // DELETE /admin-users/:id - Eliminar usuario
    if (method === "DELETE" && url.pathname.startsWith("/admin-users/")) {
      const userId = url.pathname.split("/")[2];

      // Obtener datos antes de eliminar
      const { data: oldData } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      // Eliminar profile
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (profileError) throw profileError;

      // Eliminar de Auth
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (authError) console.error("Error deleting auth user:", authError.message);

      // Registrar en auditoría
      await supabaseAdmin.from("audit_logs").insert({
        user_id: authResult.user!.id,
        action: "DELETE_USER",
        entity_type: "user",
        entity_id: userId,
        old_data: oldData,
        user_agent: req.headers.get("user-agent"),
      });

      return successResponse({ success: true });
    }

    return errorResponse("Not found", 404);
  } catch (error) {
    console.error("Error in admin-users:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
  }
});
