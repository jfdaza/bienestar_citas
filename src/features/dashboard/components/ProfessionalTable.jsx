import { User, ChevronRight } from "lucide-react";

export function ProfessionalTable({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '2rem',
        color: '#6B7280'
      }}>
        <p>No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div>
      <div className="professionals-header">
        <h3 className="professionals-title">Top profesionales</h3>
        <span className="chart-link">
          Ver todos <ChevronRight size={14} />
        </span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="professional-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Profesional</th>
              <th>Total Citas</th>
              <th>Completadas</th>
              <th>Eficiencia</th>
            </tr>
          </thead>
          <tbody>
            {data.map((prof, index) => {
              const efficiency = prof.total > 0
                ? Math.round((prof.completed / prof.total) * 100)
                : 0;

              return (
                <tr key={prof.id || index}>
                  <td>{index + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                        {prof.name?.charAt(0) || '?'}
                      </div>
                      <span style={{ fontWeight: 500 }}>{prof.name}</span>
                    </div>
                  </td>
                  <td>{prof.total}</td>
                  <td>{prof.completed}</td>
                  <td>
                    <div className="efficiency-bar">
                      <div
                        className="efficiency-fill"
                        style={{
                          width: `${efficiency}%`,
                          background: efficiency >= 80 ? '#22C55E' : efficiency >= 60 ? '#F59E0B' : '#EF4444',
                        }}
                      />
                      <span>{efficiency}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
