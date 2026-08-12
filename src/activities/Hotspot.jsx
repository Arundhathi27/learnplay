import React, { useState } from 'react';

const SCENES = [
  {
    id: 1,
    title: 'Classroom',
    instruction: 'Find all the things used for writing.',
    bgClass: 'scene-classroom',
    objects: [
      { id: 'pencil', name: 'Pencil', emoji: '✏️', isCorrect: true, top: '22%', left: '18%' },
      { id: 'pen', name: 'Pen', emoji: '🖊️', isCorrect: true, top: '62%', left: '72%' },
      { id: 'crayon', name: 'Crayon', emoji: '🖍️', isCorrect: true, top: '32%', left: '80%' },
      { id: 'books', name: 'Books', emoji: '📚', isCorrect: false, top: '20%', left: '52%' },
      { id: 'backpack', name: 'Backpack', emoji: '🎒', isCorrect: false, top: '68%', left: '15%' },
      { id: 'computer', name: 'Computer', emoji: '💻', isCorrect: false, top: '42%', left: '42%' },
      { id: 'chair', name: 'Chair', emoji: '🪑', isCorrect: false, top: '68%', left: '45%' }
    ]
  },
  {
    id: 2,
    title: 'Kitchen',
    instruction: 'Find all the fruits.',
    bgClass: 'scene-kitchen',
    objects: [
      { id: 'apple', name: 'Apple', emoji: '🍎', isCorrect: true, top: '28%', left: '22%' },
      { id: 'banana', name: 'Banana', emoji: '🍌', isCorrect: true, top: '62%', left: '44%' },
      { id: 'orange', name: 'Orange', emoji: '🍊', isCorrect: true, top: '38%', left: '76%' },
      { id: 'plate', name: 'Plate', emoji: '🍽️', isCorrect: false, top: '64%', left: '16%' },
      { id: 'spoon', name: 'Spoon', emoji: '🥄', isCorrect: false, top: '22%', left: '58%' },
      { id: 'glass', name: 'Glass', emoji: '🥛', isCorrect: false, top: '34%', left: '42%' },
      { id: 'pan', name: 'Pan', emoji: '🍳', isCorrect: false, top: '68%', left: '74%' }
    ]
  },
  {
    id: 3,
    title: 'Park',
    instruction: 'Find all the animals.',
    bgClass: 'scene-park',
    objects: [
      { id: 'dog', name: 'Dog', emoji: '🐶', isCorrect: true, top: '66%', left: '22%' },
      { id: 'bird', name: 'Bird', emoji: '🐦', isCorrect: true, top: '20%', left: '62%' },
      { id: 'butterfly', name: 'Butterfly', emoji: '🦋', isCorrect: true, top: '32%', left: '15%' },
      { id: 'tree', name: 'Tree', emoji: '🌳', isCorrect: false, top: '32%', left: '78%' },
      { id: 'flower', name: 'Flower', emoji: '🌸', isCorrect: false, top: '68%', left: '58%' },
      { id: 'bench', name: 'Bench', emoji: '🪑', isCorrect: false, top: '62%', left: '42%' },
      { id: 'sun', name: 'Sun', emoji: '☀️', isCorrect: false, top: '15%', left: '18%' }
    ]
  }
];

