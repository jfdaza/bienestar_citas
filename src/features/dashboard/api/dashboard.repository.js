import { supabaseAdmin as supabase } from "../../../lib/supabase";

let appointmentsTableExists = null;

async function hasAppointmentsTable() {
  if (appointmentsTableExists !== null) return appointmentsTableExists;
  try {
    const { error } = await supabase.from("appointments").select("id").limit(1);
    appointmentsTableExists = !error || error.code !== "42P01";
  } catch {
    appointmentsTableExists = false;
  }
  return appointmentsTableExists;
}

export class DashboardRepository {
  static async getKPIs(dateRange) {
    const available = await hasAppointmentsTable();
    if (!available) return null;

    try {
      const { data, error } = await supabase.rpc("get_dashboard_kpis", {
        start_date: dateRange.from,
        end_date: dateRange.to,
      });
      if (error) {
        console.error("Error en get_dashboard_kpis:", error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error("Excepción en get_dashboard_kpis:", err.message);
      return null;
    }
  }

  static async getAppointmentsByDependency(dateRange) {
    const available = await hasAppointmentsTable();
    if (!available) return [];

    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("dependency_id, dependencies (name, color), status")
        .gte("scheduled_date", dateRange.from)
        .lte("scheduled_date", dateRange.to);

      if (error) {
        console.error("Error en getAppointmentsByDependency:", error.message);
        return [];
      }

      const grouped = data.reduce((acc, curr) => {
        const depName = curr.dependencies?.name || "Sin dependencia";
        const color = curr.dependencies?.color || "#ccc";
        if (!acc[depName]) {
          acc[depName] = { name: depName, color, total: 0, completed: 0, cancelled: 0 };
        }
        acc[depName].total++;
        if (curr.status === "completed") acc[depName].completed++;
        if (curr.status === "cancelled") acc[depName].cancelled++;
        return acc;
      }, {});

      return Object.values(grouped);
    } catch {
      return [];
    }
  }

  static async getMonthlyTrend(year) {
    const available = await hasAppointmentsTable();
    if (!available) return [];

    try {
      const { data, error } = await supabase.rpc("get_monthly_appointments", {
        year_param: year,
      });
      if (error) {
        console.error("Error en get_monthly_appointments:", error.message);
        return [];
      }
      return data;
    } catch {
      return [];
    }
  }

  static async getProfessionalPerformance(dateRange) {
    const available = await hasAppointmentsTable();
    if (!available) return [];

    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("professional_id, status, scheduled_date")
        .not("professional_id", "is", null)
        .gte("scheduled_date", dateRange.from)
        .lte("scheduled_date", dateRange.to);

      if (error) {
        console.error("Error en getProfessionalPerformance:", error.message);
        return [];
      }

      const profIds = [...new Set(data.map((d) => d.professional_id))];
      let profileMap = {};
      try {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", profIds);
        profiles?.forEach((p) => { profileMap[p.id] = p.full_name; });
      } catch {
        // profiles table no existe
      }

      const grouped = data.reduce((acc, curr) => {
        const profId = curr.professional_id;
        const name = profileMap[profId] || "Sin asignar";
        if (!acc[profId]) {
          acc[profId] = { id: profId, name, total: 0, completed: 0 };
        }
        acc[profId].total++;
        if (curr.status === "completed") acc[profId].completed++;
        return acc;
      }, {});

      return Object.values(grouped).sort((a, b) => b.completed - a.completed).slice(0, 10);
    } catch {
      return [];
    }
  }

  static async getRawDataForExport(dateRange) {
    const available = await hasAppointmentsTable();
    if (!available) return [];

    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, dependency_id")
        .gte("scheduled_date", dateRange.from)
        .lte("scheduled_date", dateRange.to)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error en getRawDataForExport:", error.message);
        return [];
      }

      const userIds = [...new Set(data.map((d) => d.user_id))];
      const depIds = [...new Set(data.map((d) => d.dependency_id))];
      const profIds = [...new Set(data.map((d) => d.professional_id).filter(Boolean))];

      let profileMap = {};
      let depMap = {};
      let profMap = {};

      try {
        const [profilesRes, depsRes, profsRes] = await Promise.all([
          supabase.from("profiles").select("id, full_name, document_number").in("id", userIds),
          supabase.from("dependencies").select("id, name").in("id", depIds),
          profIds.length > 0
            ? supabase.from("profiles").select("id, full_name").in("id", profIds)
            : { data: [] },
        ]);
        profilesRes.data?.forEach((p) => { profileMap[p.id] = p; });
        depsRes.data?.forEach((d) => { depMap[d.id] = d; });
        profsRes.data?.forEach((p) => { profMap[p.id] = p; });
      } catch {
        // Tablas profiles/dependencies no existen
      }

      return data.map((row) => ({
        ...row,
        dependencies: depMap[row.dependency_id] || null,
        aprendiz: profileMap[row.user_id] || null,
        professional: profMap[row.professional_id] || null,
      }));
    } catch {
      return [];
    }
  }
}
