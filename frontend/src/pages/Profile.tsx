import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faCamera, faSave, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.nombre || '');
  const [email, setEmail] = useState(user?.correo || '');
  const [saved, setSaved] = useState(false);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateProfile({ nombre: name, correo: email });
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      alert('Error al actualizar el perfil');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px', flex: 1 }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Tu perfil</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Gestiona tu información personal y tus preferencias.</p>
        </div>

        <div className="glass-card">
          <form onSubmit={handleSave}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
              <div style={{ 
                width: '100px', height: '100px', borderRadius: '50%', 
                background: 'var(--surface-hover)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center',
                position: 'relative', border: '2px solid var(--border-color)'
              }}>
                <FontAwesomeIcon icon={faUser} style={{ fontSize: '48px', color: 'var(--text-secondary)' }} />
                <button type="button" style={{
                  position: 'absolute', bottom: 0, right: 0,
                  background: 'var(--primary)', padding: '8px',
                  borderRadius: '50%', color: 'white'
                }}>
                  <FontAwesomeIcon icon={faCamera} />
                </button>
              </div>
              <div>
                <h3 style={{ marginBottom: '4px' }}>Foto de perfil</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  JPG, GIF o PNG. Tamaño máximo de 800K
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nombre completo</label>
                <div style={{ position: 'relative' }}>
                  <FontAwesomeIcon icon={faUser} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    className="form-control" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ paddingLeft: '44px' }}
                  />
                </div>
              </div>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Dirección de correo electrónico</label>
                <div style={{ position: 'relative' }}>
                  <FontAwesomeIcon icon={faEnvelope} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="email" 
                    className="form-control" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '44px' }}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Función</label>
              <input 
                type="text" 
                className="form-control" 
                value={user.rol === 'VENDEDOR' ? 'Developer / Seller' : 'Buyer / Business'} 
                disabled 
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FontAwesomeIcon icon={faExclamationCircle} />
                Los roles no pueden cambiarse una vez creada la cuenta.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', marginTop: '40px' }}>
              {saved && (
                <span style={{ color: 'var(--success)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }} className="animate-fade-in">
                  ¡Perfil guardado!
                </span>
              )}
              <button type="submit" className="btn btn-primary">
                <FontAwesomeIcon icon={faSave} />
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
