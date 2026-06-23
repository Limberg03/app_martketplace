import React from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faShieldHalved, 
  faExclamationCircle, 
  faSignOutAlt,
  faStore,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: faChartLine },
    { path: '/admin/apps', label: 'Moderación de Apps', icon: faShieldHalved },
    { path: '/admin/reports', label: 'Resolución de Reportes', icon: faExclamationCircle },
    { path: '/admin/users', label: 'Gestión de Usuarios', icon: faUsers },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0B0F19', color: '#E2E8F0', fontFamily: 'var(--font-sans)' }}>
      {/* Sidebar */}
      <div style={{ 
        width: '280px', 
        background: '#111827', 
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        <div style={{ padding: '32px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'white' }}>
            <div style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faShieldHalved} style={{ fontSize: '18px', color: 'white' }} />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
              Nexus<span style={{ color: '#8b5cf6' }}>Admin</span>
            </span>
          </Link>
        </div>

        <div style={{ padding: '24px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '12px' }}>
            Menú Principal
          </p>
          {navItems.map(item => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px',
                  textDecoration: 'none', fontWeight: 500, transition: 'all 0.2s',
                  background: isActive ? 'rgba(59,130,246,0.1)' : 'transparent',
                  color: isActive ? '#60A5FA' : '#94A3B8',
                  borderLeft: isActive ? '3px solid #3B82F6' : '3px solid transparent'
                }}
                onMouseEnter={e => { if(!isActive) e.currentTarget.style.color = '#F8FAFC'; e.currentTarget.style.background = isActive ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)' }}
                onMouseLeave={e => { if(!isActive) e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = isActive ? 'rgba(59,130,246,0.1)' : 'transparent' }}
              >
                <FontAwesomeIcon icon={item.icon} style={{ width: '20px' }} />
                {item.label}
              </Link>
            )
          })}
        </div>

        <div style={{ padding: '24px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px',
            textDecoration: 'none', color: '#94A3B8', fontWeight: 500, transition: 'all 0.2s', marginBottom: '8px'
          }} onMouseEnter={e => { e.currentTarget.style.color = '#F8FAFC'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }} onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent' }}>
            <FontAwesomeIcon icon={faStore} style={{ width: '20px' }} />
            Volver a la Tienda
          </Link>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px',
            background: 'none', border: 'none', color: '#F87171', fontWeight: 500, width: '100%', textAlign: 'left',
            cursor: 'pointer', transition: 'all 0.2s'
          }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
            <FontAwesomeIcon icon={faSignOutAlt} style={{ width: '20px' }} />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{ height: '72px', background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{user?.nombre}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#3B82F6', fontWeight: 700, letterSpacing: '0.5px' }}>ADMINISTRADOR</p>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', border: '2px solid rgba(255,255,255,0.1)' }}></div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
