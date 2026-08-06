import { TrendingUp, TrendingDown } from "lucide-react";

export function KPICard({ title, value, color, subtitle, trend }) {
  const getIcon = () => {
    if (color === "#22c55e") return "✓";
    if (color === "#3b82f6") return "📊";
    if (color === "#f59e0b") return "⏰";
    if (color === "#ef4444") return "⚠";
    return "📈";
  };

  const getIconBg = () => {
    if (color === "#22c55e") return "#D1FAE5";
    if (color === "#3b82f6") return "#DBEAFE";
    if (color === "#f59e0b") return "#FEF3C7";
    if (color === "#ef4444") return "#FEE2E2";
    return "#F3F4F6";
  };

  return (
    <div className="kpi-card">
      <div className="kpi-icon" style={{ background: getIconBg(), color }}>
        {getIcon()}
      </div>
      <div className="kpi-content">
        <span className="kpi-label">{title}</span>
        <span className="kpi-value" style={{ color }}>{value}</span>
        {subtitle && <span className="kpi-subtitle">{subtitle}</span>}
        {trend && (
          <span className={`kpi-trend ${trend > 0 ? 'positive' : 'negative'}`}>
            {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}
