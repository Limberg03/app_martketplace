import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/marketplace');
    } else {
      alert('Credenciales incorrectas');
    }
  };

  return (
    <div className="auth-container">
      <div className="bg-glow"></div>
      
      <div className="auth-card glass-card animate-fade-in">
        <div className="auth-header">
          <Link to="/" className="brand" style={{ justifyContent: 'center', marginBottom: '24px' }}>
            <FontAwesomeIcon icon={faStore} className="brand-icon" style={{fontSize: '32px'}} />
          </Link>
          <h1>Bienvenido</h1>
          <p>Inicia sesión para acceder a tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="nombre@ejemplo.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Contraseña</label>
              <Link to="/recover-password" style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
            Iniciar Sesión
          </button>
        </form>
        
        <div className="auth-footer" style={{ marginTop: '24px' }}>
          ¿No tienes una cuenta? <Link to="/register">Regístrate</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
