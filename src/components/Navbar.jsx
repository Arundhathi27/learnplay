import React, { useState } from 'react';
import ShieldLogo from './ShieldLogo';

export default function Navbar({ onNavigateHome, onNavigateActivities, onNavigateCreate, currentActivity, currentView }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

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

  const handleCreateClick = (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (onNavigateCreate) onNavigateCreate();
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <a href="#" className="logo" onClick={handleHomeClick}>
          <ShieldLogo size={26} />
          <span className="logo-text brand-name"><span className="brand-vb">VB</span><span className="brand-livestream">livestream</span></span>
        </a>

        {/* Desktop Navigation */}
        <nav className="nav-links desktop-nav">
          <a
            href="#"
            className={`nav-link ${!currentActivity && currentView !== 'create' ? 'active' : ''}`}
            onClick={handleHomeClick}
          >
            Home
          </a>
          <a
            href="#activities"
            className="nav-link"
            onClick={handleActivitiesClick}
          >
            Activities
          </a>
          <a
            href="#create"
            className={`nav-link nav-btn-create ${currentView === 'create' ? 'active' : ''}`}
            onClick={handleCreateClick}
          >
            ➕ Create Activity
          </a>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className={`hamburger-bar ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-bar ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-bar ${isMobileMenuOpen ? 'open' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <nav className="mobile-nav">
          <a href="#" className="mobile-nav-link" onClick={handleHomeClick}>Home</a>
          <a href="#activities" className="mobile-nav-link" onClick={handleActivitiesClick}>Activities</a>
          <a href="#create" className="mobile-nav-link" onClick={handleCreateClick}>➕ Create Activity</a>
        </nav>
      )}
    </header>
  );
}
