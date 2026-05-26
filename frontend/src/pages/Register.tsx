import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faUser, faEnvelope, faLock, faExclamationCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://127.0.0.1:8000/api';

const Register: React.FC = () => {
  const [role, setRole] = useState<'developer' | 'buyer'>('developer');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      const dbRole = role === 'developer' ? 'VENDEDOR' : 'COMPRADOR';
      // Llamamos al endpoint directamente para capturar el mensaje de error
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: name, correo: email, password, rol: dbRole }),
      });
      if (res.ok) {
        // El AuthContext.register también lo llama pero aquí navegamos directo
        const user = await register(name, email, password, dbRole);
        if (user && user.rol === 'VENDEDOR') {
          navigate('/portfolio');
        } else {
          navigate('/marketplace');
        }
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
    </div>
  );
};

export default Register;
