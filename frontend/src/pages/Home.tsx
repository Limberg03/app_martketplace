import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faWandMagicSparkles, faCode, faMicrochip, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="bg-glow"></div>
        <div className="bg-glow-accent"></div>
        
        <div className="container hero-content animate-fade-in">
          <div className="badge glass">
            <FontAwesomeIcon icon={faWandMagicSparkles} className="text-gradient" />
            <span>AI-Powered Academic Marketplace</span>
          </div>
          
          <h1 className="hero-title">
            Transform Academic Code into <br />
            <span className="text-gradient">Real-World Solutions</span>
          </h1>
          
          <p className="hero-subtitle">
            The premier platform connecting top university talent with SMEs. 
            Discover robust, AI-vetted software optimized for your business needs.
          </p>
          
          <div className="search-bar glass">
            <FontAwesomeIcon icon={faSearch} className="search-icon" style={{fontSize: '24px'}} />
            <input 
              type="text" 
              placeholder="Describe what you need in plain English... e.g., 'I need a system to manage my pharmacy'" 
              className="search-input"
            />
            <button className="btn btn-primary search-btn">Discover</button>
          </div>
          
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Vetted Apps</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-number">2M+</span>
              <span className="stat-label">Lines of Code</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-number">100%</span>
              <span className="stat-label">AI Documented</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features container" id="features">
        <div className="section-header">
          <h2>Why Choose Nexus<span className="text-gradient">App</span></h2>
          <p>Bridging the gap between academic excellence and commercial necessity.</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card glass-card delay-100 animate-fade-in">
            <div className="feature-icon-wrapper">
              <FontAwesomeIcon icon={faMicrochip} className="feature-icon" style={{fontSize: '28px'}} />
            </div>
            <h3>Semantic Search</h3>
            <p>Our NLP engine understands your business needs. Just describe your problem, and we'll find the perfect software solution.</p>
          </div>
          
          <div className="feature-card glass-card delay-200 animate-fade-in">
            <div className="feature-icon-wrapper">
              <FontAwesomeIcon icon={faCode} className="feature-icon" style={{fontSize: '28px'}} />
            </div>
            <h3>AI Documentation</h3>
            <p>Every project automatically receives AI-generated technical documentation and user manuals, ensuring immediate usability.</p>
          </div>
          
          <div className="feature-card glass-card delay-300 animate-fade-in">
            <div className="feature-icon-wrapper">
              <FontAwesomeIcon icon={faChartLine} className="feature-icon" style={{fontSize: '28px'}} />
            </div>
            <h3>Smart Pricing</h3>
            <p>For developers, our ML algorithms suggest the optimal market price based on codebase complexity and current market trends.</p>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="cta-section container">
        <div className="cta-card glass-card">
          <div className="cta-content">
            <h2>Ready to monetize your project?</h2>
            <p>Join hundreds of students turning their academic requirements into profitable digital assets.</p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary">Start Selling Today</Link>
              <Link to="/login" className="btn btn-outline">Explore Marketplace</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
