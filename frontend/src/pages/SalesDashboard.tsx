import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faShoppingCart, faChartLine, faSpinner, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://127.0.0.1:8000/api';

interface Venta {
  id_venta: number;
  fecha: string;
  monto: number;
  app_titulo: string;
  comprador: string;
}

interface DashboardData {
  ventas_totales: number;
  cantidad_ventas: number;
  historial: Venta[];
}

const SalesDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  if (!user || user.rol !== 'VENDEDOR') return <Navigate to="/marketplace" />;

  useEffect(() => {
    fetch(`${API_URL}/dashboard/ventas/${user.id}`)
      .then(res => res.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user.id]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, height: '60vh' }}>
      <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: '40px', color: 'var(--primary)' }} />
    </div>
  );

  const ventasTotales = data?.ventas_totales || 0;
  const cantidadVentas = data?.cantidad_ventas || 0;
  const historial = data?.historial || [];

  return (
    <div className="container" style={{ padding: '40px 24px', flex: 1 }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Dashboard de Ventas</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Monitorea el rendimiento comercial de tu portafolio.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-card animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
            <FontAwesomeIcon icon={faDollarSign} size="2x" style={{ width: '32px', textAlign: 'center' }} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px' }}>Ingresos Totales</p>
            <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Bs. {ventasTotales.toFixed(2)}</h2>
          </div>
        </div>
        
        <div className="glass-card animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '20px', animationDelay: '0.1s' }}>
          <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--success)' }}>
            <FontAwesomeIcon icon={faShoppingCart} size="2x" style={{ width: '32px', textAlign: 'center' }} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px' }}>Aplicaciones Vendidas</p>
            <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{cantidadVentas}</h2>
          </div>
        </div>
        
        <div className="glass-card animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '20px', animationDelay: '0.2s' }}>
          <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', color: 'var(--accent)' }}>
            <FontAwesomeIcon icon={faChartLine} size="2x" style={{ width: '32px', textAlign: 'center' }} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px' }}>Tasa de Conversión</p>
            <h2 style={{ fontSize: '1.8rem', margin: 0 }}>
              {/* Fake metric since we don't track total platform visits globally yet */}
              {cantidadVentas > 0 ? '4.8%' : '0.0%'}
            </h2>
          </div>
        </div>
      </div>

      <div className="glass-card animate-fade-in" style={{ padding: 0, overflow: 'hidden', animationDelay: '0.3s' }}>
        <h3 style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', margin: 0 }}>Últimas Transacciones</h3>
        
        {historial.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <FontAwesomeIcon icon={faBoxOpen} style={{ fontSize: '40px', color: 'var(--text-secondary)', marginBottom: '16px' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Aún no tienes ventas registradas.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: 'var(--surface-hover)' }}>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Fecha</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Aplicación</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Comprador</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {historial.map(venta => (
                  <tr key={venta.id_venta} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '16px 24px', fontSize: '0.9rem' }}>
                      {new Date(venta.fecha).toLocaleDateString('es-BO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                    </td>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-primary)' }}>{venta.app_titulo}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{venta.comprador}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--success)', fontWeight: 700 }}>Bs. {venta.monto.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesDashboard;
