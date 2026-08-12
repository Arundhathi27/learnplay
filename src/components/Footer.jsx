import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <span className="footer-logo-icon">🎮</span>
          <span className="footer-logo-text">Learn<span className="logo-accent">Play</span></span>
        </div>
        <p className="footer-text">
          Interactive educational activities designed to make learning fun and engaging for everyone.
        </p>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} LearnPlay. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
