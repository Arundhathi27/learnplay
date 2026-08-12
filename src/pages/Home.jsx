import React from 'react';
import { ACTIVITIES } from '../data/activities';
import heroIllustration from '../assets/learnplay_hero_illustration.jpg';

function ActivityCardIcon({ id, color }) {
  switch (id) {
    case 'dictation':
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"></path>
          <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
        </svg>
      );
    case 'drag-drop':
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="2"></rect>
          <rect x="14" y="3" width="7" height="7" rx="2"></rect>
          <rect x="14" y="14" width="7" height="7" rx="2"></rect>
          <rect x="3" y="14" width="7" height="7" rx="2"></rect>
        </svg>
      );
    case 'multiple-hotspot':
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"></circle>
          <circle cx="12" cy="12" r="3"></circle>
          <line x1="12" y1="1" x2="12" y2="5"></line>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="1" y1="12" x2="5" y2="12"></line>
          <line x1="19" y1="12" x2="23" y2="12"></line>
        </svg>
      );
    case 'memory-game':
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="12" height="15" rx="2"></rect>
          <path d="M9 3h12a2 2 0 0 1 2 2v14"></path>
          <polygon points="9 9 11 12 13 9 9 9" fill={color}></polygon>
        </svg>
      );
    case 'word-scramble':
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7h6M7 4v6"></path>
          <path d="M14 18h6M17 15v6"></path>
          <circle cx="17" cy="7" r="3"></circle>
          <rect x="4" y="15" width="5" height="5" rx="1"></rect>
        </svg>
      );
    default:
      return null;
  }
}

export default function Home({ onSelectActivity }) {
  const handleStartLearning = (e) => {
    e.preventDefault();
    const section = document.getElementById('activities');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-page" id="top">
      {/* Hero Section */}
      <section className="hero-section">
        {/* Floating Sparkles & Stars */}
        <div className="hero-sparkles-layer" aria-hidden="true">
          <span className="sparkle sparkle-1">✦</span>
          <span className="sparkle sparkle-2">⭐</span>
          <span className="sparkle sparkle-3">✨</span>
          <span className="sparkle sparkle-4">✦</span>
        </div>

        <div className="hero-container">
          {/* Left Hero Content */}
          <div className="hero-content">
            <span className="hero-badge-pill">INTERACTIVE LEARNING</span>
            <h1 className="hero-heading">
              Learn through <span className="highlight-yellow">play.</span>
            </h1>
            <p className="hero-subtitle">
              Practice listening, vocabulary, memory and visual skills with fun interactive activities.
            </p>

            <div className="hero-cta-group">
              <button
                type="button"
                className="btn btn-hero-yellow"
                onClick={handleStartLearning}
              >
                Start Learning →
              </button>
              <div className="hero-subbadge">
                <span className="star-icon">⭐</span>
                <span>5 interactive activities</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Platform Hero Artwork */}
          <div className="hero-artwork-column">
            <div className="hero-artwork-wrapper">
              <img
                src={heroIllustration}
                alt="3D LearnPlay educational objects platform"
                className="hero-3d-image"
              />
            </div>
          </div>
        </div>

        {/* Curved Wave Divider Bottom */}
        <div className="hero-wave-divider" aria-hidden="true">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path
              d="M0,32L60,42.7C120,53,240,75,360,80C480,85,600,75,720,58.7C840,43,960,21,1080,21.3C1200,21,1320,43,1380,53.3L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"
              fill="#ffffff"
            ></path>
          </svg>
        </div>
      </section>

      {/* Activity Section */}
      <section className="activities-section" id="activities">
        <div className="activities-container">
          <div className="section-header text-center">
            <div className="section-dots-badge">
              <span className="dot dot-amber">•</span>
              <span className="dot dot-amber">•</span>
              <span className="dot dot-amber">•</span>
              <span className="badge-text">ACTIVITIES</span>
              <span className="dot dot-amber">•</span>
              <span className="dot dot-amber">•</span>
              <span className="dot dot-amber">•</span>
            </div>
            <h2 className="section-title">Choose your activity</h2>
            <p className="section-subtitle">Practice, play and improve your skills.</p>
          </div>

          {/* 5 Activity Cards Layout */}
          <div className="activities-5col-grid">
            {ACTIVITIES.map((activity) => (
              <article
                key={activity.id}
                className={`template-activity-card theme-${activity.theme}`}
                onClick={() => onSelectActivity(activity.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectActivity(activity.id);
                  }
                }}
              >
                <div className="card-top-row">
                  <div
                    className="card-icon-box"
                    style={{ backgroundColor: activity.bgColor }}
                  >
                    <ActivityCardIcon id={activity.id} color={activity.accentColor} />
                  </div>
                  <span
                    className="card-num-text"
                    style={{ color: activity.accentColor }}
                  >
                    {activity.number}
                  </span>
                </div>

                <div className="card-body-content">
                  <h3 className="card-title-text">{activity.title}</h3>
                  <p className="card-desc-text">{activity.description}</p>
                </div>

                <div className="card-footer-box">
                  <span
                    className="difficulty-pill-badge"
                    style={{
                      backgroundColor: activity.bgColor,
                      color: activity.accentColor
                    }}
                  >
                    {activity.difficulty}
                  </span>
                  <button
                    type="button"
                    className="btn-outline-start"
                    style={{
                      borderColor: activity.accentColor,
                      color: activity.accentColor
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectActivity(activity.id);
                    }}
                  >
                    Start →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Section ("Practice. Play. Improve.") */}
      <section className="features-section" id="features">
        <div className="features-white-bar">
          {/* Subtle Dot Matrix Decoration Left */}
          <div className="dot-matrix-dec left-matrix" aria-hidden="true"></div>

          <div className="features-3col-grid">
            <div className="feature-item">
              <div className="feature-circle-icon purple-circle">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="6" y1="12" x2="10" y2="12"></line>
                  <line x1="8" y1="10" x2="8" y2="14"></line>
                  <circle cx="15" cy="11" r="1" fill="#ffffff"></circle>
                  <circle cx="17" cy="13" r="1" fill="#ffffff"></circle>
                  <path d="M17.5 7H6.5C4.01 7 2 9.01 2 11.5v3C2 16.99 4.01 19 6.5 19h11c2.49 0 4.5-2.01 4.5-4.5v-3C22 9.01 19.99 7 17.5 7z"></path>
                </svg>
              </div>
              <div className="feature-text-block">
                <h3 className="feature-item-title">Interactive</h3>
                <p className="feature-item-desc">Learn by doing, not just reading.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-circle-icon blue-circle">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <div className="feature-text-block">
                <h3 className="feature-item-title">Instant Feedback</h3>
                <p className="feature-item-desc">Know your result immediately.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-circle-icon yellow-circle">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.71 1.26-1.5 1.5-2.5l-4.5-4.5c-1 .24-1.79.79-2.5 1.5z"></path>
                  <path d="M12 15l-3-3 8.5-8.5c1.1-1.1 2.9-1.1 4 0s1.1 2.9 0 4L12 15z"></path>
                </svg>
              </div>
              <div className="feature-text-block">
                <h3 className="feature-item-title">Self Paced</h3>
                <p className="feature-item-desc">Practice whenever you're ready.</p>
              </div>
            </div>
          </div>

          {/* Subtle Dot Matrix Decoration Right */}
          <div className="dot-matrix-dec right-matrix" aria-hidden="true"></div>
        </div>
      </section>
    </div>
  );
}
