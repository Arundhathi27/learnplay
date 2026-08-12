import React, { useState } from 'react';

export default function Navbar({ onNavigateHome, onNavigateActivities, currentActivity }) {
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

  return (
    <header className="navbar">
      <div className="navbar-container">
        <a href="#" className="logo" onClick={handleHomeClick}>
          <span className="logo-badge" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 22C8 20 12.5 20.5 16 23C19.5 20.5 24 20 28 22V7C24 5 19.5 5.5 16 8C12.5 5.5 8 5 4 7V22Z" fill="#6366f1" />
              <path d="M16 8V23" stroke="#4338ca" strokeWidth="2" strokeLinecap="round" />
              <path d="M16 2L17.8 5.8L22 6.4L19 9.3L19.7 13.5L16 11.5L12.3 13.5L13 9.3L10 6.4L14.2 5.8L16 2Z" fill="#f59e0b" />
            </svg>
          </span>
          <span className="logo-text">Learn<span className="logo-accent">Play</span></span>
        </a>

        {/* Desktop Navigation */}
        <nav className="nav-links desktop-nav">
          <a
            href="#"
            className={`nav-link ${!currentActivity ? 'active' : ''}`}
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
        </nav>
      )}
    </header>
  );
}
