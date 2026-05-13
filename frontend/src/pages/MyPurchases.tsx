import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faFilePdf, faCheckCircle, faSpinner, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://127.0.0.1:8000/api';

interface Compra {
  id_transaccion: number;
  monto: number;
  fecha: string;
  estado: string;
  aplicacion: {
    id: number;
    titulo: string;
    url_codigo: string;
    url_manual: string;
  };
}

const MyPurchases: React.FC = () => {
  const { user } = useAuth();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);

  if (!user || user.rol !== 'COMPRADOR') return <Navigate to="/marketplace" />;

  useEffect(() => {
    fetch(`${API_URL}/dashboard/compras/${user.id}`)
      .then(res => res.json())
      .then(data => setCompras(Array.isArray(data) ? data : []))
      .catch(() => setCompras([]))
      .finally(() => setLoading(false));
  }, [user.id]);

  return (
    <div className="container" style={{ padding: '40px 24px', flex: 1 }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Mis Compras</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>
        Historial de tus adquisiciones y enlaces de descarga seguros.
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: '32px', color: 'var(--primary)', marginBottom: '16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Cargando tus compras...</p>
        </div>
      ) : compras.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
          <FontAwesomeIcon icon={faBoxOpen} style={{ fontSize: '48px', color: 'var(--text-secondary)', marginBottom: '16px' }} />
          <h3 style={{ marginBottom: '8px' }}>Aún no has comprado nada</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Explora el marketplace para encontrar aplicaciones útiles para ti.
          </p>
          <Link to="/marketplace" className="btn btn-primary">
            Ir al Marketplace
          </Link>
        </div>
      ) : (
        compras.map(compra => (
          <div key={compra.id_transaccion} className="glass-card animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{compra.aplicacion.titulo}</h3>
              <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                <span>Fecha: {new Date(compra.fecha).toLocaleDateString('es-BO')}</span>
                <span>Monto: Bs. {compra.monto.toFixed(2)}</span>
                {compra.estado === 'COMPLETADO' && (
                  <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <FontAwesomeIcon icon={faCheckCircle} /> Pago Completado
                  </span>
                )}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to={`/app/${compra.aplicacion.id}`} className="btn btn-outline" style={{ background: 'var(--surface)' }}>
                <FontAwesomeIcon icon={faFilePdf} /> Ver Detalles
              </Link>
              <a 
                href={`http://127.0.0.1:8000${compra.aplicacion.url_codigo}`} 
                download 
                className="btn btn-primary"
              >
                <FontAwesomeIcon icon={faDownload} /> Descargar Código
              </a>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyPurchases;
