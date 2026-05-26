import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faFilePdf, faCheckCircle, faSpinner, faBoxOpen, faStar, faCommentDots } from '@fortawesome/free-solid-svg-icons';
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
  
  // Reseñas
  const [reviewAppId, setReviewAppId] = useState<number | null>(null);
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const location = useLocation();
  const isSuccess = new URLSearchParams(location.search).get('success') === 'true';

  useEffect(() => {
    if (!user) return;
    fetch(`${API_URL}/dashboard/compras/${user.id}`)
      .then(res => res.json())
      .then(data => setCompras(Array.isArray(data) ? data : []))
      .catch(() => setCompras([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (!user || user.rol !== 'COMPRADOR') return <Navigate to="/marketplace" />;

  const submitReview = async () => {
    if (!reviewAppId) return;
    setReviewLoading(true);
    setReviewError('');
    try {
      const res = await fetch(`${API_URL}/reviews/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          app_id: reviewAppId,
          usuario_id: user.id,
          review: { estrellas: reviewStars, comentario: reviewText }
        })
      });
      const data = await res.json();
      if (res.ok) {
        setReviewAppId(null);
        setReviewText('');
        setReviewStars(5);
        alert('Reseña guardada con éxito.');
      } else {
        setReviewError(data.detail || 'Error al guardar la reseña.');
      }
    } catch {
      setReviewError('Error de conexión.');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px', flex: 1 }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Mis Compras</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>
        Historial de tus adquisiciones y enlaces de descarga seguros.
      </p>

      {isSuccess && (
        <div className="animate-fade-in" style={{
          background: 'rgba(16,185,129,0.15)', border: '1px solid var(--success)',
          borderRadius: '12px', padding: '14px 20px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--success)'
        }}>
          <FontAwesomeIcon icon={faCheckCircle} />
          ¡Compra realizada con éxito! Tu código fuente ya está disponible.
        </div>
      )}

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
              {compra.estado === 'COMPLETADO' && (
                <button 
                  onClick={() => setReviewAppId(compra.aplicacion.id)}
                  className="btn btn-outline" style={{ background: 'var(--surface)', borderColor: '#fbbf24', color: '#fbbf24' }}
                >
                  <FontAwesomeIcon icon={faStar} /> Dejar Reseña
                </button>
              )}
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

      {/* Modal de Reseña */}
      {reviewAppId !== null && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FontAwesomeIcon icon={faCommentDots} /> Califica la aplicación
            </h3>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', fontSize: '24px', cursor: 'pointer' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <FontAwesomeIcon 
                  key={star} 
                  icon={faStar} 
                  style={{ color: star <= reviewStars ? '#fbbf24' : 'var(--border-color)', transition: 'color 0.2s' }}
                  onClick={() => setReviewStars(star)}
                />
              ))}
            </div>

            <textarea 
              className="form-control" 
              rows={4} 
              placeholder="¿Qué te pareció el código? ¿Fue fácil de implementar?"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              style={{ marginBottom: '16px', width: '100%' }}
            />

            {reviewError && <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '16px' }}>{reviewError}</p>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-outline" onClick={() => setReviewAppId(null)} disabled={reviewLoading}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={submitReview} disabled={reviewLoading || !reviewText.trim()}>
                {reviewLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Enviar Reseña'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPurchases;
