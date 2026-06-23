import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faUser, faSignOutAlt, faChevronRight, faBell, faCheck } from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout, notifications, unreadCount, markAsRead, requestPushPermission } = useAuth();
  const [showNotifs, setShowNotifs] = React.useState(false);
  const [pushEnabled, setPushEnabled] = React.useState(
    'Notification' in window && Notification.permission === 'granted'
  );
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar glass">
      <div className="container nav-content">
        <Link to="/" className="brand">
          <FontAwesomeIcon icon={faStore} className="brand-icon" />
          <span className="brand-name">Nexus<span className="text-gradient">App</span></span>
        </Link>
        
        <div className="nav-links">
          {(!user || user.rol !== 'VENDEDOR') && (
            <Link to="/marketplace" className="nav-link">Explorar Marketplace</Link>
          )}
          {user && user.rol === 'VENDEDOR' && (
            <>
              <Link to="/portfolio" className="nav-link">Mis Aplicaciones</Link>
              <Link to="/sales" className="nav-link">Ventas</Link>
            </>
          )}
          {user && user.rol === 'COMPRADOR' && (
            <Link to="/purchases" className="nav-link">Mis Compras</Link>
          )}
          {user && user.rol === 'ADMIN' && (
            <Link to="/admin" className="nav-link" style={{ color: '#8B5CF6', fontWeight: 'bold' }}>Panel Admin</Link>
          )}
        </div>

        <div className="nav-auth">
          {user ? (
            <div className="user-menu">
              <div style={{ position: 'relative' }}>
                <button className="btn btn-outline btn-sm" onClick={() => setShowNotifs(!showNotifs)} style={{ position: 'relative', border: 'none', background: 'rgba(255,255,255,0.05)' }}>
                  <FontAwesomeIcon icon={faBell} />
                  {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifs && (
                  <div style={{ position: 'absolute', top: '120%', right: 0, width: '300px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)', zIndex: 100 }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Notificaciones</h4>
                    {notifications.length === 0 ? (
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No hay notificaciones.</p>
                    ) : (
                      <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {notifications.map((n: any) => (
                          <div key={n.id} style={{ background: n.leido ? 'transparent' : 'rgba(139, 92, 246, 0.2)', border: n.leido ? '1px solid transparent' : '1px solid rgba(139, 92, 246, 0.4)', padding: '10px', borderRadius: '8px', position: 'relative' }}>
                            <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{n.titulo}</p>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {n.mensaje.split(/(\*\*.*?\*\*)/g).map((part: string, i: number) => 
                                part.startsWith('**') && part.endsWith('**') 
                                  ? <strong key={i} style={{ color: 'var(--text-primary)' }}>{part.slice(2, -2)}</strong> 
                                  : <span key={i}>{part}</span>
                              )}
                            </p>
                            {!n.leido && (
                              <button onClick={() => markAsRead(n.id)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }} title="Marcar como leída">
                                <FontAwesomeIcon icon={faCheck} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {!pushEnabled && (
                      <button 
                        onClick={async () => {
                          await requestPushPermission();
                          setPushEnabled('Notification' in window && Notification.permission === 'granted');
                        }} 
                        style={{ marginTop: '12px', width: '100%', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', color: '#60A5FA', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                      >
                        Activar notificaciones en PC
                      </button>
                    )}
                  </div>
                )}
              </div>
              <Link to="/profile" className="btn btn-outline btn-sm">
                <FontAwesomeIcon icon={faUser} />
                Perfil
              </Link>
              <button onClick={handleLogout} className="btn btn-primary btn-sm">
                <FontAwesomeIcon icon={faSignOutAlt} />
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/demo" className="btn btn-outline" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>Cuenta Demo</Link>
              <Link to="/login" className="btn btn-outline">Log in</Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
                <FontAwesomeIcon icon={faChevronRight} />
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
