import React, { useState, useRef } from 'react';

// Data configuration for Find Hotspot questions
export const FIND_HOTSPOT_QUESTIONS = [
  {
    id: 1,
    type: 'find-hotspot',
    title: 'Find the Hotspot',
    question: 'Find the red apple in the kitchen.',
    sceneType: 'kitchen',
    correctHotspot: {
      x: 52,
      y: 38,
      radius: 10
    },
    items: [
      { id: 'apple', emoji: '🍎', name: 'Red Apple', x: 52, y: 38, isCorrect: true },
      { id: 'banana', emoji: '🍌', name: 'Banana', x: 25, y: 65, isCorrect: false },
      { id: 'orange', emoji: '🍊', name: 'Orange', x: 78, y: 60, isCorrect: false },
      { id: 'plate', emoji: '🍽️', name: 'Plate', x: 50, y: 75, isCorrect: false },
      { id: 'glass', emoji: '🥛', name: 'Glass', x: 80, y: 25, isCorrect: false },
      { id: 'pan', emoji: '🍳', name: 'Pan', x: 20, y: 25, isCorrect: false }
    ],
    feedback: {
      correct: '🎉 Great job! You found the red apple!',
      incorrect: 'Not quite. Try again!'
    }
  },
  {
    id: 2,
    type: 'find-hotspot',
    title: 'Find the Hotspot',
    question: 'Find the yellow star on the board.',
    sceneType: 'classroom',
    correctHotspot: {
      x: 30,
      y: 32,
      radius: 10
    },
    items: [
      { id: 'star', emoji: '⭐', name: 'Yellow Star', x: 30, y: 32, isCorrect: true },
      { id: 'pencil', emoji: '✏️', name: 'Pencil', x: 70, y: 28, isCorrect: false },
      { id: 'books', emoji: '📚', name: 'Books', x: 20, y: 75, isCorrect: false },
      { id: 'backpack', emoji: '🎒', name: 'Backpack', x: 80, y: 72, isCorrect: false },
      { id: 'computer', emoji: '💻', name: 'Computer', x: 50, y: 65, isCorrect: false }
    ],
    feedback: {
      correct: '🎉 Awesome! You found the yellow star!',
      incorrect: 'Not quite. Try again!'
    }
  },
  {
    id: 3,
    type: 'find-hotspot',
    title: 'Find the Hotspot',
    question: 'Find the cute rabbit in the park.',
    sceneType: 'park',
    correctHotspot: {
      x: 72,
      y: 48,
      radius: 10
    },
    items: [
      { id: 'rabbit', emoji: '🐰', name: 'Rabbit', x: 72, y: 48, isCorrect: true },
      { id: 'flower', emoji: '🌸', name: 'Flower', x: 25, y: 55, isCorrect: false },
      { id: 'tree', emoji: '🌳', name: 'Tree', x: 20, y: 30, isCorrect: false },
      { id: 'bench', emoji: '🪑', name: 'Bench', x: 50, y: 72, isCorrect: false },
      { id: 'rainbow', emoji: '🌈', name: 'Rainbow', x: 75, y: 18, isCorrect: false }
    ],
    feedback: {
      correct: '🎉 Wonderful! You found the rabbit!',
      incorrect: 'Not quite. Try again!'
    }
  }
];

