import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faUser, faSignOutAlt, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
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
        </div>

        <div className="nav-auth">
          {user ? (
            <div className="user-menu">
              <Link to="/profile" className="btn btn-outline btn-sm">
                <FontAwesomeIcon icon={faUser} />
                Profile
              </Link>
              <button onClick={handleLogout} className="btn btn-primary btn-sm">
                <FontAwesomeIcon icon={faSignOutAlt} />
                Logout
              </button>
            </div>
          ) : (
            <>
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
