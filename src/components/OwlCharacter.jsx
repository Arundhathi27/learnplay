import React from 'react';
import owlPngAsset from '../assets/owl.png';

export default function OwlCharacter({
  size = 190,
  className = '',
  alt = 'Vblivestream owl',
  style = {},
  isSpeaking = false
}) {
  return (
    <div
      className={`owl-character-wrapper ${isSpeaking ? 'owl-speaking' : ''} ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        align-items: 'center',
        justify-content: 'center',
        ...style
      }}
    >
      <img
        src={owlPngAsset}
        alt={alt}
        className="owl-dictation-image"
        style={{
          width: typeof size === 'number' ? `${size}px` : size,
          height: 'auto',
          maxHeight: '220px',
          objectFit: 'contain'
        }}
      />
    </div>
  );
}