export default function FindHotspot({ onBack, data }) {
  const activeQuestions = (data?.content?.correctHotspot)
    ? [
        {
          id: 1,
          type: 'find-hotspot',
          title: data.title || 'Find the Hotspot',
          question: data.description || 'Spot and click the target hotspot in the image.',
          sceneType: data.content.image ? '' : 'kitchen',
          image: data.content.image || null,
          correctHotspot: data.content.correctHotspot,
          items: [
            { id: 'target', emoji: '🎯', name: 'Target', x: data.content.correctHotspot.x, y: data.content.correctHotspot.y, isCorrect: true },
            ...(data.content.incorrectHotspots || []).map((inc, i) => ({
              id: inc.id || `inc_${i}`,
              emoji: '📍',
              name: 'Item',
              x: inc.x,
              y: inc.y,
              isCorrect: false
            }))
          ],
          feedback: {
            correct: data.feedback?.correct || '🎉 Great job! You found it!',
            incorrect: data.feedback?.incorrect || 'Not quite. Try again!'
          }
        }
      ]
    : FIND_HOTSPOT_QUESTIONS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [clickMarker, setClickMarker] = useState(null);

  const sceneRef = useRef(null);

  const currentQuestion = activeQuestions[currentIndex] || activeQuestions[0];
  const totalQuestions = activeQuestions.length;
  const maxScore = totalQuestions * 10;

  const handleSceneClick = (e) => {
    if (isCorrect || !sceneRef.current) return;

    const rect = sceneRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const dx = clickX - currentQuestion.correctHotspot.x;
    const dy = clickY - currentQuestion.correctHotspot.y;
    const distance = Math.hypot(dx, dy);
    const isHit = distance <= currentQuestion.correctHotspot.radius;

    if (isHit) {
      setIsCorrect(true);
      setScore((prev) => prev + 10);
      setFeedback({
        type: 'success',
        message: currentQuestion.feedback.correct
      });
      setClickMarker({
        x: currentQuestion.correctHotspot.x,
        y: currentQuestion.correctHotspot.y,
        isSuccess: true
      });
    } else {
      setFeedback({
        type: 'error',
        message: currentQuestion.feedback.incorrect
      });
      setClickMarker({
        x: clickX,
        y: clickY,
        isSuccess: false
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setFeedback(null);
      setIsCorrect(false);
      setClickMarker(null);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePlayAgain = () => {
    setCurrentIndex(0);
    setScore(0);
    setFeedback(null);
    setIsCorrect(false);
    setClickMarker(null);
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
          <div className="result-icon">🎯</div>
          <h1 className="result-title">Great Job!</h1>
          <p className="result-subtitle">You completed Find the Hotspot.</p>

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
            <h1 className="activity-main-title">🎯 Find the Hotspot</h1>
            <p className="activity-instruction">{currentQuestion.question}</p>
          </div>

          <div className="game-stats">
            <div className="stat-pill">
              <span className="stat-label">Question</span>
              <span className="stat-value">{currentIndex + 1} / {totalQuestions}</span>
            </div>
            <div className="stat-pill stat-score">
              <span className="stat-label">Score</span>
              <span className="stat-value">{score}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          ></div>
        </div>

        {/* Scene Container */}
        <div
          ref={sceneRef}
          className={`hotspot-scene-container ${currentQuestion.image ? '' : `scene-${currentQuestion.sceneType}`}`}
          style={currentQuestion.image ? { backgroundImage: `url(${currentQuestion.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          onClick={handleSceneClick}
          tabIndex={0}
          role="button"
          aria-label={`Scene for ${currentQuestion.question}`}
        >
          <div className="scene-watermark-title">{currentQuestion.sceneType}</div>

          {/* Render Scene Items */}
          {currentQuestion.items.map((item) => (
            <div
              key={item.id}
              className={`scene-hotspot-item ${isCorrect && item.isCorrect ? 'found' : ''}`}
              style={{ top: `${item.y}%`, left: `${item.x}%` }}
            >
              <span className="hotspot-emoji">{item.emoji}</span>
              <span className="hotspot-label">{item.name}</span>
              {isCorrect && item.isCorrect && <span className="found-checkmark">✓</span>}
            </div>
          ))}

          {/* Click Marker Effect */}
          {clickMarker && (
            <div
              className={`hotspot-click-marker ${clickMarker.isSuccess ? 'marker-success' : 'marker-fail'}`}
              style={{ top: `${clickMarker.y}%`, left: `${clickMarker.x}%` }}
            >
              <span className="marker-ring"></span>
            </div>
          )}
        </div>

        {/* Feedback Display */}
        {feedback && (
          <div className={`dictation-feedback feedback-${feedback.type}`} role="alert">
            {feedback.message}
          </div>
        )}

        {/* Action Button */}
        {isCorrect && (
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-primary btn-next"
              onClick={handleNextQuestion}
            >
              {currentIndex < totalQuestions - 1 ? 'Next Question ➔' : 'See Results 🏆'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
