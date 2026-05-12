import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faArrowLeft, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const RecoverPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="auth-container">
      <div className="bg-glow"></div>
      
      <div className="auth-card glass-card animate-fade-in">
        <div className="auth-header">
          <Link to="/" className="brand" style={{ justifyContent: 'center', marginBottom: '24px' }}>
            <FontAwesomeIcon icon={faStore} className="brand-icon" style={{fontSize: '32px'}} />
          </Link>
          
          {submitted ? (
            <>
              <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: '48px', color: 'var(--success)', margin: '0 auto 16px' }} />
              <h1>Check your email</h1>
              <p>We've sent a password recovery link to <strong>{email}</strong></p>
            </>
          ) : (
            <>
              <h1>Reset password</h1>
              <p>Enter your email and we'll send you a link to reset your password.</p>
            </>
          )}
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
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
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginBottom: '24px' }}>
              Send Reset Link
            </button>
            
            <Link to="/login" className="btn btn-outline" style={{ width: '100%', padding: '14px' }}>
              <FontAwesomeIcon icon={faArrowLeft} />
              Back to log in
            </Link>
          </form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <button onClick={() => setSubmitted(false)} className="btn btn-outline" style={{ width: '100%', padding: '14px' }}>
              Try another email
            </button>
            <div className="auth-footer" style={{ marginTop: '24px' }}>
              <Link to="/login">Back to log in</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecoverPassword;
