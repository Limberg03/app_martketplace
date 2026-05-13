import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, faMicrochip, faCheckCircle, faShoppingCart, 
  faBookOpen, faCodeBranch, faSpinner, faBoxOpen, faUser,
  faChevronLeft, faChevronRight, faLock, faSignInAlt
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://127.0.0.1:8000/api';

interface AppDetalle {
  id: number;
  titulo: string;
  descripcion: string;
  precio_venta: number;
  tecnologia: string;
  url_manual: string | null;
  imagenes_urls: string | null;
  fecha_publicacion: string;
  vendedor_id: number;
  estado: string;
}

interface Vendedor {
  nombre: string;
  descripcion: string | null;
}

const AppDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [app, setApp] = useState<AppDetalle | null>(null);
  const [vendedor, setVendedor] = useState<Vendedor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Galería
  const [activeImage, setActiveImage] = useState(0);
  const [imagesList, setImagesList] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = user ? `${API_URL}/apps/${id}?usuario_id=${user.id}` : `${API_URL}/apps/${id}`;
        const resApp = await fetch(url);
        if (!resApp.ok) throw new Error('Aplicación no encontrada');
        const dataApp = await resApp.json();
        setApp(dataApp);
        
        // Procesar imágenes
        let imgs: string[] = [];
        if (dataApp.imagenes_urls) {
          imgs = dataApp.imagenes_urls.split(',').filter((i: string) => i.trim() !== '');
        } else if (dataApp.url_manual) {
          imgs = [dataApp.url_manual];
        }
        setImagesList(imgs);

        // Cargar datos del vendedor
        const resVend = await fetch(`${API_URL}/auth/profile/${dataApp.vendedor_id}`);
        if (resVend.ok) {
          setVendedor(await resVend.json());
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, height: '60vh' }}>
      <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: '40px', color: 'var(--primary)' }} />
    </div>
  );

  if (error || !app) return (
    <div className="container" style={{ padding: '40px 24px', flex: 1, textAlign: 'center' }}>
      <FontAwesomeIcon icon={faBoxOpen} style={{ fontSize: '64px', color: 'var(--border-color)', marginBottom: '24px' }} />
      <h2>Aplicación no encontrada</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>La aplicación que buscas no existe o fue eliminada.</p>
      <Link to="/marketplace" className="btn btn-primary">Volver al Marketplace</Link>
    </div>
  );

  const handleNextImage = () => {
    if (imagesList.length > 0) {
      setActiveImage((prev) => (prev + 1) % imagesList.length);
    }
  };

  const handlePrevImage = () => {
    if (imagesList.length > 0) {
      setActiveImage((prev) => (prev - 1 + imagesList.length) % imagesList.length);
    }
  };

  const handlePurchaseClick = () => {
    if (!user) {
      const confirmAuth = window.confirm("Debes iniciar sesión o registrarte para adquirir el código fuente. ¿Ir al inicio de sesión?");
      if (confirmAuth) {
        navigate('/login');
      }
    } else {
      alert("La pasarela de pago estará disponible en la Fase 4.");
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px', flex: 1 }}>
      <Link to="/marketplace" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '32px', textDecoration: 'none', fontWeight: 500 }}>
        <FontAwesomeIcon icon={faArrowLeft} /> Volver al Marketplace
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px', '@media (min-width: 992px)': { gridTemplateColumns: '2fr 1fr' } } as any}>
        <div>
          {/* Galería de Imágenes */}
          {imagesList.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{ position: 'relative', width: '100%', height: '400px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--surface)' }}>
                <img 
                  src={`http://127.0.0.1:8000${imagesList[activeImage]}`} 
                  alt={`${app.titulo} screenshot ${activeImage + 1}`} 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
                
                {imagesList.length > 1 && (
                  <>
                    <button 
                      onClick={handlePrevImage}
                      style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.8)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                    >
                      <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <button 
                      onClick={handleNextImage}
                      style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.8)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                    >
                      <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                  </>
                )}
              </div>
              
              {/* Miniaturas */}
              {imagesList.length > 1 && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {imagesList.map((img, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setActiveImage(idx)}
                      style={{ 
                        width: '80px', height: '60px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
                        border: activeImage === idx ? '2px solid var(--primary)' : '2px solid transparent',
                        opacity: activeImage === idx ? 1 : 0.6,
                        transition: 'all 0.2s'
                      }}
                    >
                      <img src={`http://127.0.0.1:8000${img}`} alt={`thumb ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="glass-card" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', lineHeight: 1.2 }}>{app.titulo}</h1>
              {app.estado === 'ACTIVA' && (
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, flexShrink: 0, marginLeft: '16px' }}>
                  <FontAwesomeIcon icon={faCheckCircle} /> Verificado
                </div>
              )}
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '32px', whiteSpace: 'pre-line' }}>
              {app.descripcion}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
              <div>
                <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px' }}>Tecnologías</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {app.tecnologia.split(',').map(t => (
                    <span key={t} style={{ background: 'var(--surface-hover)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid var(--border-color)' }}>
                      <FontAwesomeIcon icon={faMicrochip} style={{ marginRight: '8px', color: 'var(--primary)' }} />
                      {t.trim()}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px' }}>Desarrollador</h4>
                <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1rem' }}>{vendedor?.nombre || 'Cargando...'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Publicado el {new Date(app.fecha_publicacion).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ marginBottom: '24px' }}>Documentación Incluida</h3>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button className="btn btn-outline" style={{ flex: 1, minWidth: '200px' }}>
                <FontAwesomeIcon icon={faBookOpen} /> Manual de Usuario
              </button>
              <button className="btn btn-outline" style={{ flex: 1, minWidth: '200px' }}>
                <FontAwesomeIcon icon={faCodeBranch} /> Arquitectura Técnica
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="glass-card" style={{ position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Precio Sugerido</h3>
            <div style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '32px' }}>
              Bs. {app.precio_venta.toFixed(2)}
            </div>

            {(!user || user.rol === 'COMPRADOR') ? (
              <>
                <button 
                  onClick={handlePurchaseClick}
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '16px', fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                  <FontAwesomeIcon icon={faShoppingCart} /> Adquirir Código Fuente
                </button>
                
                {!user ? (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <FontAwesomeIcon icon={faLock} style={{ marginRight: '6px', color: 'var(--primary)' }} />
                      Compra segura.
                    </div>
                    <div>
                      <FontAwesomeIcon icon={faSignInAlt} style={{ marginRight: '6px' }} />
                      Requiere cuenta de usuario.
                    </div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>
                    <FontAwesomeIcon icon={faLock} style={{ marginRight: '6px', color: 'var(--primary)' }} />
                    Pago seguro. Obtendrás acceso instantáneo al código fuente validado.
                  </p>
                )}
              </>
            ) : (
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <FontAwesomeIcon icon={faUser} style={{ color: '#f59e0b', marginTop: '4px' }} />
                <p style={{ color: '#f59e0b', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                  Tu cuenta es de <strong>Vendedor</strong>. Para realizar compras en el marketplace, necesitas utilizar una cuenta de Comprador.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppDetail;
