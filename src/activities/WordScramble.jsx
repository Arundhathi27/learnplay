import React, { useState, useEffect } from 'react';

const WORDS_DATA = [
  { id: 1, word: 'APPLE', difficulty: 'Easy' },
  { id: 2, word: 'TIGER', difficulty: 'Easy' },
  { id: 3, word: 'GARDEN', difficulty: 'Easy' },
  { id: 4, word: 'SCHOOL', difficulty: 'Medium' },
  { id: 5, word: 'RAINBOW', difficulty: 'Medium' },
  { id: 6, word: 'COMPUTER', difficulty: 'Medium' },
  { id: 7, word: 'ELEPHANT', difficulty: 'Hard' },
  { id: 8, word: 'BUTTERFLY', difficulty: 'Hard' }
];

const shuffleWordLetters = (word) => {
  const letters = word.split('');
  let shuffled = [...letters];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  if (shuffled.join('') === word && word.length > 2) {
    return shuffleWordLetters(word);
  }

  return shuffled.map((char, index) => ({
    tileId: `tile_${index}_${char}_${Math.random().toString(36).substring(2, 6)}`,
    char,
    isUsed: false
  }));
};

export default function WordScramble({ onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [tiles, setTiles] = useState(() => shuffleWordLetters(WORDS_DATA[0].word));
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const totalQuestions = WORDS_DATA.length;
  const maxScore = totalQuestions * 10;
  const currentWordObj = WORDS_DATA[currentIndex];

  useEffect(() => {
    if (!isCompleted && currentWordObj) {
      setTiles(shuffleWordLetters(currentWordObj.word));
      setSelectedTiles([]);
      setFeedback(null);
      setIsCorrect(false);
    }
  }, [currentIndex, isCompleted]);

  const handleTileClick = (tile) => {
    if (tile.isUsed || isCorrect) return;

    setTiles((prev) =>
      prev.map((t) => (t.tileId === tile.tileId ? { ...t, isUsed: true } : t))
    );
    setSelectedTiles((prev) => [...prev, tile]);
  };

  const handleRemoveSelectedTile = (tileToRemove) => {
    if (isCorrect) return;

    setSelectedTiles((prev) =>
      prev.filter((t) => t.tileId !== tileToRemove.tileId)
    );
    setTiles((prev) =>
      prev.map((t) => (t.tileId === tileToRemove.tileId ? { ...t, isUsed: false } : t))
    );
  };

  const handleRemoveLast = () => {
    if (selectedTiles.length === 0 || isCorrect) return;
    const lastTile = selectedTiles[selectedTiles.length - 1];
    handleRemoveSelectedTile(lastTile);
  };

  const handleClearAll = () => {
    if (selectedTiles.length === 0 || isCorrect) return;
    setSelectedTiles([]);
    setTiles((prev) => prev.map((t) => ({ ...t, isUsed: false })));
  };

  const handleCheckAnswer = (e) => {
    e.preventDefault();
    if (selectedTiles.length === 0 || isCorrect) return;

    const userAnswer = selectedTiles.map((t) => t.char).join('');

    if (userAnswer === currentWordObj.word) {
      setIsCorrect(true);
      setScore((prev) => prev + 10);
      setFeedback({
        type: 'success',
        message: `🎉 Correct! You unscrambled "${currentWordObj.word}". (+10 pts)`
      });
    } else {
      setFeedback({
        type: 'error',
        message: '❌ Not quite! Check letter order and try again.'
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePlayAgain = () => {
    setCurrentIndex(0);
    setScore(0);
    setTiles(shuffleWordLetters(WORDS_DATA[0].word));
    setSelectedTiles([]);
    setFeedback(null);
    setIsCorrect(false);
    setIsCompleted(false);
  };

  if (isCompleted) {
    const percentage = Math.round((score / maxScore) * 100);

    return (
      <div className="activity-page-wrapper theme-coral">
        <div className="activity-container">
          <button type="button" className="btn-back-pill" onClick={onBack}>
            ← Back to Activities
          </button>

          <div className="game-card results-card">
            <div className="results-badge-icon">🔤</div>
            <h1 className="results-title">Word Scramble Completed!</h1>
            <p className="results-subtitle">Amazing vocabulary skills! You unscrambled all 8 target words.</p>

            <div className="score-summary-banner">
              <div className="score-main-value">{score} <span className="score-max-value">/ {maxScore}</span></div>
              <div className="score-percent-badge">{percentage}% Accuracy</div>
            </div>

            <div className="results-actions-row">
              <button type="button" className="btn btn-activity-action theme-coral" onClick={handlePlayAgain}>
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
    <div className="activity-page-wrapper theme-coral">
      <div className="activity-container">
        <button type="button" className="btn-back-pill" onClick={onBack}>
          ← Back to Activities
        </button>

        <div className="game-card">
          {/* Header */}
          <div className="game-header-bar">
            <div className="game-title-group">
              <span className="game-header-icon">🔤</span>
              <div>
                <h1 className="game-main-title">Word Scramble</h1>
                <p className="game-instruction">Arrange the letters to make the correct word.</p>
              </div>
            </div>

            <div className="game-stats-pills">
              <div className="stat-pill-badge">
                <span className="stat-pill-label">QUESTION</span>
                <span className="stat-pill-value">{currentIndex + 1} / {totalQuestions}</span>
              </div>
              <div className="stat-pill-badge">
                <span className="stat-pill-label">LEVEL</span>
                <span className="stat-pill-value">{currentWordObj.difficulty}</span>
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
              className="progress-bar-fill theme-coral"
              style={{ width: `${((currentIndex + (isCorrect ? 1 : 0)) / totalQuestions) * 100}%` }}
            ></div>
          </div>

          {feedback && (
            <div className={`activity-feedback-banner feedback-${feedback.type}`} role="alert">
              {feedback.message}
            </div>
          )}

          {/* Answer Drop Area */}
          <div className="scramble-answer-container">
            <div className="answer-header-line">
              <span className="area-title">Your Answer:</span>
              {selectedTiles.length > 0 && !isCorrect && (
                <div className="scramble-quick-actions">
                  <button type="button" className="btn-text-link" onClick={handleRemoveLast}>
                    ↩ Remove Last
                  </button>
                  <button type="button" className="btn-text-link" onClick={handleClearAll}>
                    Clear All
                  </button>
                </div>
              )}
            </div>

            <div className={`scramble-answer-display ${isCorrect ? 'answer-success' : ''}`}>
              {selectedTiles.length === 0 ? (
                <span className="empty-answer-hint">Click letter tiles below to form the word</span>
              ) : (
                selectedTiles.map((tile, idx) => (
                  <button
                    key={`ans_${tile.tileId}_${idx}`}
                    type="button"
                    className="scramble-letter-tile answer-tile"
                    onClick={() => handleRemoveSelectedTile(tile)}
                    disabled={isCorrect}
                  >
                    {tile.char}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Available Letters Pool */}
          <div className="scramble-available-pool">
            <span className="pool-heading">Click letters in order:</span>
            <div className="scramble-letters-grid">
              {tiles.map((tile) => (
                <button
                  key={tile.tileId}
                  type="button"
                  className={`scramble-letter-tile ${tile.isUsed ? 'used-tile' : ''}`}
                  onClick={() => handleTileClick(tile)}
                  disabled={tile.isUsed || isCorrect}
                >
                  {tile.char}
                </button>
              ))}
            </div>
          </div>

          <div className="form-action-row">
            {!isCorrect ? (
              <button
                type="button"
                className="btn btn-activity-action theme-coral"
                onClick={handleCheckAnswer}
                disabled={selectedTiles.length === 0}
              >
                Check Answer
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-activity-action theme-coral"
                onClick={handleNextQuestion}
              >
                {currentIndex < totalQuestions - 1 ? 'Next Word →' : 'See Results'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
