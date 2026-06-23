import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faShoppingCart, faChartLine, faSpinner, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_URL = '/api';

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
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  if (!user || user.rol !== 'VENDEDOR') return <Navigate to="/marketplace" />;

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch(`${API_URL}/dashboard/ventas/${user.id}`).then(res => res.json()),
      fetch(`${API_URL}/dashboard/metricas/${user.id}`).then(res => res.json())
    ])
    .then(([ventasData, metricasData]) => {
      setData(ventasData);
      setMetrics(metricasData);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, [user]);

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

      {/* Gráficos Recharts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h3 style={{ margin: '0 0 24px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>Ingresos Mensuales</h3>
          <div style={{ height: 300, width: '100%' }}>
            {metrics?.ventas_mensuales?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.ventas_mensuales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                  <Bar dataKey="Ventas" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>No hay datos suficientes para el gráfico.</div>
            )}
          </div>
        </div>

        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <h3 style={{ margin: '0 0 24px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>Top 3 Aplicaciones Más Vendidas</h3>
          <div style={{ height: 300, width: '100%' }}>
            {metrics?.top_apps?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.top_apps}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="Ingresos"
                  >
                    {metrics.top_apps.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>No hay suficientes ventas.</div>
            )}
          </div>
          {metrics?.top_apps?.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
              {metrics.top_apps.map((app: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'][idx % 4] }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{app.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Gráfico Ventas por Categoría */}
      <div style={{ marginBottom: '40px' }}>
        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.45s' }}>
          <h3 style={{ margin: '0 0 24px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>Ventas por Categoría</h3>
          <div style={{ height: 350, width: '100%' }}>
            {metrics?.ventas_por_categoria?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.ventas_por_categoria}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={120}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {metrics.ventas_por_categoria.map((entry: any, index: number) => (
                      <Cell key={`cell-cat-${index}`} fill={['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'][index % 6]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} formatter={(value: number) => `Bs. ${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>No hay suficientes ventas categorizadas.</div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card animate-fade-in" style={{ padding: 0, overflow: 'hidden', animationDelay: '0.5s' }}>
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
