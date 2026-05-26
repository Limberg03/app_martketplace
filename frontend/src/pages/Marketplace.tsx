import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faStar, faMicrochip, faSpinner, faBoxOpen, faWandMagicSparkles, faMicrophone, faShieldHalved } from '@fortawesome/free-solid-svg-icons';

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
  sello_calidad?: boolean;
  razon_ia?: string;
}

const Marketplace: React.FC = () => {
  const { user, updateLocalUser } = useAuth();
  const [searchTerm, setSearchTerm]     = useState('');
  const [debouncedSearch, setDebounced] = useState('');
  const [categoriaId, setCategoriaId]   = useState('');
  const [categorias, setCategorias]     = useState<Categoria[]>([]);
  const [apps, setApps]                 = useState<AppItem[]>([]);
  const [loading, setLoading]           = useState(true);
  const [isAiSearch, setIsAiSearch]     = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // CU16: Recomendaciones personalizadas
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRec, setLoadingRec] = useState(false);

  // Inicializar Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript);
        // Si es IA, disparamos la búsqueda automáticamente tras escuchar la voz
        if (isAiSearch) {
          setTimeout(() => setSearchTrigger(prev => prev + 1), 200);
        } else {
          setDebounced(transcript);
        }
      };

      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, [isAiSearch]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
        setIsListening(false);
      }
    }
  };

  // Cargar categorías
  useEffect(() => {
    fetch(`${API_URL}/apps/categorias`)
      .then(r => r.json())
      .then(setCategorias)
      .catch(() => {});
  }, []);

  // Debounce SOLO para búsqueda clásica
  useEffect(() => {
    if (!isAiSearch) {
      const timer = setTimeout(() => setDebounced(searchTerm), 500);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, isAiSearch]);

  // CU16: Cargar recomendaciones personalizadas cuando el usuario está logueado como COMPRADOR
  useEffect(() => {
    if (!user || user.rol !== 'COMPRADOR') return;
    setLoadingRec(true);
    fetch(`${API_URL}/ai/recommendations/${user.id}`)
      .then(r => r.json())
      .then(data => setRecommendations(Array.isArray(data) ? data : []))
      .catch(() => setRecommendations([]))
      .finally(() => setLoadingRec(false));
  }, [user?.id]);

  // Cargar aplicaciones
  useEffect(() => {
    setLoading(true);
    
    // Si es IA usamos el término exacto al momento de presionar el botón
    const currentQuery = isAiSearch ? searchTerm : debouncedSearch;
    
    if (isAiSearch && currentQuery.trim()) {
      // Búsqueda Semántica con IA
      fetch(`${API_URL}/ai/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: user?.id || 0, query: currentQuery, limit: 10 })
      })
      .then(async r => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.detail || "Error en el servidor");
        return data;
      })
      .then(data => {
        setApps(Array.isArray(data) ? data : []);
        if (user) {
          updateLocalUser({ consultas_ia: (user.consultas_ia || 0) + 1 });
        }
      })
      .catch((err) => {
        alert(err.message);
        setApps([]);
      })
      .finally(() => setLoading(false));
    } else {
      // Búsqueda Clásica o sin query IA
      const params = new URLSearchParams();
      if (!isAiSearch && debouncedSearch) params.append('q', debouncedSearch);
      if (categoriaId) params.append('categoria_id', categoriaId);

      fetch(`${API_URL}/apps/?${params.toString()}`)
        .then(r => r.json())
        .then(data => setApps(Array.isArray(data) ? data : []))
        .catch(() => setApps([]))
        .finally(() => setLoading(false));
    }
  }, [debouncedSearch, categoriaId, isAiSearch, searchTrigger]);

  const handleManualSearch = () => {
    if (isAiSearch && searchTerm.trim()) {
      setSearchTrigger(prev => prev + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isAiSearch) {
      handleManualSearch();
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Explorar Marketplace</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Descubre soluciones de software universitario para tu negocio.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <div className={`form-control ${isAiSearch ? 'ai-search-active-wrapper' : ''}`} style={{ flex: 1, minWidth: '250px', display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', background: 'var(--surface-color)', border: isAiSearch ? 'none' : '1px solid var(--border-color)', borderRadius: '12px', transition: 'all 0.3s ease' }}>
          <FontAwesomeIcon icon={isAiSearch ? faWandMagicSparkles : faSearch} style={{ color: isAiSearch ? '#8b5cf6' : 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder={isAiSearch ? "Describe por voz o texto (Ej. 'necesito app de inventario')..." : "Buscar aplicación por título..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '1.05rem', padding: '8px 0' }}
          />
          
          {/* Botón Micrófono */}
          <button
            onClick={toggleListening}
            className="btn-icon"
            style={{ 
              background: isListening ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
              color: isListening ? '#ef4444' : 'var(--text-secondary)',
              border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="Búsqueda por voz"
          >
            <FontAwesomeIcon icon={faMicrophone} style={{ animation: isListening ? 'pulse 1.5s infinite' : 'none' }} />
          </button>

          {/* Botón Buscar Manual para IA */}
          {isAiSearch && (
            <button 
              onClick={handleManualSearch}
              className="btn btn-primary"
              style={{ padding: '6px 16px', borderRadius: '8px', fontSize: '0.9rem', marginLeft: '4px' }}
            >
              Buscar
            </button>
          )}
        </div>
        
        <button 
          onClick={() => {
            setIsAiSearch(!isAiSearch);
            setSearchTerm('');
            setDebounced('');
          }}
          className={`btn ${isAiSearch ? 'btn-primary' : 'btn-outline'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px' }}
        >
          <FontAwesomeIcon icon={faWandMagicSparkles} /> {isAiSearch ? 'Búsqueda IA Activa' : 'Usar IA'}
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FontAwesomeIcon icon={faFilter} style={{ color: 'var(--text-secondary)' }} />
          <select 
            className="form-control" 
            style={{ width: 'auto' }}
            value={categoriaId} 
            onChange={e => setCategoriaId(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categorias.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {isAiSearch && user && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-20px', marginBottom: '16px' }}>
          <span style={{ 
            background: 'rgba(139, 92, 246, 0.1)', 
            color: '#c4b5fd', 
            padding: '6px 14px', 
            borderRadius: '20px',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            fontWeight: 500,
            boxShadow: '0 0 10px rgba(139, 92, 246, 0.1)'
          }}>
            <FontAwesomeIcon icon={faWandMagicSparkles} /> 
            Consultas de IA disponibles: {Math.max(0, (user.plan_suscripcion === 'PREMIUM' ? 20 : 3) - (user.consultas_ia || 0))} / {user.plan_suscripcion === 'PREMIUM' ? 20 : 3}
          </span>
        </div>
      )}

      <div style={{ marginTop: '24px' }}>

      {/* CU16: Sección Recomendado para Ti */}
      {user && user.rol === 'COMPRADOR' && (recommendations.length > 0 || loadingRec) && (
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', borderRadius: '10px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>
              <FontAwesomeIcon icon={faWandMagicSparkles} /> Recomendado para ti
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Basado en tu historial de navegación</span>
          </div>

          {loadingRec ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)' }}>
              <FontAwesomeIcon icon={faSpinner} spin /> Calculando recomendaciones...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {recommendations.map(app => (
                <div key={`rec-${app.id}`} className="glass-card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid rgba(139,92,246,0.25)' }}>
                  <div style={{
                    height: '130px', background: 'var(--surface-hover)',
                    backgroundImage: app.imagenes_urls ? `url(http://127.0.0.1:8000${app.imagenes_urls.split(',')[0]})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderBottom: '1px solid var(--border-color)', position: 'relative'
                  }}>
                    {!app.imagenes_urls && <FontAwesomeIcon icon={faBoxOpen} style={{ fontSize: '36px', color: 'var(--border-color)' }} />}
                    {app.sello_calidad && (
                      <div style={{
                        position: 'absolute', top: '8px', right: '8px',
                        background: 'linear-gradient(135deg, #059669, #10b981)',
                        borderRadius: '8px', padding: '5px 10px',
                        fontSize: '0.7rem', fontWeight: 700, color: 'white',
                        display: 'flex', alignItems: 'center', gap: '5px',
                        boxShadow: '0 2px 10px rgba(16,185,129,0.5)'
                      }}>
                        <FontAwesomeIcon icon={faShieldHalved} /> Verificado
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontSize: '1.05rem', margin: '0 0 8px 0', lineHeight: 1.3 }}>{app.titulo}</h3>
                    <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '6px', padding: '8px 10px', marginBottom: '14px', fontSize: '0.82rem', color: '#c4b5fd', display: 'flex', gap: '7px', alignItems: 'flex-start' }}>
                      <FontAwesomeIcon icon={faWandMagicSparkles} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>{app.razon_ia}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <FontAwesomeIcon icon={faMicrochip} style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', flexShrink: 0 }} />
                        {app.tecnologia
                          ? app.tecnologia.split(',').map((t: string, i: number) => (
                              <span key={i} style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--primary)', padding: '2px 7px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{t.trim()}</span>
                            ))
                          : <span style={{ fontSize: '0.75rem' }}>No especificada</span>
                        }
                      </div>
                      <span style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>Bs. {app.precio_venta.toFixed(2)}</span>
                    </div>
                    <Link to={`/app/${app.id}`} className="btn btn-outline" style={{ textAlign: 'center', fontSize: '0.9rem' }}>Ver Detalles</Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ borderBottom: '1px solid var(--border-color)', marginTop: '40px', marginBottom: '16px' }}></div>
        </div>
      )}

      {loading ? (

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-shimmer"></div>
              <div className="skeleton-img"></div>
              <div className="skeleton-title"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text short"></div>
              <div className="skeleton-btn"></div>
            </div>
          ))}
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
              <div style={{ 
                height: '160px', background: 'var(--surface-hover)', 
                backgroundImage: app.url_manual ? `url(http://127.0.0.1:8000${app.url_manual})` : 'none',
                backgroundSize: 'cover', backgroundPosition: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderBottom: '1px solid var(--border-color)', position: 'relative'
              }}>
                {!app.url_manual && <FontAwesomeIcon icon={faBoxOpen} style={{ fontSize: '48px', color: 'var(--border-color)' }} />}
                {app.sello_calidad && (
                  <div style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: 'linear-gradient(135deg, #059669, #10b981)',
                    borderRadius: '8px', padding: '5px 10px',
                    fontSize: '0.72rem', fontWeight: 700, color: 'white',
                    display: 'flex', alignItems: 'center', gap: '5px',
                    boxShadow: '0 2px 10px rgba(16,185,129,0.5)',
                    letterSpacing: '0.3px'
                  }}>
                    <FontAwesomeIcon icon={faShieldHalved} />  Verificado
                  </div>
                )}
              </div>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.2rem', margin: 0, lineHeight: 1.3 }}>{app.titulo}</h3>
                  <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, flexShrink: 0, marginLeft: '12px' }}>
                    Bs. {app.precio_venta.toFixed(2)}
                  </span>
                </div>
                
                {app.razon_ia && (
                  <div className="ai-badge">
                    <FontAwesomeIcon icon={faWandMagicSparkles} style={{ marginTop: '2px' }} /> 
                    <span>{app.razon_ia}</span>
                  </div>
                )}
                
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', flex: 1, display: '-webkit-box', WebkitLineClamp: app.razon_ia ? 2 : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {app.descripcion}
                </p>
                
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                      <FontAwesomeIcon icon={faMicrochip} style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }} />
                      {app.tecnologia
                        ? app.tecnologia.split(',').map((t: string, i: number) => (
                            <span key={i} style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--primary)', padding: '3px 9px', borderRadius: '5px', fontSize: '0.78rem', fontWeight: 600 }}>{t.trim()}</span>
                          ))
                        : <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No especificada</span>
                      }
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '24px', fontSize: '0.85rem' }}>
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
    </div>
  );
};

export default Marketplace;
