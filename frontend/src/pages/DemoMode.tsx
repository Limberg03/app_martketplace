import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faShoppingCart, faRocket } from '@fortawesome/free-solid-svg-icons';

const DemoMode: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleDemoLogin = async (type: 'vendedor' | 'comprador') => {
    setLoading(true);
    try {
      if (type === 'vendedor') {
        await login('carlos@nexus.com', '123456');
        navigate('/sales');
      } else {
        await login('juan@nexus.com', '123456');
        navigate('/marketplace');
      }
    } catch (error) {
      alert("Error al iniciar sesión en modo demo. Asegúrate de haber poblado la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#f8fafc' }}>
        Modo Demostración <FontAwesomeIcon icon={faRocket} style={{ color: '#38bdf8' }} />
      </h1>
      <p style={{ color: '#94a3b8', marginBottom: '3rem', fontSize: '1.1rem' }}>
        Selecciona un perfil de prueba para explorar la plataforma con datos pre-cargados (aplicaciones, ventas y reseñas reales simuladas).
      </p>

      <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {/* Vendedor Demo */}
        <div className="glass-card" style={{ flex: '1', minWidth: '300px', padding: '2rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.5rem' }}>
            <FontAwesomeIcon icon={faStore} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#f8fafc' }}>Vendedor Demo</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Entra como <strong>Carlos Software</strong>. Verás aplicaciones publicadas, un dashboard con gráficos de ventas, reseñas recibidas y el flujo para subir nuevas apps con IA.
          </p>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => handleDemoLogin('vendedor')}
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Entrar como Vendedor'}
          </button>
        </div>

        {/* Comprador Demo */}
        <div className="glass-card" style={{ flex: '1', minWidth: '300px', padding: '2rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.5rem' }}>
            <FontAwesomeIcon icon={faShoppingCart} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#f8fafc' }}>Comprador Demo</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Entra como <strong>Juan Comprador</strong>. Explora el Marketplace lleno de aplicaciones, realiza compras con pagos QR simulados y revisa tu historial.
          </p>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center', background: 'var(--success)' }}
            onClick={() => handleDemoLogin('comprador')}
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Entrar como Comprador'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoMode;
