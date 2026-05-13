import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faStar, faMicrochip, faSpinner, faBoxOpen } from '@fortawesome/free-solid-svg-icons';

const API_URL = 'http://127.0.0.1:8000/api';

interface Categoria {
  id: number;
  nombre: string;
  icono: string;
}

interface AppItem {
  id: number;
  titulo: string;
  descripcion: string;
  precio_venta: number;
  tecnologia: string;
  url_manual: string | null;
}

const Marketplace: React.FC = () => {
  const [searchTerm, setSearchTerm]     = useState('');
  const [debouncedSearch, setDebounced] = useState('');
  const [categoriaId, setCategoriaId]   = useState('');
  const [categorias, setCategorias]     = useState<Categoria[]>([]);
  const [apps, setApps]                 = useState<AppItem[]>([]);
  const [loading, setLoading]           = useState(true);

  // Cargar categorías
  useEffect(() => {
    fetch(`${API_URL}/apps/categorias`)
      .then(r => r.json())
      .then(setCategorias)
      .catch(() => {});
  }, []);

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Cargar aplicaciones
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.append('q', debouncedSearch);
    if (categoriaId) params.append('categoria_id', categoriaId);

    fetch(`${API_URL}/apps/?${params.toString()}`)
      .then(r => r.json())
      .then(data => setApps(Array.isArray(data) ? data : []))
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, [debouncedSearch, categoriaId]);

  return (
    <div className="container" style={{ padding: '40px 24px', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Explorar Marketplace</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Descubre soluciones de software universitario para tu negocio.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <div className="form-control" style={{ flex: 1, minWidth: '250px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FontAwesomeIcon icon={faSearch} style={{ color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Buscar aplicación por título..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '1rem' }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FontAwesomeIcon icon={faFilter} style={{ color: 'var(--text-secondary)' }} />
          <select 
            className="form-control" 
            value={categoriaId} 
            onChange={e => setCategoriaId(e.target.value)}
            style={{ minWidth: '200px', cursor: 'pointer' }}
          >
            <option value="">Todas las categorías</option>
            {categorias.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: '32px', marginBottom: '16px' }} />
          <p>Buscando aplicaciones...</p>
        </div>
      ) : apps.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <FontAwesomeIcon icon={faBoxOpen} style={{ fontSize: '48px', color: 'var(--text-secondary)', marginBottom: '16px' }} />
          <h3 style={{ marginBottom: '8px' }}>No se encontraron resultados</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Intenta con otros términos de búsqueda o cambia la categoría.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {apps.map(app => (
            <div key={app.id} className="glass-card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Imagen (thumbnail) */}
              <div style={{ 
                height: '160px', background: 'var(--surface-hover)', 
                backgroundImage: app.url_manual ? `url(http://127.0.0.1:8000${app.url_manual})` : 'none',
                backgroundSize: 'cover', backgroundPosition: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderBottom: '1px solid var(--border-color)'
              }}>
                {!app.url_manual && <FontAwesomeIcon icon={faBoxOpen} style={{ fontSize: '48px', color: 'var(--border-color)' }} />}
              </div>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.2rem', margin: 0, lineHeight: 1.3 }}>{app.titulo}</h3>
                  <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, flexShrink: 0, marginLeft: '12px' }}>
                    Bs. {app.precio_venta.toFixed(2)}
                  </span>
                </div>
                
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {app.descripcion}
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    <FontAwesomeIcon icon={faMicrochip} /> {app.tecnologia.split(',')[0]}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <FontAwesomeIcon icon={faStar} style={{ color: '#fbbf24' }} /> 5.0
                  </div>
                </div>
                
                <Link to={`/app/${app.id}`} className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                  Ver Detalles
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
