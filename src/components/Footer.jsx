import React from 'react';
import ShieldLogo from './ShieldLogo';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <ShieldLogo size={24} />
          <span className="footer-logo-text brand-name"><span className="brand-vb">VB</span><span className="brand-livestream">livestream</span></span>
        </div>
        <p className="footer-text">
          Interactive educational activities designed to make learning fun and engaging for everyone.
        </p>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} VBlivestream. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
