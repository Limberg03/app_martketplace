import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faFilePdf, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const MyPurchases: React.FC = () => {
  // Simulación
  const compras = [
    { id: 101, titulo: 'Contabilidad PyME', fecha: '28 Abril 2026', monto: 300.00, estado: 'COMPLETADO' }
  ];

  return (
    <div className="container" style={{ padding: '40px 24px', flex: 1 }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Mis Compras</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Historial de tus adquisiciones y enlaces de descarga.</p>

      {compras.map(compra => (
        <div key={compra.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{compra.titulo}</h3>
            <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <span>Fecha: {compra.fecha}</span>
              <span>Monto: ${compra.monto.toFixed(2)}</span>
              <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FontAwesomeIcon icon={faCheckCircle} /> Pago Completado
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-outline">
              <FontAwesomeIcon icon={faFilePdf} /> Manual
            </button>
            <button className="btn btn-primary">
              <FontAwesomeIcon icon={faDownload} /> Descargar Código
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyPurchases;
