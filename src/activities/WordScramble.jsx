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

  // Fisher-Yates Shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Ensure shuffled string doesn't match original word initially
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

  // Reset & shuffle tiles when moving to a new word
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

    // Mark tile as used
    setTiles((prev) =>
      prev.map((t) => (t.tileId === tile.tileId ? { ...t, isUsed: true } : t))
    );

    // Add to answer area
    setSelectedTiles((prev) => [...prev, tile]);
  };

  const handleRemoveSelectedTile = (tileToRemove) => {
    if (isCorrect) return;

    // Remove from answer area
    setSelectedTiles((prev) =>
      prev.filter((t) => t.tileId !== tileToRemove.tileId)
    );

    // Make original tile available again
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
        message: `🎉 Correct! You unscrambled "${currentWordObj.word}"!`
      });
    } else {
      setFeedback({
        type: 'error',
        message: '❌ Not quite! Try again.'
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
      <div className="activity-container">
        <div className="activity-header">
          <button type="button" className="btn-back" onClick={onBack}>
            ← Back to Activities
          </button>
        </div>

        <div className="scramble-card results-card">
          <div className="result-icon">🏆</div>
          <h1 className="result-title">Word Master!</h1>
          <p className="result-subtitle">You unscrambled all 8 vocabulary words!</p>

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

  const currentAnswerString = selectedTiles.map((t) => t.char).join('');

  return (
    <div className="activity-container">
      <div className="activity-header">
        <button type="button" className="btn-back" onClick={onBack}>
          ← Back to Activities
        </button>
      </div>

      <div className="scramble-card">
        {/* Game Header Bar */}
        <div className="game-header">
          <div className="activity-title-group">
            <h1 className="activity-main-title">🔤 Unscramble It!</h1>
            <p className="activity-instruction">Arrange the letters to make the correct word.</p>
          </div>

          <div className="game-stats">
            <div className="stat-pill">
              <span className="stat-label">Question</span>
              <span className="stat-value">{currentIndex + 1} / {totalQuestions}</span>
            </div>
            <div className="stat-pill">
              <span className="stat-label">Difficulty</span>
              <span className={`difficulty-tag difficulty-${currentWordObj.difficulty.toLowerCase()}`}>
                {currentWordObj.difficulty}
              </span>
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
            style={{ width: `${((currentIndex + (isCorrect ? 1 : 0)) / totalQuestions) * 100}%` }}
          ></div>
        </div>

        {/* Feedback Display */}
        {feedback && (
          <div className={`dictation-feedback feedback-${feedback.type}`} role="alert">
            {feedback.message}
          </div>
        )}

        {/* Answer Display Area */}
        <div className="answer-section">
          <div className="answer-section-header">
            <span className="answer-section-label">Your Answer:</span>
            {selectedTiles.length > 0 && !isCorrect && (
              <div className="answer-actions">
                <button
                  type="button"
                  className="btn-text-action"
                  onClick={handleRemoveLast}
                >
                  ↩ Remove Last
                </button>
                <button
                  type="button"
                  className="btn-text-action"
                  onClick={handleClearAll}
                >
                  🧹 Clear All
                </button>
              </div>
            )}
          </div>

          <div className={`answer-tiles-box ${isCorrect ? 'answer-correct' : ''}`}>
            {selectedTiles.length === 0 ? (
              <span className="answer-placeholder">Click letter tiles below to build the word</span>
            ) : (
              selectedTiles.map((tile, idx) => (
                <button
                  key={`ans_${tile.tileId}_${idx}`}
                  type="button"
                  className="letter-tile answer-tile"
                  onClick={() => handleRemoveSelectedTile(tile)}
                  disabled={isCorrect}
                  aria-label={`Remove letter ${tile.char}`}
                  title="Click to remove letter"
                >
                  {tile.char}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Available Shuffled Letter Tiles Section */}
        <div className="available-tiles-section">
          <span className="tiles-section-label">Click letters in order:</span>
          <div className="available-tiles-grid">
            {tiles.map((tile) => (
              <button
                key={tile.tileId}
                type="button"
                className={`letter-tile ${tile.isUsed ? 'used' : ''}`}
                onClick={() => handleTileClick(tile)}
                disabled={tile.isUsed || isCorrect}
                aria-label={`Select letter ${tile.char}`}
              >
                {tile.char}
              </button>
            ))}
          </div>
        </div>

        {/* Form Action Controls */}
        <div className="scramble-actions">
          {!isCorrect ? (
            <button
              type="button"
              className="btn btn-primary btn-check"
              onClick={handleCheckAnswer}
              disabled={selectedTiles.length === 0}
            >
              Check Answer
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-next"
              onClick={handleNextQuestion}
            >
              {currentIndex < totalQuestions - 1 ? 'Next Word ➔' : 'See Results 🏆'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
