import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faShoppingCart, faChartLine } from '@fortawesome/free-solid-svg-icons';

const SalesDashboard: React.FC = () => {
  return (
    <div className="container" style={{ padding: '40px 24px', flex: 1 }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Dashboard de Ventas</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Monitorea el rendimiento comercial de tu portafolio.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
            <FontAwesomeIcon icon={faDollarSign} size="2x" />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Ingresos Totales</p>
            <h2 style={{ fontSize: '1.8rem' }}>$2,160.00</h2>
          </div>
        </div>
        
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--success)' }}>
            <FontAwesomeIcon icon={faShoppingCart} size="2x" />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Ventas Totales</p>
            <h2 style={{ fontSize: '1.8rem' }}>15</h2>
          </div>
        </div>
        
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', color: 'var(--accent)' }}>
            <FontAwesomeIcon icon={faChartLine} size="2x" />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Conversión</p>
            <h2 style={{ fontSize: '1.8rem' }}>3.2%</h2>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <h3 style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>Últimas Transacciones</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--surface-hover)' }}>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600 }}>Fecha</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600 }}>Aplicación</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600 }}>Comprador</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600 }}>Monto</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '16px 24px' }}>28 Abr 2026</td>
              <td style={{ padding: '16px 24px', fontWeight: 500 }}>Farmacia IA</td>
              <td style={{ padding: '16px 24px' }}>Carlos Ruiz</td>
              <td style={{ padding: '16px 24px', color: 'var(--success)', fontWeight: 600 }}>$150.00</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '16px 24px' }}>27 Abr 2026</td>
              <td style={{ padding: '16px 24px', fontWeight: 500 }}>Farmacia IA</td>
              <td style={{ padding: '16px 24px' }}>Maria Gomez</td>
              <td style={{ padding: '16px 24px', color: 'var(--success)', fontWeight: 600 }}>$150.00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesDashboard;
