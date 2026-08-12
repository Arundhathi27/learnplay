import React, { useState, useEffect } from 'react';
import { getActivities, deleteActivity } from '../services/activityStorage';

export const CREATOR_ACTIVITY_TYPES = [
  {
    type: 'dictation',
    title: 'Dictation',
    icon: '🎧',
    description: 'Create audio listening & spelling activities with spoken words.',
    badgeBg: '#f3e8ff',
    badgeText: '#7e22ce'
  },
  {
    type: 'drag-drop',
    title: 'Sort & Match (Drag & Drop)',
    icon: '🧩',
    description: 'Define categories and items for learners to sort and drop.',
    badgeBg: '#dbeafe',
    badgeText: '#1e40af'
  },
  {
    type: 'find-multiple-hotspot',
    title: 'Find Multiple Hotspots',
    icon: '🔎',
    description: 'Set up visual scenes with multiple clickable target hotspots.',
    badgeBg: '#fef3c7',
    badgeText: '#92400e'
  },
  {
    type: 'find-hotspot',
    title: 'Find Hotspot',
    icon: '🎯',
    description: 'Set up an image scene with a single target location to spot.',
    badgeBg: '#dbeafe',
    badgeText: '#1e40af'
  },
  {
    type: 'memory',
    title: 'Memory Game',
    icon: '🧠',
    description: 'Create matching card pairs to test visual memory.',
    badgeBg: '#ccfbf1',
    badgeText: '#115e59'
  },
  {
    type: 'word-scramble',
    title: 'Word Scramble',
    icon: '🔤',
    description: 'Supply target words for learners to unscramble letter tiles.',
    badgeBg: '#ffedd5',
    badgeText: '#9a3412'
  },
  {
    type: 'flashcards',
    title: 'Flashcards',
    icon: '🎴',
    description: 'Build H5P-style flashcard decks with questions, answers, and input.',
    badgeBg: '#f3e8ff',
    badgeText: '#7e22ce'
  },
  {
    type: 'crossword',
    title: 'Crossword',
    icon: '✏️',
    description: 'Supply clues and words for auto-generated crossword puzzles.',
    badgeBg: '#e0f2fe',
    badgeText: '#0369a1'
  },
  {
    type: 'drag-words',
    title: 'Drag the Words',
    icon: '📝',
    description: 'Write sentences with *word* blanks for learners to fill in.',
    badgeBg: '#ccfbf1',
    badgeText: '#115e59'
  }
];

export default function CreateActivity({ onSelectType, onPlaySaved, onEditSaved, onBack }) {
  const [savedActivities, setSavedActivities] = useState([]);

  useEffect(() => {
    setSavedActivities(getActivities());
  }, []);

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this created activity?')) {
      deleteActivity(id);
      setSavedActivities(getActivities());
    }
  };

  return (
    <div className="creator-container">
      <div className="creator-header">
        <button type="button" className="btn-back" onClick={onBack}>
          ← Back to Home
        </button>

        <div className="creator-title-block">
          <span className="creator-badge">Activity Authoring Platform</span>
          <h1 className="creator-main-title">Create an Interactive Learning Activity</h1>
          <p className="creator-subtitle">
            Choose an activity type below to launch its customized visual editor.
          </p>
        </div>
      </div>

      {/* Grid of 9 Activity Creation Types */}
      <div className="creator-grid">
        {CREATOR_ACTIVITY_TYPES.map((item) => (
          <div
            key={item.type}
            className="creator-card"
            onClick={() => onSelectType(item.type)}
            role="button"
            tabIndex={0}
          >
            <div className="creator-card-header">
              <span className="creator-card-icon">{item.icon}</span>
              <span
                className="creator-card-type-badge"
                style={{ backgroundColor: item.badgeBg, color: item.badgeText }}
              >
                {item.title}
              </span>
            </div>

            <h2 className="creator-card-title">{item.title}</h2>
            <p className="creator-card-desc">{item.description}</p>

            <div className="creator-card-action">
              <span className="action-text">Launch Editor ➔</span>
            </div>
          </div>
        ))}
      </div>

      {/* My Saved Activities Section */}
      <div className="saved-activities-section" style={{ marginTop: '3.5rem' }}>
        <div className="section-title-bar" style={{ marginBottom: '1.5rem' }}>
          <h2 className="creator-main-title" style={{ fontSize: '1.75rem' }}>My Created Activities</h2>
          <p className="creator-subtitle">Activities saved in localStorage ready to play or edit.</p>
        </div>

        {savedActivities.length === 0 ? (
          <div className="empty-saved-box">
            <p>No custom activities created yet. Click any card above to build your first activity!</p>
          </div>
        ) : (
          <div className="saved-activities-grid">
            {savedActivities.map((act) => (
              <div key={act.id} className="saved-activity-card">
                <div className="saved-card-header">
                  <span className="saved-type-badge">{act.type.toUpperCase()}</span>
                  <span className={`status-pill status-${act.status}`}>
                    {act.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>

                <h3 className="saved-title">{act.title}</h3>
                <p className="saved-desc">{act.description}</p>

                <div className="saved-card-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => onPlaySaved(act)}
                  >
                    ▶️ Play Activity
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onEditSaved(act)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => handleDelete(act.id, e)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
