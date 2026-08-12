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

export default function Hotspot({ onBack, data }) {
  const activeScenes = (data?.content?.hotspots && data.content.hotspots.length > 0)
    ? [
        {
          id: 1,
          title: data.title || 'Find Multiple Hotspots',
          instruction: data.description || 'Explore the image and click all correct hotspots.',
          bgClass: data.content.image ? '' : 'scene-classroom',
          image: data.content.image || null,
          requiredCorrect: data.content.requiredCorrect,
          objects: data.content.hotspots.map((h) => ({
            id: `h_${h.id}`,
            name: h.label || (h.isCorrect ? 'Target' : 'Item'),
            emoji: h.isCorrect ? '🎯' : '📍',
            isCorrect: Boolean(h.isCorrect),
            top: `${h.y}%`,
            left: `${h.x}%`,
            feedback: h.feedback
          }))
        }
      ]
    : SCENES;

  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [foundIds, setFoundIds] = useState([]);
  const [shakingId, setShakingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentScene = activeScenes[currentRoundIndex] || activeScenes[0];
  const totalRounds = activeScenes.length;
  const maxScore = 90; // 9 targets total * 10 pts

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
            message: `🎉 All items found in ${currentScene.title}! Great job!`
          });
        } else {
          setFeedback({
            type: 'success',
            message: `🎉 Found it! "${obj.name}" is correct!`
          });
        }
      }
    } else {
      // Incorrect distractor clicked
      setShakingId(obj.id);
      setTimeout(() => setShakingId(null), 500);
      setFeedback({
        type: 'error',
        message: "❌ That's not what we're looking for!"
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
      <div className="activity-container">
        <div className="activity-header">
          <button type="button" className="btn-back" onClick={onBack}>
            ← Back to Activities
          </button>
        </div>

        <div className="hotspot-card results-card">
          <div className="result-icon">🏆</div>
          <h1 className="result-title">Amazing!</h1>
          <p className="result-subtitle">You found all the hidden objects!</p>

          <div className="score-summary-box">
            <div className="score-main">
              <span className="score-value">{score}</span>
              <span className="score-max">/ {maxScore}</span>
            </div>
            <div className="score-percentage-badge">
              {percentage}% Accuracy
            </div>
          </div>

          <div className="result-actions">
            <button type="button" className="btn btn-primary" onClick={handlePlayAgain}>
              🔄 Play Again
            </button>
            <button type="button" className="btn btn-secondary" onClick={onBack}>
              ← Back to Activities
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-container">
      <div className="activity-header">
        <button type="button" className="btn-back" onClick={onBack}>
          ← Back to Activities
        </button>
      </div>

      <div className="hotspot-card">
        {/* Game Header Bar */}
        <div className="game-header">
          <div className="activity-title-group">
            <h1 className="activity-main-title">🔎 Find the Hidden Objects</h1>
            <p className="activity-instruction">
              Scene {currentRoundIndex + 1}: <strong>{currentScene.title}</strong> — {currentScene.instruction}
            </p>
          </div>

          <div className="game-stats">
            <div className="stat-pill">
              <span className="stat-label">Round</span>
              <span className="stat-value">{currentRoundIndex + 1} / {totalRounds}</span>
            </div>
            <div className="stat-pill">
              <span className="stat-label">Found</span>
              <span className="stat-value">{foundIds.length} / {targetCountInRound}</span>
            </div>
            <div className="stat-pill stat-score">
              <span className="stat-label">Score</span>
              <span className="stat-value">{score}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar (Overall Game Progress: 9 total targets) */}
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${(totalFoundCount / 9) * 100}%` }}
          ></div>
        </div>

        {/* Feedback Display */}
        {feedback && (
          <div className={`dictation-feedback feedback-${feedback.type}`} role="alert">
            {feedback.message}
          </div>
        )}

        {/* Round Complete Action Banner */}
        {isRoundComplete && (
          <div className="round-complete-box">
            <div className="round-complete-info">
              <h2>🎉 Round {currentRoundIndex + 1} Complete!</h2>
              <p>You found all 3 targets in the {currentScene.title}!</p>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-next-round"
              onClick={handleNextRound}
            >
              {currentRoundIndex < totalRounds - 1 ? 'Next Round ➔' : 'See Final Results 🏆'}
            </button>
          </div>
        )}

        {/* Interactive Visual Scene Container */}
        <div
          className={`hotspot-scene-container ${currentScene.bgClass}`}
          style={currentScene.image ? { backgroundImage: `url(${currentScene.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          <div className="scene-watermark-title">{currentScene.title}</div>

          {currentScene.objects.map((obj) => {
            const isFound = foundIds.includes(obj.id);
            const isShaking = shakingId === obj.id;

            return (
              <button
                key={obj.id}
                type="button"
                className={`scene-hotspot-item ${isFound ? 'found' : ''} ${
                  isShaking ? 'shake' : ''
                }`}
                style={{ top: obj.top, left: obj.left }}
                onClick={() => handleObjectClick(obj)}
                aria-label={`${obj.name}${isFound ? ' (Found)' : ''}`}
                title={obj.name}
              >
                <span className="hotspot-emoji">{obj.emoji}</span>
                <span className="hotspot-label">{obj.name}</span>
                {isFound && <span className="found-checkmark">✅</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
