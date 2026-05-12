import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faMicrochip, faCheckCircle, faShoppingCart, faBookOpen, faCodeBranch } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const AppDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  // Simulación
  const app = {
    id: id,
    titulo: 'Farmacia IA - Gestión Inteligente',
    descripcion: 'Un sistema completo para gestión de farmacias desarrollado como proyecto de grado. Incluye control de inventario, punto de venta y alertas de vencimiento. El código está altamente optimizado y documentado mediante IA.',
    precio: 150.00,
    tecnologia: 'React, Node.js, PostgreSQL',
    vendedor: 'Limberg Pecho',
    fecha: '15 Abril 2026',
    sello: true
  };

  return (
    <div className="container" style={{ padding: '40px 24px', flex: 1 }}>
      <Link to="/marketplace" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
        <FontAwesomeIcon icon={faArrowLeft} /> Volver al Marketplace
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
        <div>
          <div className="glass-card" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{app.titulo}</h1>
              {app.sello && (
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                  <FontAwesomeIcon icon={faCheckCircle} /> Sello de Calidad IA
                </div>
              )}
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '32px' }}>
              {app.descripcion}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
              <div>
                <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>Tecnología</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                  <FontAwesomeIcon icon={faMicrochip} className="text-gradient" /> {app.tecnologia}
                </div>
              </div>
              <div>
                <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>Desarrollador</h4>
                <div style={{ fontWeight: 500 }}>{app.vendedor}</div>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ marginBottom: '24px' }}>Documentación Generada por IA</h3>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="btn btn-outline" style={{ flex: 1 }}>
                <FontAwesomeIcon icon={faBookOpen} /> Manual de Usuario
              </button>
              <button className="btn btn-outline" style={{ flex: 1 }}>
                <FontAwesomeIcon icon={faCodeBranch} /> Arquitectura Técnica
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="glass-card" style={{ position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Precio Sugerido</h3>
            <div style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '32px' }}>
              ${app.precio.toFixed(2)}
            </div>

            {(!user || user.rol !== 'VENDEDOR') && (
              <>
                <button className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', marginBottom: '16px' }}>
                  <FontAwesomeIcon icon={faShoppingCart} /> Adquirir Código Fuente
                </button>
                
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>
                  Pago seguro y garantía de funcionamiento mediante auditoría de IA.
                </p>
              </>
            )}
            
            {user && user.rol === 'VENDEDOR' && (
              <p style={{ color: '#f59e0b', fontSize: '0.9rem', textAlign: 'center', background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '8px' }}>
                Como Vendedor, no tienes permitido comprar aplicaciones.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppDetail;
