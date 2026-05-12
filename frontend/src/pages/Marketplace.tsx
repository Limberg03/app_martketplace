import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faStar, faMicrochip } from '@fortawesome/free-solid-svg-icons';

const Marketplace: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Simulación de datos (En prod vendrán del backend)
  const mockApps = [
    { id: 1, titulo: 'Farmacia IA', descripcion: 'Gestión inteligente de inventario para farmacias.', precio: 150.00, tecnologia: 'React/Node', vendedor: 'Limberg' },
    { id: 2, titulo: 'Contabilidad PyME', descripcion: 'Sistema de contabilidad automatizada.', precio: 300.00, tecnologia: 'Python/FastAPI', vendedor: 'Carlos' },
    { id: 3, titulo: 'Restaurante POS', descripcion: 'Punto de venta para restaurantes con menú digital.', precio: 80.00, tecnologia: 'Vue/Firebase', vendedor: 'Ana' },
  ];

  return (
    <div className="container" style={{ padding: '40px 24px', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Explorar Marketplace</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Descubre soluciones de software universitario para tu negocio.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
        <div className="form-control" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FontAwesomeIcon icon={faSearch} style={{ color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Buscar por lenguaje natural (ej. 'sistema para ventas')..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '1rem' }}
          />
        </div>
        <button className="btn btn-secondary">
          <FontAwesomeIcon icon={faFilter} /> Filtros
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {mockApps.map(app => (
          <div key={app.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{app.titulo}</h3>
              <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                ${app.precio.toFixed(2)}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', flex: 1 }}>{app.descripcion}</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FontAwesomeIcon icon={faMicrochip} /> {app.tecnologia}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FontAwesomeIcon icon={faStar} style={{ color: '#fbbf24' }} /> 4.8
              </div>
            </div>
            
            <Link to={`/app/${app.id}`} className="btn btn-primary" style={{ width: '100%' }}>
              Ver Detalles
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
