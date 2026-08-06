import { supabaseAdmin as supabase } from "../../../lib/supabase";

export class AppointmentRepository {
  static async create(appointmentData) {
    const { data, error } = await supabase
      .from("appointments")
      .insert([appointmentData])
      .select("*, profiles!appointments_user_id_fkey(id, full_name, document_number), dependencies!appointments_dependency_id_fkey(id, name, color), profiles!appointments_professional_id_fkey(id, full_name)")
      .single();

    if (error) throw new Error(`Error creando cita: ${error.message}`);
    return data;
  }

  static async fetch({ userId, dependencyId, status, dateFrom, dateTo }) {
    let query = supabase
      .from("appointments")
      .select("*, profiles!appointments_user_id_fkey(id, full_name, document_number), dependencies!appointments_dependency_id_fkey(id, name, color), profiles!appointments_professional_id_fkey(id, full_name)");

    if (userId) query = query.eq("user_id", userId);
    if (dependencyId) query = query.eq("dependency_id", dependencyId);
    if (status) query = query.eq("status", status);
    if (dateFrom) query = query.gte("scheduled_date", dateFrom);
    if (dateTo) query = query.lte("scheduled_date", dateTo);

    query = query
      .order("scheduled_date", { ascending: true })
      .order("scheduled_time", { ascending: true });

    const { data, error } = await query;
    if (error) throw new Error(`Error fetching citas: ${error.message}`);
    return data || [];
  }

  static async update(id, updates) {
    const { data, error } = await supabase
      .from("appointments")
      .update({ ...updates, updated_at: new Date() })
      .eq("id", id)
      .select("*, profiles!appointments_user_id_fkey(id, full_name, document_number), dependencies!appointments_dependency_id_fkey(id, name, color), profiles!appointments_professional_id_fkey(id, full_name)")
      .single();

    if (error) throw new Error(`Error actualizando cita: ${error.message}`);
    return data;
  }

  static async checkAvailability(dependencyId, date, time, excludeId = null) {
    let query = supabase
      .from("appointments")
      .select("id")
      .eq("dependency_id", dependencyId)
      .eq("scheduled_date", date)
      .eq("scheduled_time", time)
      .in("status", ["pending", "confirmed"]);

    if (excludeId) query = query.neq("id", excludeId);

    const { data, error } = await query;
    if (error) throw error;
    return data.length === 0;
  }

  static async countPending(userId) {
    const { count, error } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "pending");

    if (error) throw error;
    return count;
  }
}
