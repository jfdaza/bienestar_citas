import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell 
} from "recharts";

const COLORS = {
  psicologia: "#39A900",
  enfermeria: "#0284C7",
  trabajo_social: "#F97316",
};

export function DependencyChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: 200,
        color: '#6B7280'
      }}>
        No hay datos disponibles
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + (item.total || 0), 0);

  return (
    <div className="dependency-bars">
      {data.map((item, index) => {
        const percentage = total > 0 ? Math.round((item.total / total) * 100) : 0;
        const colorKey = item.name?.toLowerCase().replace(/\s+/g, '_') || '';
        const color = COLORS[colorKey] || item.color || '#6B7280';
        
        return (
          <div key={index} className="dependency-bar-item">
            <div className={`dependency-bar-icon ${colorKey}`}>
              {item.name?.charAt(0) || '?'}
            </div>
            <div className="dependency-bar-info">
              <div className="dependency-bar-header">
                <span className="dependency-bar-name">{item.name}</span>
                <span className="dependency-bar-value">
                  {item.total} ({percentage}%)
                </span>
              </div>
              <div className="dependency-bar-track">
                <div 
                  className={`dependency-bar-fill ${colorKey}`}
                  style={{ width: `${percentage}%`, background: color }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
