import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faBox, faDollarSign, faChartPie } from '@fortawesome/free-solid-svg-icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';

const API_URL = '/api';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`${API_URL}/admin/stats?admin_id=${user.id}`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading || !stats) {
    return <div style={{ color: '#94A3B8' }}>Cargando estadísticas globales...</div>;
  }

  const pieData = [
    { name: 'Compradores', value: stats.usuarios.compradores, color: '#3B82F6' },
    { name: 'Vendedores', value: stats.usuarios.vendedores, color: '#8B5CF6' }
  ];

  const appsData = [
    { name: 'Activas', value: stats.apps.activas, color: '#10B981' },
    { name: 'En Revisión', value: stats.apps.en_revision, color: '#F59E0B' }
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0', color: 'white' }}>Panel de Control</h1>
        <p style={{ color: '#94A3B8', margin: 0 }}>Bienvenido al centro de mando del Marketplace.</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {[
          { title: 'Ingresos Totales', value: `Bs. ${stats.ingresos_totales.toFixed(2)}`, icon: faDollarSign, color: '#10B981' },
          { title: 'Total Usuarios', value: stats.usuarios.total, icon: faUsers, color: '#3B82F6' },
          { title: 'Total Aplicaciones', value: stats.apps.total, icon: faBox, color: '#8B5CF6' },
          { title: 'Tasa de Actividad', value: '85%', icon: faChartPie, color: '#F59E0B' }
        ].map((kpi, i) => (
          <div key={i} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: `${kpi.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={kpi.icon} style={{ fontSize: '24px', color: kpi.color }} />
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>{kpi.title}</p>
              <p style={{ margin: 0, color: 'white', fontSize: '1.75rem', fontWeight: 800 }}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ color: 'white', margin: '0 0 24px 0', fontSize: '1.1rem' }}>Distribución de Usuarios</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1F2937', border: 'none', borderRadius: '8px', color: 'white' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
            {pieData.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '0.9rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: d.color }}></div>
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ color: 'white', margin: '0 0 24px 0', fontSize: '1.1rem' }}>Estado de Aplicaciones</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appsData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" axisLine={false} tickLine={false} />
                <YAxis stroke="#64748B" axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ background: '#1F2937', border: 'none', borderRadius: '8px', color: 'white' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {appsData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
