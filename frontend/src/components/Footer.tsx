import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore } from '@fortawesome/free-solid-svg-icons';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer glass">
      <div className="container footer-content">
        <div className="footer-brand">
          <div className="brand">
            <FontAwesomeIcon icon={faStore} className="brand-icon" />
            <span className="brand-name">Nexus<span className="text-gradient">App</span></span>
          </div>
          <p className="footer-description">
            The premium academic marketplace for AI-powered digital entrepreneurship.
          </p>
        </div>
        
        <div className="footer-links">
          <div className="link-group">
            <h3>Marketplace</h3>
            <a href="#">All Apps</a>
            <a href="#">Top Rated</a>
            <a href="#">For Startups</a>
            <a href="#">For Retail</a>
          </div>
          <div className="link-group">
            <h3>Resources</h3>
            <a href="#">Documentation</a>
            <a href="#">API Reference</a>
            <a href="#">AI Guidelines</a>
            <a href="#">Blog</a>
          </div>
          <div className="link-group">
            <h3>Company</h3>
            <a href="#">About UAGRM</a>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} NexusApp Marketplace UAGRM. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
