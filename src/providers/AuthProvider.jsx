import { createContext, useContext, useEffect, useState } from "react";
import { supabase, supabaseAdmin } from "../lib/supabase";
import { logSecurityEvent } from "../hooks/useSecurity";

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("UseAuth debe usarse dentro de AuthProvider");
  }
  return context;
};

// Cliente para obtener perfil (bypasea RLS)
const db = supabaseAdmin || supabase;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Restaurar sesión existente al cargar/recargar la página
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch {
        // Ignorar errores
      } finally {
        setLoading(false);
      }
    };
    init();

    // Logout automático al cerrar la pestaña/navegador
    const handleBeforeUnload = () => {
      supabase.auth.signOut();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Escuchar cambios de auth
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
        }
      },
    );

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      listener.subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await db
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // Si el perfil no existe, intentar crearlo
        if (error.code === "PGRST116" || error.message.includes("not found")) {
          console.warn("Perfil no encontrado, creando uno nuevo...");
          
          // Obtener datos del usuario de auth
          const { data: { user: authUser } } = await supabase.auth.getUser();
          
          // Obtener rol de APRENDIZ por defecto
          const { data: roleData } = await db
            .from("roles")
            .select("id")
            .eq("name", "APRENDIZ")
            .single();

          const { data: newProfile, error: createError } = await db
            .from("profiles")
            .upsert({
              id: userId,
              full_name: authUser?.user_metadata?.full_name || "Usuario",
              email: authUser?.email || "",
              document_number: authUser?.user_metadata?.document_number || null,
              role_id: roleData?.id || 6,
              is_active: true,
            }, { onConflict: "id" })
            .select()
            .single();

          if (createError) {
            throw new Error("No se pudo crear el perfil del usuario");
          }

          // Enriquecer el nuevo perfil
          const [rolesRes, depsRes] = await Promise.all([
            db.from("roles").select("name, permissions").eq("id", newProfile.role_id).single(),
            newProfile.dependency_id
              ? db.from("dependencies").select("name").eq("id", newProfile.dependency_id).single()
              : { data: null },
          ]);

          setProfile({
            ...newProfile,
            roles: rolesRes.data || null,
            dependencies: depsRes.data || null,
          });
          return;
        }
        throw error;
      }

      // Enriquecer con roles y dependencies por separado
      const [rolesRes, depsRes] = await Promise.all([
        db.from("roles").select("name, permissions").eq("id", data.role_id).single(),
        data.dependency_id
          ? db.from("dependencies").select("name").eq("id", data.dependency_id).single()
          : { data: null },
      ]);

      setProfile({
        ...data,
        roles: rolesRes.data || null,
        dependencies: depsRes.data || null,
      });
    } catch (err) {
      console.error("Error cargando perfil:", err.message || err);
      setError("Error al cargar perfil");
    }
  };

  const signIn = async (email, password) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        // Log intento fallido
        await logSecurityEvent('login_failed', {
          email,
          error: error.message,
        });
        throw error;
      }
      
      // Log login exitoso
      await logSecurityEvent('login_success', { email });
      
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const signUp = async (email, password, userData) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            document_number: userData.document_number,
          },
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error("No se pudo crear el usuario");

      // Intentar crear profile via RPC
      const { data: profileData, error: profileError } = await db.rpc(
        "create_profile_for_user",
        {
          user_id: data.user.id,
          user_full_name: userData.full_name || "Usuario",
          user_email: email,
          user_document_number: userData.document_number || null,
        },
      );

      // Si la RPC falla, crear o actualizar profile directamente con upsert
      if (profileError || !profileData) {
        console.warn("RPC falló, creando profile directamente:", profileError?.message);
        
        // Obtener rol de APRENDIZ por defecto
        const { data: roleData } = await db
          .from("roles")
          .select("id")
          .eq("name", "APRENDIZ")
          .single();

        const { error: upsertError } = await db.from("profiles").upsert({
          id: data.user.id,
          full_name: userData.full_name || "Usuario",
          email: email,
          document_number: userData.document_number || null,
          role_id: roleData?.id || 6,
          is_active: true,
        }, { onConflict: "id" });

        if (upsertError) {
          console.error("Error creando profile directamente:", upsertError.message);
          throw new Error("Error creando perfil: " + upsertError.message);
        }
      }

      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const hasRole = (requiredRoles) => {
    if (!profile?.roles?.name) return false;
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(profile.roles.name);
    }
    return profile.roles.name === requiredRoles;
  };

  const isAdmin = () => hasRole("SUPERADMIN");
  const isCoordination = () => hasRole("COORDINACION");
  const isProfessional = () =>
    hasRole(["PSICOLOGIA", "ENFERMERIA", "TRABAJO_SOCIAL"]);
  const isAprendiz = () => hasRole("APRENDIZ");

  const value = {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    hasRole,
    isAdmin,
    isCoordination,
    isProfessional,
    isAprendiz,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
