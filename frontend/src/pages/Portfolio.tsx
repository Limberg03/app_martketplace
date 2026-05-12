import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faEye, faChartBar, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

interface AppModel {
  id: number;
  titulo: string;
  visitas: number;
  precio_venta: number;
  estado: string;
}

const Portfolio: React.FC = () => {
  const { user } = useAuth();
  const [myApps, setMyApps] = useState<AppModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      if (!user) return;
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/apps/portfolio/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setMyApps(data);
        }
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, [user]);

  return (
    <div className="container" style={{ padding: '40px 24px', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Mis Aplicaciones</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Gestiona tus aplicaciones publicadas y métricas.</p>
        </div>
        <Link to="/upload" className="btn btn-primary">
          <FontAwesomeIcon icon={faPlus} /> Subir Aplicación
        </Link>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--surface-hover)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600 }}>Aplicación</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600 }}>Estado</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600 }}>Visitas</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600 }}>Ventas</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600 }}>Ingresos</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando tus aplicaciones...</td>
              </tr>
            ) : myApps.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No tienes aplicaciones publicadas todavía.</td>
              </tr>
            ) : (
              myApps.map(app => (
                <tr key={app.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 500 }}>{app.titulo}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600,
                      background: app.estado === 'ACTIVA' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: app.estado === 'ACTIVA' ? 'var(--success)' : '#f59e0b'
                    }}>
                      {app.estado}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}><FontAwesomeIcon icon={faEye} style={{color: 'var(--text-secondary)', marginRight: '8px'}} /> {app.visitas}</td>
                  <td style={{ padding: '16px 24px' }}>0</td> {/* Simulado para Sprint 1 */}
                  <td style={{ padding: '16px 24px', color: 'var(--success)', fontWeight: 600 }}>$0.00</td> {/* Simulado para Sprint 1 */}
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button className="btn btn-outline btn-sm" style={{ marginRight: '8px' }}>
                      <FontAwesomeIcon icon={faEdit} /> Editar
                    </button>
                    <button className="btn btn-outline btn-sm">
                      <FontAwesomeIcon icon={faChartBar} /> Detalles
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Portfolio;
