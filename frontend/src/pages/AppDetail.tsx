import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, faMicrochip, faCheckCircle, faShoppingCart, faCalendarAlt,
  faBookOpen, faCodeBranch, faSpinner, faBoxOpen, faUser,
  faChevronLeft, faChevronRight, faLock, faSignInAlt, faStar, faComment, faTimes, faShieldHalved
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import AIChatbot from '../components/AIChatbot';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  manual_markdown: string | null;
  sello_calidad: boolean;
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
  
  // Reseñas
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingPurchase, setLoadingPurchase] = useState(false);
  
  // Galería
  const [activeImage, setActiveImage] = useState(0);
  const [imagesList, setImagesList] = useState<string[]>([]);
  
  // Modal de Lector de Documento
  const [showDocModal, setShowDocModal] = useState(false);

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

        // Cargar reseñas
        const resReviews = await fetch(`${API_URL}/reviews/${dataApp.id}`);
        if (resReviews.ok) {
          setReviews(await resReviews.json());
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // CU16: Registrar visita (2 pts) si el usuario está logueado y es COMPRADOR
    if (user && user.rol === 'COMPRADOR' && id) {
      fetch(`${API_URL}/ai/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: user.id, app_id: parseInt(id), tipo_accion: 'visita' })
      }).catch(() => {}); // silencioso, no afecta la UX
    }
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

  const handlePurchaseClick = async () => {
    if (!user) {
      const confirmAuth = window.confirm("Debes iniciar sesión o registrarte para adquirir el código fuente. ¿Ir al inicio de sesión?");
      if (confirmAuth) {
        navigate('/login');
      }
      return;
    } 
    
    setLoadingPurchase(true);
    try {
      const res = await fetch(`${API_URL}/stripe/create-checkout-session?app_id=${app.id}&comprador_id=${user.id}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok && data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert(data.detail || "Error al iniciar pago.");
      }
    } catch (error) {
      alert("Error de conexión al procesar el pago.");
    } finally {
      setLoadingPurchase(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px', flex: 1, maxWidth: '1200px', margin: '0 auto' }}>
      <Link to="/marketplace" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '32px', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
        <FontAwesomeIcon icon={faArrowLeft} /> Volver al Marketplace
      </Link>

      {/* ── HEADER HERO WOW ────────────────────────────────────────────── */}
      <div style={{ marginBottom: '48px' }}>
        <h1 style={{ 
          fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', 
          fontWeight: 800, 
          marginBottom: '20px', 
          lineHeight: 1.1, 
          background: 'linear-gradient(to right, #ffffff, #a78bfa)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-1px'
        }}>
          {app.titulo}
        </h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {app.estado === 'ACTIVA' && (
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', padding: '6px 14px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, border: '1px solid rgba(59,130,246,0.2)' }}>
              <FontAwesomeIcon icon={faCheckCircle} /> Activa
            </div>
          )}
          {app.sello_calidad && (
            <div style={{ background: 'linear-gradient(135deg, #059669, #10b981)', padding: '6px 14px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 700, color: 'white', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
              <FontAwesomeIcon icon={faShieldHalved} /> Código Verificado
            </div>
          )}
          
          <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 4px' }}></div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', boxShadow: '0 2px 8px rgba(139,92,246,0.4)' }}>
                <FontAwesomeIcon icon={faUser} />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', lineHeight: 1 }}>Desarrollador</span>
                <span style={{ color: '#fff', fontWeight: 600, fontSize: '1rem', lineHeight: 1.2 }}>{vendedor?.nombre || 'Cargando...'}</span>
             </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.95rem', marginLeft: '8px' }}>
             <FontAwesomeIcon icon={faCalendarAlt} /> <span>{new Date(app.fecha_publicacion).toLocaleDateString()}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {app.tecnologia.split(',').map(t => (
            <span key={t} style={{ background: 'var(--surface-hover)', color: '#e5e7eb', padding: '8px 16px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
              <FontAwesomeIcon icon={faMicrochip} style={{ color: 'var(--primary)' }} />
              {t.trim()}
            </span>
          ))}
        </div>
      </div>

      {/* ── 2-COLUMN LAYOUT ────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Galería de Imágenes */}
          {imagesList.length > 0 && (
            <div className="glass-card" style={{ padding: '16px' }}>
              <div style={{ position: 'relative', width: '100%', height: '450px', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
                <img 
                  src={`http://127.0.0.1:8000${imagesList[activeImage]}`} 
                  alt={`${app.titulo} screenshot ${activeImage + 1}`} 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
                
                {imagesList.length > 1 && (
                  <>
                    <button 
                      onClick={handlePrevImage}
                      style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', backdropFilter: 'blur(4px)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.9)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
                    >
                      <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <button 
                      onClick={handleNextImage}
                      style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', backdropFilter: 'blur(4px)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.9)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
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
                        opacity: activeImage === idx ? 1 : 0.5,
                        transition: 'all 0.2s',
                        boxShadow: activeImage === idx ? '0 0 0 2px rgba(59,130,246,0.3)' : 'none'
                      }}
                    >
                      <img src={`http://127.0.0.1:8000${img}`} alt={`thumb ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Descripción */}
          <div className="glass-card">
             <h3 style={{ marginBottom: '20px', fontSize: '1.5rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FontAwesomeIcon icon={faBoxOpen} color="var(--primary)" /> Acerca de esta aplicación
             </h3>
             <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8', whiteSpace: 'pre-line', margin: 0 }}>
               {app.descripcion}
             </p>
          </div>

          {/* Documentación (si existe) */}
          {app.manual_markdown && (
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <h3 style={{ margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem' }}>
                    <FontAwesomeIcon icon={faBookOpen} color="var(--primary)" /> Documentación Técnica
                  </h3>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.5, maxWidth: '400px' }}>El desarrollador ha adjuntado un manual detallado con instrucciones de instalación, uso y arquitectura.</p>
                </div>
                <button onClick={() => {
                  setShowDocModal(true);
                  if (user && user.rol === 'COMPRADOR' && app) {
                    fetch(`${API_URL}/ai/track`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ usuario_id: user.id, app_id: app.id, tipo_accion: 'ver_doc' })
                    }).catch(() => {});
                  }
                }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 28px', fontWeight: 600, fontSize: '1.05rem', boxShadow: '0 4px 15px rgba(59,130,246,0.4)' }}>
                  <FontAwesomeIcon icon={faBookOpen} /> Leer Documentación
                </button>
              </div>
            </div>
          )}

          {/* Reseñas */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem' }}>
              <FontAwesomeIcon icon={faComment} color="var(--primary)" /> Reseñas de Compradores
            </h3>
            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--surface-hover)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                <FontAwesomeIcon icon={faStar} style={{ fontSize: '2rem', color: 'var(--text-secondary)', marginBottom: '16px', opacity: 0.5 }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', margin: 0 }}>Aún no hay reseñas para esta aplicación.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {reviews.map(r => (
                  <div key={r.id} style={{ padding: '20px', background: 'var(--surface-hover)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FontAwesomeIcon key={i} icon={faStar} style={{ opacity: i < r.estrellas ? 1 : 0.3 }} />
                        ))}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {new Date(r.fecha).toLocaleDateString()}
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.05rem', lineHeight: 1.6 }}>{r.comentario}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── COLUMNA DERECHA (STICKY) ────────────────────────────────────────────── */}
        <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Tarjeta de Compra */}
          <div className="glass-card" style={{ padding: '32px 24px', border: '1px solid rgba(59,130,246,0.3)', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>Licencia Completa</h3>
            <div style={{ fontSize: '3.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '32px', lineHeight: 1, letterSpacing: '-1px' }}>
              Bs. {app.precio_venta.toFixed(2)}
            </div>

            {(!user || user.rol === 'COMPRADOR') ? (
              <>
                <button 
                  onClick={handlePurchaseClick}
                  disabled={loadingPurchase}
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '18px', fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 4px 20px rgba(59,130,246,0.4)', transition: 'all 0.2s' }}
                >
                  {loadingPurchase ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faShoppingCart} />} 
                  Adquirir Código Fuente
                </button>
                
                {!user ? (
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      <FontAwesomeIcon icon={faLock} style={{ color: 'var(--primary)', width: '16px' }} />
                      <span>Pago 100% seguro y encriptado.</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      <FontAwesomeIcon icon={faSignInAlt} style={{ width: '16px' }} />
                      <span>Requiere cuenta para descargar.</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <FontAwesomeIcon icon={faShieldHalved} style={{ color: '#10b981', marginTop: '4px' }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                      <strong style={{ color: '#10b981' }}>Pago seguro.</strong> Obtendrás acceso instantáneo de por vida al código fuente validado.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <FontAwesomeIcon icon={faUser} style={{ color: '#f59e0b', marginTop: '4px' }} />
                <p style={{ color: '#f59e0b', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
                  Tu cuenta es de <strong>Vendedor</strong>. Para realizar compras en el marketplace, necesitas utilizar una cuenta de Comprador.
                </p>
              </div>
            )}
          </div>
          
          {/* Card Secundaria (Garantía) */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
               <FontAwesomeIcon icon={faCodeBranch} style={{ color: 'var(--primary)', fontSize: '1.2rem', marginTop: '2px' }} />
               <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#fff' }}>Código Garantizado</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Revisamos que el código compile y se entregue tal como se describe.</p>
               </div>
            </div>
          </div>
          
        </div>
      </div>
      <AIChatbot appId={app.id} />

      {/* ── Modal Lector de Documentación ────────────────────────────────────────────── */}
      {showDocModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: '20px'
        }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '900px', height: '90vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem' }}>
                <FontAwesomeIcon icon={faBookOpen} color="var(--primary)" />
                Lector de Documentación
              </h3>
              <button onClick={() => setShowDocModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div style={{ padding: '30px', overflowY: 'auto', flex: 1, color: 'var(--text-primary)', fontSize: '1.05rem', lineHeight: '1.7' }} className="markdown-reader">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {app.manual_markdown || ''}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppDetail;
