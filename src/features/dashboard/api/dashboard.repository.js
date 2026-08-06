import { supabaseAdmin as supabase } from "../../../lib/supabase";

// AGREGACIONES COMPLEJAS con PostgreSQL
export class DashboardRepository {
  // KPI: Conteos generales
  static async getKPIs(dateRange) {
    const { data, error } = await supabase.rpc("get_dashboard_kpis", {
      start_date: dateRange.from,
      end_date: dateRange.to,
    });

    if (error) throw new Error(`Error KPIs: ${error.message}`);
    return data;
  }

  // Citas por dependencia (para gráfico de barras)
  static async getAppointmentsByDependency(dateRange) {
    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        dependency_id,
        dependencies (name, color),
        status
      `,
      )
      .gte("scheduled_date", dateRange.from)
      .lte("scheduled_date", dateRange.to);

    if (error) throw error;

    // Transformación en frontend (podría ser SQL también)
    const grouped = data.reduce((acc, curr) => {
      const depName = curr.dependencies?.name || "Sin dependencia";
      const color = curr.dependencies?.color || "#ccc";

      if (!acc[depName]) {
        acc[depName] = {
          name: depName,
          color,
          total: 0,
          completed: 0,
          cancelled: 0,
        };
      }

      acc[depName].total++;
      if (curr.status === "completed") acc[depName].completed++;
      if (curr.status === "cancelled") acc[depName].cancelled++;

      return acc;
    }, {});

    return Object.values(grouped);
  }

  // Evolución mensual (línea de tiempo)
  static async getMonthlyTrend(year) {
    const { data, error } = await supabase.rpc("get_monthly_appointments", {
      year_param: year,
    });

    if (error) throw error;
    return data; // [{ month: 'Ene', total: 45, completed: 38 }, ...]
  }

  // Ranking de profesionales
  static async getProfessionalPerformance(dateRange) {
    // Query simplificado: sin JOIN a profiles (PostgREST no resuelve el FK)
    const { data, error } = await supabase
      .from("appointments")
      .select("professional_id, status, scheduled_date")
      .not("professional_id", "is", null)
      .gte("scheduled_date", dateRange.from)
      .lte("scheduled_date", dateRange.to);

    if (error) throw error;

    // Obtener nombres de profesionales por separado
    const profIds = [...new Set(data.map((d) => d.professional_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", profIds);

    const profileMap = {};
    if (profiles) {
      profiles.forEach((p) => {
        profileMap[p.id] = p.full_name;
      });
    }

    const grouped = data.reduce((acc, curr) => {
      const profId = curr.professional_id;
      const name = profileMap[profId] || "Sin asignar";

      if (!acc[profId]) {
        acc[profId] = {
          id: profId,
          name,
          total: 0,
          completed: 0,
          avgResponseTime: 0,
        };
      }

      acc[profId].total++;
      if (curr.status === "completed") acc[profId].completed++;

      return acc;
    }, {});

    return Object.values(grouped)
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 10);
  }

  // Datos crudos para exportar a Excel
  static async getRawDataForExport(dateRange) {
    // Query simplificado: sin JOINs problemáticos
    const { data, error } = await supabase
      .from("appointments")
      .select("*, dependency_id")
      .gte("scheduled_date", dateRange.from)
      .lte("scheduled_date", dateRange.to)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Enriquecer con datos de profiles y dependencies
    const userIds = [...new Set(data.map((d) => d.user_id))];
    const depIds = [...new Set(data.map((d) => d.dependency_id))];
    const profIds = [
      ...new Set(data.map((d) => d.professional_id).filter(Boolean)),
    ];

    const [profilesRes, depsRes, profsRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, document_number").in("id", userIds),
      supabase.from("dependencies").select("id, name").in("id", depIds),
      profIds.length > 0
        ? supabase.from("profiles").select("id, full_name").in("id", profIds)
        : { data: [] },
    ]);

    const profileMap = {};
    profilesRes.data?.forEach((p) => { profileMap[p.id] = p; });

    const depMap = {};
    depsRes.data?.forEach((d) => { depMap[d.id] = d; });

    const profMap = {};
    profsRes.data?.forEach((p) => { profMap[p.id] = p; });

    return data.map((row) => ({
      ...row,
      dependencies: depMap[row.dependency_id] || null,
      aprendiz: profileMap[row.user_id] || null,
      professional: profMap[row.professional_id] || null,
    }));
  }
}
