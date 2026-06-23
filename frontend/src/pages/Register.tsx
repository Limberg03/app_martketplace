import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faUser, faEnvelope, faLock, faExclamationCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const API_URL = '/api';

const Register: React.FC = () => {
  const [role, setRole] = useState<'developer' | 'buyer'>('developer');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setShowTermsModal(true);
  };

  const handleAcceptTerms = async () => {
    setShowTermsModal(false);
    setLoading(true);
    try {
      const dbRole = role === 'developer' ? 'VENDEDOR' : 'COMPRADOR';
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: name, correo: email, password, rol: dbRole }),
      });
      if (res.ok) {
        const user = await register(name, email, password, dbRole);
        navigate('/profile');
      } else {
        const data = await res.json();
        setError(data.detail || 'Error en el registro. Intente con otro correo.');
      }
    } catch {
      setError('No se pudo conectar con el servidor. ¿Está corriendo el backend?');
    } finally {
      setLoading(false);
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
          <h1>Crear cuenta</h1>
          <p>
            Únete a NexusApp como{' '}
            {role === 'developer' ? 'desarrollador y monetiza tu código' : 'comprador y encuentra soluciones'}
          </p>
        </div>

        {/* Selector de rol */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <button
            type="button"
            className={`btn ${role === 'developer' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={() => setRole('developer')}
          >
            <FontAwesomeIcon icon={faUser} /> Soy Desarrollador
          </button>
          <button
            type="button"
            className={`btn ${role === 'buyer' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={() => setRole('buyer')}
          >
            <FontAwesomeIcon icon={faStore} /> Soy Comprador
          </button>
        </div>

        {/* Mensaje de error del servidor */}
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
            <label className="form-label">Nombre completo</label>
            <div style={{ position: 'relative' }}>
              <FontAwesomeIcon icon={faUser} style={{
                position: 'absolute', left: '16px', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-secondary)'
              }} />
              <input
                type="text" className="form-control" required
                placeholder="Tu nombre completo"
                value={name} onChange={e => setName(e.target.value)}
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

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
            <label className="form-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <FontAwesomeIcon icon={faLock} style={{
                position: 'absolute', left: '16px', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-secondary)'
              }} />
              <input
                type="password" className="form-control" required
                placeholder="Mínimo 6 caracteres"
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
              ? <><FontAwesomeIcon icon={faSpinner} spin /> Creando cuenta...</>
              : 'Crear cuenta'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '24px' }}>
          ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
        </div>
      </div>

      {showTermsModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div className="glass-card animate-fade-in" style={{
            background: 'var(--surface)', border: '1px solid var(--border-color)',
            borderRadius: '16px', padding: '28px', maxWidth: '600px', width: '100%',
            maxHeight: '85vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <FontAwesomeIcon icon={faStore} style={{ fontSize: '24px', color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-primary)' }}>Términos y Condiciones</h2>
            </div>

            <div style={{
              overflowY: 'auto', flex: 1, paddingRight: '8px', marginBottom: '24px',
              fontSize: '0.92rem', lineHeight: '1.6', color: 'var(--text-secondary)'
            }}>
              <p style={{ marginBottom: '16px' }}>
                Por favor, lee y acepta los términos legales que rigen el uso del Marketplace <strong>NexusApp (AppSwap)</strong> de la <strong>U.A.G.R.M.</strong>:
              </p>
              
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '16px', marginBottom: '8px' }}>1. Introducción</h3>
              <p style={{ marginBottom: '16px' }}>
                Al registrarte en nuestra plataforma para la compra o venta de proyectos de software y código fuente, aceptas estar legalmente sujeto a estas políticas.
              </p>

              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '16px', marginBottom: '8px' }}>2. Propiedad Intelectual y Licencias</h3>
              <p style={{ marginBottom: '16px' }}>
                Los vendedores declaran ser los autores originales del código subido. Los compradores adquieren una licencia de uso, modificación y estudio del código para fines académicos o profesionales, quedando prohibida su reventa directa sin cambios sustanciales.
              </p>

              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '16px', marginBottom: '8px' }}>3. Transacciones y Pagos</h3>
              <p style={{ marginBottom: '16px' }}>
                Las compras se realizan de manera segura mediante Stripe. NexusApp retiene una comisión por transacción para el mantenimiento de los servicios en la nube.
              </p>

              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '16px', marginBottom: '8px' }}>4. Responsabilidades</h3>
              <p style={{ marginBottom: '16px' }}>
                La plataforma y la U.A.G.R.M. no se responsabilizan por fallos o vulnerabilidades en el código fuente adquirido. La compra se realiza bajo la responsabilidad del comprador.
              </p>
            </div>

            <div style={{
              display: 'flex', gap: '12px', justifyContent: 'flex-end',
              borderTop: '1px solid var(--border-color)', paddingTop: '16px'
            }}>
              <button
                type="button" className="btn btn-outline"
                onClick={() => {
                  setShowTermsModal(false);
                  setError('Debes aceptar los términos y condiciones para poder crear tu cuenta.');
                }}
                style={{ padding: '10px 20px' }}
              >
                Rechazar
              </button>
              <button
                type="button" className="btn btn-primary"
                onClick={handleAcceptTerms}
                style={{ padding: '10px 24px' }}
              >
                Aceptar y Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
