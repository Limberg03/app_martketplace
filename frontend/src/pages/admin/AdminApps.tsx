import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faShieldHalved, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';

const API_URL = '/api';

const AdminApps: React.FC = () => {
  const { user } = useAuth();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchApps = () => {
    setLoading(true);
    fetch(`${API_URL}/admin/apps?admin_id=${user?.id}`)
      .then(res => res.json())
      .then(data => setApps(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) fetchApps();
  }, [user]);

  const toggleSello = async (appId: number, currentSello: boolean) => {
    const action = currentSello ? 'retirar' : 'otorgar';
    if (!window.confirm(`¿Estás seguro de que deseas ${action} el Sello de Calidad a esta aplicación?`)) return;

    try {
      const res = await fetch(`${API_URL}/admin/apps/${appId}/sello?admin_id=${user?.id}`, { method: 'PUT' });
      if (res.ok) {
        fetchApps();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredApps = apps.filter(app => app.titulo.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0', color: 'white' }}>Moderación de Apps</h1>
          <p style={{ color: '#94A3B8', margin: 0 }}>Gestiona el catálogo y otorga insignias de calidad.</p>
        </div>
        
        <div style={{ position: 'relative', width: '300px' }}>
          <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
          <input 
            type="text" 
            placeholder="Buscar aplicación..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 48px', background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <th style={{ padding: '16px 24px', color: '#94A3B8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Aplicación</th>
              <th style={{ padding: '16px 24px', color: '#94A3B8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Estado</th>
              <th style={{ padding: '16px 24px', color: '#94A3B8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Precio</th>
              <th style={{ padding: '16px 24px', color: '#94A3B8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>Cargando datos...</td></tr>
            ) : filteredApps.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>No se encontraron aplicaciones.</td></tr>
            ) : (
              filteredApps.map(app => (
                <tr key={app.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <p style={{ margin: '0 0 4px 0', color: 'white', fontWeight: 600 }}>{app.titulo}</p>
                    <p style={{ margin: 0, color: '#64748B', fontSize: '0.85rem' }}>{new Date(app.fecha_publicacion).toLocaleDateString()}</p>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                      background: app.estado === 'ACTIVA' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                      color: app.estado === 'ACTIVA' ? '#10B981' : '#F59E0B'
                    }}>
                      {app.estado}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'white', fontWeight: 500 }}>
                    Bs. {app.precio_venta.toFixed(2)}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button 
                      onClick={() => toggleSello(app.id, app.sello_calidad)}
                      style={{ 
                        background: app.sello_calidad ? 'rgba(16,185,129,0.1)' : 'transparent',
                        border: app.sello_calidad ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.2)',
                        color: app.sello_calidad ? '#10B981' : '#94A3B8',
                        padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
                        display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
                      }}
                    >
                      <FontAwesomeIcon icon={faShieldHalved} />
                      {app.sello_calidad ? 'Verificado' : 'Otorgar Sello'}
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

export default AdminApps;
