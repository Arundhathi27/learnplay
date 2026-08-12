import React from 'react';

export default function ShieldLogo({ size = 26, className = '' }) {
  const height = Math.round(size * (40 / 36));

  return (
    <span className={`logo-shield-badge ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 36 40"
        width={size}
        height={height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shield-logo-svg"
      >
        {/* Shield Outer Body in Professional Blue */}
        <path
          d="M18 2.5L32 8V19C32 28 24.5 34.5 18 37.5C11.5 34.5 4 28 4 19V8L18 2.5Z"
          fill="#2563EB"
          stroke="#1D4ED8"
          strokeWidth="1.5"
        />
        {/* Shield Subtle Contrast Right Half */}
        <path
          d="M18 2.5L32 8V19C32 28 24.5 34.5 18 37.5V2.5Z"
          fill="#1D4ED8"
          fillOpacity="0.25"
        />
        {/* Abstract V-Open-Book Educational Emblem inside Shield */}
        <path
          d="M18 11.5L10 16V22.5L18 18.5L26 22.5V16L18 11.5Z"
          fill="#FFFFFF"
        />
        <path
          d="M18 18.5V26.5"
          stroke="#0F172A"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M12.5 10.5L18 14.5L23.5 10.5"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
