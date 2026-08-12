import { supabaseAdmin as supabase } from "../../../lib/supabase";

let tablesAvailable = null;
let joinsAvailable = null;

const SELECT_WITH_JOINS = "*, profiles!appointments_user_id_fkey(id, full_name, document_number), dependencies!appointments_dependency_id_fkey(id, name, color), profiles!appointments_professional_id_fkey(id, full_name)";

async function checkTables() {
  if (tablesAvailable !== null) return tablesAvailable;
  try {
    const { error } = await supabase.from("appointments").select("id").limit(1);
    tablesAvailable = !error || error.code !== "42P01";
  } catch {
    tablesAvailable = false;
  }
  return tablesAvailable;
}

async function checkJoins() {
  if (joinsAvailable !== null) return joinsAvailable;
  try {
    const { error } = await supabase.from("appointments").select(SELECT_WITH_JOINS).limit(1);
    joinsAvailable = !error;
  } catch {
    joinsAvailable = false;
  }
  return joinsAvailable;
}

async function safeSelect(query) {
  const useJoins = await checkJoins();
  if (useJoins) {
    const { data, error } = await query.select(SELECT_WITH_JOINS);
    if (error) {
      joinsAvailable = false;
      const { data: fallback } = await query.select("*");
      return fallback || [];
    }
    return data || [];
  }
  const { data } = await query.select("*");
  return data || [];
}

export class AppointmentRepository {
  static async create(appointmentData) {
    const available = await checkTables();
    if (!available) throw new Error("La tabla de citas no esta disponible");

    const useJoins = await checkJoins();
    const selectClause = useJoins ? SELECT_WITH_JOINS : "*";

    const { data, error } = await supabase
      .from("appointments")
      .insert([appointmentData])
      .select(selectClause)
      .single();

    if (error) {
      if (useJoins && (error.message.includes("relation") || error.message.includes("foreign"))) {
        joinsAvailable = false;
        const { data: fallback } = await supabase
          .from("appointments")
          .select("*")
          .eq("id", data?.id)
          .single();
        return fallback || { ...appointmentData, id: data?.id };
      }
      throw new Error(`Error creando cita: ${error.message}`);
    }
    return data;
  }

  static async fetch({ userId, dependencyId, status, dateFrom, dateTo }) {
    const available = await checkTables();
    if (!available) return [];

    AppointmentRepository.cancelExpired().catch(() => {});

    let query = supabase.from("appointments");

    if (userId) query = query.eq("user_id", userId);
    if (dependencyId) query = query.eq("dependency_id", dependencyId);
    if (status) query = query.eq("status", status);
    if (dateFrom) query = query.gte("scheduled_date", dateFrom);
    if (dateTo) query = query.lte("scheduled_date", dateTo);

    query = query
      .order("scheduled_date", { ascending: true })
      .order("scheduled_time", { ascending: true });

    const data = await safeSelect(query);
    return data;
  }

  static async update(id, updates) {
    const available = await checkTables();
    if (!available) throw new Error("La tabla de citas no esta disponible");

    const useJoins = await checkJoins();
    const selectClause = useJoins ? SELECT_WITH_JOINS : "*";

    const { data, error } = await supabase
      .from("appointments")
      .update({ ...updates, updated_at: new Date() })
      .eq("id", id)
      .select(selectClause)
      .single();

    if (error) {
      if (useJoins && (error.message.includes("relation") || error.message.includes("foreign"))) {
        joinsAvailable = false;
        const { data: fallback } = await supabase
          .from("appointments")
          .select("*")
          .eq("id", id)
          .single();
        return fallback || { id, ...updates };
      }
      throw new Error(`Error actualizando cita: ${error.message}`);
    }
    return data;
  }

  static async checkAvailability(dependencyId, date, time, excludeId = null) {
    const available = await checkTables();
    if (!available) return true;

    let query = supabase
      .from("appointments")
      .select("id")
      .eq("dependency_id", dependencyId)
      .eq("scheduled_date", date)
      .eq("scheduled_time", time)
      .in("status", ["pending", "confirmed"]);

    if (excludeId) query = query.neq("id", excludeId);

    const { data, error } = await query;
    if (error) return true;
    return data.length === 0;
  }

  static async countPending(userId) {
    const available = await checkTables();
    if (!available) return 0;

    const { count, error } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "pending");

    if (error) return 0;
    return count;
  }

  static async cancelExpired() {
    const available = await checkTables();
    if (!available) return;

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().split(" ")[0].slice(0, 5);

    try {
      await supabase
        .from("appointments")
        .update({ status: "cancelled", updated_at: now.toISOString() })
        .in("status", ["pending", "confirmed"])
        .lt("scheduled_date", today);

      await supabase
        .from("appointments")
        .update({ status: "cancelled", updated_at: now.toISOString() })
        .in("status", ["pending", "confirmed"])
        .eq("scheduled_date", today)
        .lt("scheduled_time", currentTime);
    } catch {
      // Silenciar errores de cancelación automática
    }
  }
}
