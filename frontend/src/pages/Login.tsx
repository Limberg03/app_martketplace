import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faEnvelope, faLock, faExclamationCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const user = await login(email, password);
    setLoading(false);
    if (user) {
      if (user.rol === 'VENDEDOR') {
        navigate('/portfolio');
      } else {
        navigate('/marketplace');
      }
    } else {
      setError('Correo o contraseña incorrectos. Verifique sus datos o cree una cuenta nueva.');
    }
  };

  return (
    <div className="auth-container">
      <div className="bg-glow"></div>

      <div className="auth-card glass-card animate-fade-in">
        <div className="auth-header">
          <Link to="/" className="brand" style={{ justifyContent: 'center', marginBottom: '24px' }}>
            <FontAwesomeIcon icon={faStore} className="brand-icon" style={{ fontSize: '32px' }} />
          </Link>
          <h1>Bienvenido</h1>
          <p>Inicia sesión para acceder a tu cuenta</p>
        </div>

        {/* Error inline */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444',
            borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '10px',
            color: '#ef4444', fontSize: '0.9rem'
          }}>
            <FontAwesomeIcon icon={faExclamationCircle} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <div style={{ position: 'relative' }}>
              <FontAwesomeIcon icon={faEnvelope} style={{
                position: 'absolute', left: '16px', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-secondary)'
              }} />
              <input
                type="email" className="form-control" required
                placeholder="correo@ejemplo.com"
                value={email} onChange={e => setEmail(e.target.value)}
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Contraseña</label>
              <Link to="/recover-password" style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <FontAwesomeIcon icon={faLock} style={{
                position: 'absolute', left: '16px', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-secondary)'
              }} />
              <input
                type="password" className="form-control" required
                placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          <button
            type="submit" className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '14px' }}
          >
            {loading
              ? <><FontAwesomeIcon icon={faSpinner} spin /> Ingresando...</>
              : 'Iniciar sesión'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '24px' }}>
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
