import React from 'react';

export default function Footer({ onNavigateHome, onNavigateActivities }) {
  const handleHome = (e) => {
    e.preventDefault();
    if (onNavigateHome) onNavigateHome();
  };

  const handleActivities = (e) => {
    e.preventDefault();
    if (onNavigateActivities) onNavigateActivities();
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <div className="footer-logo">
            <div className="logo-star-badge small">
              <span className="star-icon">⭐</span>
            </div>
            <span className="logo-wordmark white">
              <span className="logo-learn">Learn</span>
              <span className="logo-play">Play</span>
            </span>
          </div>
          <p className="footer-tagline">Interactive learning made fun.</p>
        </div>

        <nav className="footer-center-nav">
          <a href="#" onClick={handleHome}>Home</a>
          <a href="#activities" onClick={handleActivities}>Activities</a>
        </nav>

        <div className="footer-right-copyright">
          <p>&copy; {new Date().getFullYear()} LearnPlay. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
