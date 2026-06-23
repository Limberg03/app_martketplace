import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';

const API_URL = '/api';

const AdminReports: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = () => {
    setLoading(true);
    fetch(`${API_URL}/admin/reportes?admin_id=${user?.id}`)
      .then(res => res.json())
      .then(data => setReports(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) fetchReports();
  }, [user]);

  const handleResolve = async (reportId: number, estado: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/reportes/${reportId}/estado?estado=${estado}&admin_id=${user?.id}`, { method: 'PUT' });
      if (res.ok) {
        fetchReports();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0', color: 'white' }}>Resolución de Reportes</h1>
        <p style={{ color: '#94A3B8', margin: 0 }}>Revisa y toma acción sobre los problemas reportados por la comunidad.</p>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {loading ? (
          <div style={{ color: '#64748B', padding: '24px' }}>Cargando reportes...</div>
        ) : reports.length === 0 ? (
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '48px', textAlign: 'center', color: '#64748B' }}>
            <FontAwesomeIcon icon={faCheck} style={{ fontSize: '48px', marginBottom: '16px', color: '#10B981' }} />
            <h3 style={{ margin: '0 0 8px 0', color: 'white' }}>Todo en orden</h3>
            <p style={{ margin: 0 }}>No hay reportes pendientes de revisión.</p>
          </div>
        ) : (
          reports.map(report => (
            <div key={report.id} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ 
                    padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                    background: report.estado === 'PENDIENTE' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                    color: report.estado === 'PENDIENTE' ? '#F59E0B' : '#10B981'
                  }}>
                    {report.estado}
                  </span>
                  <span style={{ color: '#64748B', fontSize: '0.85rem' }}>
                    {new Date(report.fecha_creacion).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '1.25rem' }}>
                  <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#EF4444', marginRight: '8px' }} />
                  {report.motivo}
                </h3>
                
                <p style={{ color: '#94A3B8', margin: '0 0 16px 0', lineHeight: 1.6 }}>{report.descripcion}</p>
                
                <div style={{ display: 'flex', gap: '24px', fontSize: '0.85rem', color: '#64748B' }}>
                  <span><strong>Reportado por:</strong> {report.usuario_nombre}</span>
                  <span><strong>Aplicación:</strong> {report.app_titulo}</span>
                </div>
              </div>

              {report.estado === 'PENDIENTE' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '160px' }}>
                  <button 
                    onClick={() => handleResolve(report.id, 'RESUELTO')}
                    style={{ background: '#10B981', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <FontAwesomeIcon icon={faCheck} /> Marcar Resuelto
                  </button>
                  <button 
                    onClick={() => handleResolve(report.id, 'DESCARTADO')}
                    style={{ background: 'transparent', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'white'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                  >
                    <FontAwesomeIcon icon={faTrash} /> Descartar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminReports;
