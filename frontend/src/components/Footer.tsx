import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css'; // O usar CSS in JS / clases Tailwind si prefieres

const Footer: React.FC = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        
        {/* Columna 1 */}
        <div className="footer-column">
          <h3 className="footer-title">Marketplace</h3>
          <ul className="footer-links">
            <li><Link to="/marketplace">All Apps</Link></li>
            <li><Link to="/marketplace?sort=top">Top Rated</Link></li>
            <li><Link to="/marketplace?category=startups">For Startups</Link></li>
            <li><Link to="/marketplace?category=retail">For Retail</Link></li>
          </ul>
        </div>

        {/* Columna 2 */}
        <div className="footer-column">
          <h3 className="footer-title">Resources</h3>
          <ul className="footer-links">
            <li><Link to="/guide">Documentation</Link></li>
            <li><Link to="/api-reference">API Reference</Link></li>
            <li><Link to="/ai-guidelines">AI Guidelines</Link></li>
            <li><Link to="/blog">Blog</Link></li>
          </ul>
        </div>

        {/* Columna 3 */}
        <div className="footer-column">
            <h4 style={{ color: '#f8fafc', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Company</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><Link to="/about" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>About UAGRM</Link></li>
              <li><Link to="/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>Terms of Service</Link></li>
              <li><Link to="/privacy" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>Privacy Policy</Link></li>
              <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>Contact</a></li>
            </ul>
          </div>

      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} NexusApp Marketplace U.A.G.R.M. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
