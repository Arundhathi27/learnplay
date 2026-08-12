import React from 'react';
import heroIllustration from '../assets/learnplay_hero_illustration.jpg';

const HOMEPAGE_ACTIVITIES = [
  {
    id: 'dictation',
    number: '01',
    title: 'Dictation',
    description: 'Listen carefully to spoken words and type what you hear.',
    difficulty: 'Easy',
    accentColor: '#8b5cf6', // Purple
    bgGradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    badgeBg: '#f3e8ff',
    badgeText: '#7e22ce',
    iconGraphic: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="card-custom-svg">
        <rect width="64" height="64" rx="16" fill="rgba(255,255,255,0.15)" />
        <path d="M22 28V36M28 22V42M34 26V38M40 30V34" stroke="white" strokeWidth="4" strokeLinecap="round" />
        <circle cx="20" cy="32" r="6" stroke="white" strokeWidth="3" />
        <circle cx="44" cy="32" r="6" stroke="white" strokeWidth="3" />
      </svg>
    )
  },
  {
    id: 'drag-drop',
    number: '02',
    title: 'Sort & Match',
    description: 'Drag and sort items into the correct categories across 4 rounds.',
    difficulty: 'Easy',
    accentColor: '#3b82f6', // Blue
    bgGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    badgeBg: '#dbeafe',
    badgeText: '#1e40af',
    iconGraphic: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="card-custom-svg">
        <rect width="64" height="64" rx="16" fill="rgba(255,255,255,0.15)" />
        <rect x="18" y="18" width="12" height="12" rx="3" fill="white" fillOpacity="0.9" />
        <rect x="34" y="18" width="12" height="12" rx="3" fill="white" fillOpacity="0.5" />
        <rect x="18" y="34" width="12" height="12" rx="3" fill="white" fillOpacity="0.5" />
        <rect x="34" y="34" width="12" height="12" rx="3" fill="white" fillOpacity="0.9" />
      </svg>
    )
  },
  {
    id: 'multiple-hotspot',
    number: '03',
    title: 'Find Objects',
    description: 'Explore visual scenes to spot and select all hidden target objects.',
    difficulty: 'Medium',
    accentColor: '#f59e0b', // Yellow / Amber
    bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    badgeBg: '#fef3c7',
    badgeText: '#92400e',
    iconGraphic: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="card-custom-svg">
        <rect width="64" height="64" rx="16" fill="rgba(255,255,255,0.15)" />
        <circle cx="30" cy="30" r="12" stroke="white" strokeWidth="4" />
        <path d="M39 39L48 48" stroke="white" strokeWidth="4" strokeLinecap="round" />
        <circle cx="30" cy="30" r="4" fill="white" />
      </svg>
    )
  },
  {
    id: 'memory-game',
    number: '04',
    title: 'Memory Game',
    description: 'Flip cards and test your visual memory to match hidden pairs.',
    difficulty: 'Easy',
    accentColor: '#14b8a6', // Teal
    bgGradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
    badgeBg: '#ccfbf1',
    badgeText: '#115e59',
    iconGraphic: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="card-custom-svg">
        <rect width="64" height="64" rx="16" fill="rgba(255,255,255,0.15)" />
        <rect x="16" y="20" width="14" height="24" rx="3" fill="white" fillOpacity="0.9" />
        <rect x="34" y="20" width="14" height="24" rx="3" stroke="white" strokeWidth="3" fill="none" />
      </svg>
    )
  },
  {
    id: 'word-scramble',
    number: '05',
    title: 'Word Scramble',
    description: 'Click letter tiles in order to unscramble target vocabulary words.',
    difficulty: 'Easy',
    accentColor: '#f97316', // Coral
    bgGradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
    badgeBg: '#ffedd5',
    badgeText: '#9a3412',
    iconGraphic: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="card-custom-svg">
        <rect width="64" height="64" rx="16" fill="rgba(255,255,255,0.15)" />
        <path d="M22 42L32 20L42 42M25 35H39" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
];

