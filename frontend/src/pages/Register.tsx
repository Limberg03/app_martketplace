import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const [role, setRole] = useState<'developer' | 'buyer'>('developer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dbRole = role === 'developer' ? 'VENDEDOR' : 'COMPRADOR';
    const success = await register(name, email, password, dbRole);
    if (success) {
      navigate('/marketplace');
    } else {
      alert('Error en el registro. Quizás el correo ya exista.');
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
          <h1>Create an account</h1>
          <p>Join NexusApp and start {role === 'developer' ? 'monetizing your code' : 'finding solutions'}</p>
        </div>
        
        <div className="role-selector" style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <button 
            type="button"
            className={`btn ${role === 'developer' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1 }}
            onClick={() => setRole('developer')}
          >
            I'm a Developer
          </button>
          <button 
            type="button"
            className={`btn ${role === 'buyer' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1 }}
            onClick={() => setRole('buyer')}
          >
            I'm a Buyer
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="John Doe" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
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
            Create Account
          </button>
        </form>
        
        <div className="auth-footer" style={{ marginTop: '24px' }}>
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