export default function Hotspot({ onBack }) {
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [foundIds, setFoundIds] = useState([]);
  const [shakingId, setShakingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentScene = SCENES[currentRoundIndex];
  const totalRounds = SCENES.length;
  const maxScore = 90;

  const targetCountInRound = currentScene.objects.filter((o) => o.isCorrect).length;
  const isRoundComplete = foundIds.length === targetCountInRound;
  const totalFoundCount = currentRoundIndex * 3 + foundIds.length;

  const handleObjectClick = (obj) => {
    if (obj.isCorrect) {
      if (!foundIds.includes(obj.id)) {
        const updated = [...foundIds, obj.id];
        setFoundIds(updated);
        setScore((prev) => prev + 10);

        if (updated.length === targetCountInRound) {
          setFeedback({
            type: 'success',
            message: `🎉 Great observation! You found all items in the ${currentScene.title}!`
          });
        } else {
          setFeedback({
            type: 'success',
            message: `🎉 Correct! "${obj.name}" is a target object! (+10 pts)`
          });
        }
      }
    } else {
      setShakingId(obj.id);
      setTimeout(() => setShakingId(null), 500);
      setFeedback({
        type: 'error',
        message: "❌ That's not what we're looking for! Keep searching."
      });
    }
  };

  const handleNextRound = () => {
    if (currentRoundIndex < totalRounds - 1) {
      setCurrentRoundIndex((prev) => prev + 1);
      setFoundIds([]);
      setFeedback(null);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePlayAgain = () => {
    setCurrentRoundIndex(0);
    setScore(0);
    setFoundIds([]);
    setFeedback(null);
    setShakingId(null);
    setIsCompleted(false);
  };

  if (isCompleted) {
    const percentage = Math.round((score / maxScore) * 100);

    return (
      <div className="activity-page-wrapper theme-amber">
        <div className="activity-container">
          <button type="button" className="btn-back-pill" onClick={onBack}>
            ← Back to Activities
          </button>

          <div className="game-card results-card">
            <div className="results-badge-icon">🔎</div>
            <h1 className="results-title">Find the Objects Completed!</h1>
            <p className="results-subtitle">Super visual skills! You found all hidden target objects.</p>

            <div className="score-summary-banner">
              <div className="score-main-value">{score} <span className="score-max-value">/ {maxScore}</span></div>
              <div className="score-percent-badge">{percentage}% Accuracy</div>
            </div>

            <div className="results-actions-row">
              <button type="button" className="btn btn-activity-action theme-amber" onClick={handlePlayAgain}>
                Play Again 🔄
              </button>
              <button type="button" className="btn btn-secondary-action" onClick={onBack}>
                Back to Activities
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-page-wrapper theme-amber">
      <div className="activity-container">
        <button type="button" className="btn-back-pill" onClick={onBack}>
          ← Back to Activities
        </button>

        <div className="game-card">
          {/* Header */}
          <div className="game-header-bar">
            <div className="game-title-group">
              <span className="game-header-icon">🔎</span>
              <div>
                <h1 className="game-main-title">Find the Objects</h1>
                <p className="game-instruction">
                  Scene {currentRoundIndex + 1}: <strong>{currentScene.title}</strong> — {currentScene.instruction}
                </p>
              </div>
            </div>

            <div className="game-stats-pills">
              <div className="stat-pill-badge">
                <span className="stat-pill-label">SCENE</span>
                <span className="stat-pill-value">{currentRoundIndex + 1} / {totalRounds}</span>
              </div>
              <div className="stat-pill-badge">
                <span className="stat-pill-label">FOUND</span>
                <span className="stat-pill-value">{foundIds.length} / {targetCountInRound}</span>
              </div>
              <div className="stat-pill-badge stat-score">
                <span className="stat-pill-label">SCORE</span>
                <span className="stat-pill-value">{score}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill theme-amber"
              style={{ width: `${(totalFoundCount / 9) * 100}%` }}
            ></div>
          </div>

          {feedback && (
            <div className={`activity-feedback-banner feedback-${feedback.type}`} role="alert">
              {feedback.message}
            </div>
          )}

          {isRoundComplete && (
            <div className="round-complete-banner theme-amber">
              <div>
                <h2 className="banner-title">Scene {currentRoundIndex + 1} Complete!</h2>
                <p className="banner-subtitle">You found all 3 target objects in the {currentScene.title}!</p>
              </div>
              <button type="button" className="btn btn-activity-action theme-amber" onClick={handleNextRound}>
                {currentRoundIndex < totalRounds - 1 ? 'Next Scene →' : 'See Results'}
              </button>
            </div>
          )}

          {/* Interactive Scene Area */}
          <div className={`hotspot-scene-frame ${currentScene.bgClass}`}>
            <span className="scene-watermark">{currentScene.title}</span>

            {currentScene.objects.map((obj) => {
              const isFound = foundIds.includes(obj.id);
              const isShaking = shakingId === obj.id;

              return (
                <button
                  key={obj.id}
                  type="button"
                  className={`hotspot-badge-btn ${isFound ? 'found-target' : ''} ${
                    isShaking ? 'shake-distractor' : ''
                  }`}
                  style={{ top: obj.top, left: obj.left }}
                  onClick={() => handleObjectClick(obj)}
                  aria-label={`${obj.name}${isFound ? ' (Found)' : ''}`}
                >
                  <span className="badge-emoji">{obj.emoji}</span>
                  <span className="badge-label">{obj.name}</span>
                  {isFound && <span className="badge-check">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