export default function Home({ onSelectActivity }) {
  const handleScrollToActivities = (e) => {
    e.preventDefault();
    const section = document.getElementById('activities');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-wrapper" id="top">
      {/* HERO SECTION */}
      <section className="home-hero">
        {/* Subtle Decorative Elements */}
        <div className="hero-deco star-1" aria-hidden="true">✦</div>
        <div className="hero-deco star-2" aria-hidden="true">✦</div>
        <div className="hero-deco circle-1" aria-hidden="true"></div>
        <div className="hero-deco circle-2" aria-hidden="true"></div>

        <div className="home-hero-container">
          {/* Hero Left Content */}
          <div className="home-hero-left">
            <span className="home-hero-tag">INTERACTIVE LEARNING</span>
            <h1 className="home-hero-title">Learn through play.</h1>
            <p className="home-hero-subtitle">
              Practice listening, vocabulary, memory and visual skills with fun interactive activities.
            </p>
            <div className="home-hero-cta-group">
              <button
                type="button"
                className="home-btn-primary"
                onClick={handleScrollToActivities}
              >
                Start Learning →
              </button>
              <span className="home-hero-subtext">5 interactive activities</span>
            </div>
          </div>

          {/* Hero Right Visual */}
          <div className="home-hero-right">
            <div className="hero-illustration-wrapper">
              <img
                src={heroIllustration}
                alt="LearnPlay Interactive Learning Illustration"
                className="home-hero-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ACTIVITY SECTION */}
      <section className="home-activities" id="activities">
        <div className="home-activities-container">
          <div className="home-section-header">
            <h2 className="home-section-title">Choose your activity</h2>
            <p className="home-section-subtitle">Practice, play and improve your skills.</p>
          </div>

          <div className="home-activity-grid">
            {HOMEPAGE_ACTIVITIES.map((activity) => (
              <article key={activity.id} className="home-activity-card">
                {/* Banner Area */}
                <div
                  className="home-card-banner"
                  style={{ background: activity.bgGradient }}
                >
                  <span className="home-card-number">{activity.number}</span>
                  <div className="home-card-icon-box">{activity.iconGraphic}</div>
                </div>

                {/* Body Area */}
                <div className="home-card-body">
                  <div className="home-card-top-meta">
                    <h3 className="home-card-title">{activity.title}</h3>
                    <span
                      className="home-card-difficulty"
                      style={{
                        backgroundColor: activity.badgeBg,
                        color: activity.badgeText
                      }}
                    >
                      {activity.difficulty}
                    </span>
                  </div>

                  <p className="home-card-desc">{activity.description}</p>

                  <button
                    type="button"
                    className="home-card-btn"
                    style={{ '--btn-accent': activity.accentColor }}
                    onClick={() => onSelectActivity(activity.id)}
                  >
                    Start Activity →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ADDITIONAL HOMEPAGE BENEFIT SECTION */}
      <section className="home-features">
        <div className="home-features-container">
          <h2 className="home-features-title">Practice. Play. Improve.</h2>

          <div className="home-features-grid">
            <div className="home-feature-card">
              <div className="feature-icon-box feature-purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="feature-card-title">Interactive Learning</h3>
              <p className="feature-card-desc">Learn by doing.</p>
            </div>

            <div className="home-feature-card">
              <div className="feature-icon-box feature-teal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="feature-card-title">Instant Feedback</h3>
              <p className="feature-card-desc">Know your result immediately.</p>
            </div>

            <div className="home-feature-card">
              <div className="feature-icon-box feature-coral">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3 className="feature-card-title">Learn at Your Pace</h3>
              <p className="feature-card-desc">Practice whenever you're ready.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="home-cta-section">
        <div className="home-cta-box">
          <h2 className="home-cta-title">Ready to start learning?</h2>
          <p className="home-cta-subtitle">Choose an activity and give it a try.</p>
          <button
            type="button"
            className="home-btn-primary home-btn-cta"
            onClick={handleScrollToActivities}
          >
            Explore Activities →
          </button>
        </div>
      </section>
    </div>
  );
}
