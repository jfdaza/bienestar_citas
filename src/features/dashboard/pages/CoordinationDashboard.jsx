import { useEffect, useState } from "react";
import { useDashboard } from "../api/hooks/useDashboard";
import { KPICard } from "../components/KPICard";
import { DependencyChart } from "../components/DependencyChart";
import { MonthlyTrendChart } from "../components/MonthlyTrendChart";
import { ProfessionalTable } from "../components/ProfessionalTable";
import { 
  Download, RefreshCw, Calendar, AlertTriangle, LogOut, 
  ChevronDown, TrendingUp, Clock, 
  User, FileText, History, CalendarDays
} from "lucide-react";
import { useAuth } from "../../../providers/AuthProvider";
import { format, subMonths } from "date-fns";

export default function CoordinationDashboard() {
  const {
    kpis,
    byDependency,
    monthlyTrend,
    professionals,
    loading,
    error,
    fetchAllMetrics,
  } = useDashboard();
  const { signOut } = useAuth();

  const [dateRange, setDateRange] = useState({
    from: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    to: format(new Date(), "yyyy-MM-dd"),
  });

  useEffect(() => {
    fetchAllMetrics(dateRange);
  }, [dateRange, fetchAllMetrics]);

  const handleDateChange = (field, value) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  if (loading && !kpis) {
    return <div className="loading-screen">Cargando dashboard...</div>;
  }

  if (error) {
    return (
      <div className="coordination-dashboard">
        <header className="dashboard-header">
          <div>
            <h1>Panel de Coordinación</h1>
            <p>Bienestar SENA</p>
          </div>
          <button onClick={signOut} className="btn-secondary">
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </header>
        <div className="error-message">
          <AlertTriangle size={24} />
          <p>Error cargando el dashboard: {error}</p>
          <button
            onClick={() => fetchAllMetrics(dateRange)}
            className="btn-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const complianceRate = kpis?.total_appointments > 0 
    ? Math.round((kpis.completed_appointments / kpis.total_appointments) * 100) 
    : 0;

  return (
    <div className="coordination-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-title">
          <div>
            <h1>Panel de Coordinación</h1>
            <p>Bienestar SENA</p>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={signOut} className="btn-icon" aria-label="Cerrar sesión">
            <LogOut size={24} />
          </button>
        </div>
      </header>

      {/* Date Filter */}
      <div className="date-filter">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
          <Calendar size={16} color="#39A900" />
          <select
            value={dateRange.from}
            onChange={(e) => handleDateChange("from", e.target.value)}
          >
            <option value={format(new Date(), "yyyy-MM-dd")}>Hoy</option>
            <option value={format(subMonths(new Date(), 1), "yyyy-MM-dd")}>Último mes</option>
            <option value={format(subMonths(new Date(), 3), "yyyy-MM-dd")}>Últimos 3 meses</option>
          </select>
        </div>
      </div>

      {/* Compliance Card */}
      {kpis && (
        <div className="compliance-card">
          <div className="compliance-content">
            <div className="compliance-label">Cumplimiento de citas</div>
            <div className="compliance-value">{complianceRate}%</div>
            <div className="compliance-trend">
              <TrendingUp size={14} />
              +18% vs semana anterior
            </div>
          </div>
          <div className="compliance-chart">
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8"/>
              <circle 
                cx="50" cy="50" r="40" 
                fill="none" 
                stroke="#22C55E" 
                strokeWidth="8"
                strokeDasharray={`${complianceRate * 2.51} 251`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
              <circle 
                cx="50" cy="50" r="40" 
                fill="none" 
                stroke="#EF4444" 
                strokeWidth="8"
                strokeDasharray={`${(100 - complianceRate) * 2.51} 251`}
                strokeDashoffset={-complianceRate * 2.51}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
          </div>
          <div className="compliance-legend">
            <div className="legend-item">
              <div className="legend-dot green"></div>
              <span>Completadas</span>
              <span style={{ fontWeight: 600 }}>{kpis.completed_appointments} ({complianceRate}%)</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot red"></div>
              <span>Canceladas / No asistieron</span>
              <span style={{ fontWeight: 600 }}>{kpis.no_show_count} ({100 - complianceRate}%)</span>
            </div>
          </div>
        </div>
      )}

      {/* KPI Grid */}
      {kpis && (
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon total">
              <CalendarDays size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Total citas</span>
              <span className="kpi-value">{kpis.total_appointments}</span>
              <span className="kpi-trend positive">
                <TrendingUp size={12} />
                +12% vs semana anterior
              </span>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon pending">
              <Clock size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Pendientes</span>
              <span className="kpi-value">{kpis.pending_appointments || 0}</span>
              <span className="kpi-trend negative">
                <TrendingUp size={12} />
                -8% vs semana anterior
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <section className="charts-grid">
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Citas por dependencia</h3>
            <span className="chart-link">Ver detalle <ChevronDown size={14} /></span>
          </div>
          <DependencyChart data={byDependency} />
        </div>
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Tendencia de citas por semana</h3>
            <span className="chart-link">Ver detalle <ChevronDown size={14} /></span>
          </div>
          <MonthlyTrendChart data={monthlyTrend} />
        </div>
      </section>

      {/* Quick Links */}
      <div className="quick-links">
        <a href="#" className="quick-link-card">
          <div className="quick-link-icon">
            <User size={24} />
          </div>
          <span className="quick-link-title">Top profesionales</span>
          <span className="quick-link-desc">Profesionales con más citas completadas</span>
        </a>
        <a href="#" className="quick-link-card">
          <div className="quick-link-icon">
            <Clock size={24} />
          </div>
          <span className="quick-link-title">Distribución por franja horaria</span>
          <span className="quick-link-desc">Ver análisis por horarios del día</span>
        </a>
        <a href="#" className="quick-link-card">
          <div className="quick-link-icon">
            <FileText size={24} />
          </div>
          <span className="quick-link-title">Reporte rápido</span>
          <span className="quick-link-desc">Exporta los datos del período seleccionado</span>
        </a>
        <a href="#" className="quick-link-card">
          <div className="quick-link-icon">
            <History size={24} />
          </div>
          <span className="quick-link-title">Historial</span>
          <span className="quick-link-desc">Ver citas anteriores</span>
        </a>
      </div>

      {/* Professionals Section */}
      <section className="professionals-section">
        <ProfessionalTable data={professionals} />
      </section>
    </div>
  );
}
