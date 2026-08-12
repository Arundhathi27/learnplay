import React, { useState } from 'react';

export default function Navbar({ onNavigateHome, onNavigateActivities, currentActivity }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleHomeClick = (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    onNavigateHome();
  };

  const handleActivitiesClick = (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    onNavigateActivities();
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo Badge & Brand Wordmark */}
        <a href="#" className="brand-logo" onClick={handleHomeClick}>
          <div className="logo-star-badge">
            <span className="star-icon">⭐</span>
          </div>
          <span className="logo-wordmark">
            <span className="logo-learn">Learn</span>
            <span className="logo-play">Play</span>
          </span>
        </a>

        {/* Center Nav Pills */}
        <nav className="desktop-nav">
          <a
            href="#"
            className={`nav-pill-item ${!currentActivity ? 'active-pill' : ''}`}
            onClick={handleHomeClick}
          >
            Home
          </a>
          <a
            href="#activities"
            className="nav-link-item"
            onClick={handleActivitiesClick}
          >
            Activities
          </a>
        </nav>

        {/* Mobile Hamburger Control */}
        <div className="navbar-right-actions">
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <nav className="mobile-nav">
          <a href="#" className="mobile-nav-link" onClick={handleHomeClick}>Home</a>
          <a href="#activities" className="mobile-nav-link" onClick={handleActivitiesClick}>Activities</a>
        </nav>
      )}
    </header>
  );
}
