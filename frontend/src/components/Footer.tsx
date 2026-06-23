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
          <h3 className="footer-title">Company</h3>
          <ul className="footer-links">
            <li><Link to="/about">About UAGRM</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/contact">Contact</Link></li>
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
