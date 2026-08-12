import React, { useState, useEffect } from 'react';

const ROUNDS_DATA = [
  {
    roundNumber: 1,
    pairs: [
      { pairId: 'apple', name: 'Apple', emoji: '🍎' },
      { pairId: 'banana', name: 'Banana', emoji: '🍌' },
      { pairId: 'dog', name: 'Dog', emoji: '🐶' },
      { pairId: 'cat', name: 'Cat', emoji: '🐱' }
    ]
  },
  {
    roundNumber: 2,
    pairs: [
      { pairId: 'rabbit', name: 'Rabbit', emoji: '🐰' },
      { pairId: 'elephant', name: 'Elephant', emoji: '🐘' },
      { pairId: 'orange', name: 'Orange', emoji: '🍊' },
      { pairId: 'mango', name: 'Mango', emoji: '🥭' }
    ]
  },
  {
    roundNumber: 3,
    pairs: [
      { pairId: 'flower', name: 'Flower', emoji: '🌸' },
      { pairId: 'tree', name: 'Tree', emoji: '🌳' },
      { pairId: 'star', name: 'Star', emoji: '⭐' },
      { pairId: 'rainbow', name: 'Rainbow', emoji: '🌈' }
    ]
  }
];

const createShuffledCards = (roundIndex) => {
  const roundPairs = ROUNDS_DATA[roundIndex].pairs;
  const cardDeck = [];

  roundPairs.forEach((pair) => {
    cardDeck.push({
      id: `card_${roundIndex}_${pair.pairId}_1`,
      pairId: pair.pairId,
      name: pair.name,
      emoji: pair.emoji,
      isFlipped: false,
      isMatched: false
    });
    cardDeck.push({
      id: `card_${roundIndex}_${pair.pairId}_2`,
      pairId: pair.pairId,
      name: pair.name,
      emoji: pair.emoji,
      isFlipped: false,
      isMatched: false
    });
  });

  for (let i = cardDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cardDeck[i], cardDeck[j]] = [cardDeck[j], cardDeck[i]];
  }

  return cardDeck;
};

export default function MemoryGame({ onBack }) {
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [cards, setCards] = useState(() => createShuffledCards(0));
  const [flippedCards, setFlippedCards] = useState([]);
  const [score, setScore] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const totalRounds = ROUNDS_DATA.length;
  const totalPairsGame = 12;
  const maxScore = totalPairsGame * 10;

  const matchedInRound = cards.filter((c) => c.isMatched).length / 2;
  const isRoundComplete = matchedInRound === 4;

  const completedPreviousPairs = currentRoundIndex * 4;
  const totalMatchedPairs = completedPreviousPairs + matchedInRound;

  useEffect(() => {
    setCards(createShuffledCards(currentRoundIndex));
    setFlippedCards([]);
    setIsChecking(false);
    setFeedback(null);
  }, [currentRoundIndex]);

  const handleCardClick = (clickedCard) => {
    if (
      isChecking ||
      clickedCard.isFlipped ||
      clickedCard.isMatched ||
      flippedCards.length >= 2
    ) {
      return;
    }

    const updatedCards = cards.map((c) =>
      c.id === clickedCard.id ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);

    const newFlipped = [...flippedCards, clickedCard];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [firstCard, secondCard] = newFlipped;
      setIsChecking(true);

      if (firstCard.pairId === secondCard.pairId) {
        setScore((prev) => prev + 10);
        setCards((prev) =>
          prev.map((c) =>
            c.pairId === firstCard.pairId ? { ...c, isMatched: true } : c
          )
        );
        setFeedback({
          type: 'success',
          message: `🎉 Match found! "${firstCard.name}" pair! (+10 pts)`
        });
        setFlippedCards([]);
        setIsChecking(false);
      } else {
        setFeedback({
          type: 'error',
          message: '❌ Not a match! Try to remember where they were.'
        });

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstCard.id || c.id === secondCard.id
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
          setIsChecking(false);
        }, 800);
      }
    }
  };

  const handleNextRound = () => {
    if (currentRoundIndex < totalRounds - 1) {
      setCurrentRoundIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePlayAgain = () => {
    setCurrentRoundIndex(0);
    setCards(createShuffledCards(0));
    setFlippedCards([]);
    setScore(0);
    setIsChecking(false);
    setFeedback(null);
    setIsCompleted(false);
  };

  if (isCompleted) {
    const percentage = Math.round((score / maxScore) * 100);

    return (
      <div className="activity-page-wrapper theme-teal">
        <div className="activity-container">
          <button type="button" className="btn-back-pill" onClick={onBack}>
            ← Back to Activities
          </button>

          <div className="game-card results-card">
            <div className="results-badge-icon">🧠</div>
            <h1 className="results-title">Memory Match Completed!</h1>
            <p className="results-subtitle">Fantastic memory! You matched all 12 pairs across 3 rounds.</p>

            <div className="score-summary-banner">
              <div className="score-main-value">{score} <span className="score-max-value">/ {maxScore}</span></div>
              <div className="score-percent-badge">{percentage}% Accuracy</div>
            </div>

            <div className="results-actions-row">
              <button type="button" className="btn btn-activity-action theme-teal" onClick={handlePlayAgain}>
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
    <div className="activity-page-wrapper theme-teal">
      <div className="activity-container">
        <button type="button" className="btn-back-pill" onClick={onBack}>
          ← Back to Activities
        </button>

        <div className="game-card">
          {/* Header */}
          <div className="game-header-bar">
            <div className="game-title-group">
              <span className="game-header-icon">🧠</span>
              <div>
                <h1 className="game-main-title">Memory Match</h1>
                <p className="game-instruction">Flip cards and find matching pairs.</p>
              </div>
            </div>

            <div className="game-stats-pills">
              <div className="stat-pill-badge">
                <span className="stat-pill-label">ROUND</span>
                <span className="stat-pill-value">{currentRoundIndex + 1} / {totalRounds}</span>
              </div>
              <div className="stat-pill-badge">
                <span className="stat-pill-label">MATCHES</span>
                <span className="stat-pill-value">{matchedInRound} / 4</span>
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
              className="progress-bar-fill theme-teal"
              style={{ width: `${(totalMatchedPairs / totalPairsGame) * 100}%` }}
            ></div>
          </div>

          {feedback && (
            <div className={`activity-feedback-banner feedback-${feedback.type}`} role="alert">
              {feedback.message}
            </div>
          )}

          {isRoundComplete && (
            <div className="round-complete-banner theme-teal">
              <div>
                <h2 className="banner-title">Round {currentRoundIndex + 1} Complete!</h2>
                <p className="banner-subtitle">You matched all 4 pairs for this round!</p>
              </div>
              <button type="button" className="btn btn-activity-action theme-teal" onClick={handleNextRound}>
                {currentRoundIndex < totalRounds - 1 ? 'Next Round →' : 'See Results'}
              </button>
            </div>
          )}

          {/* 3D Cards Grid */}
          <div className="memory-board-grid">
            {cards.map((card) => {
              const isFlipped = card.isFlipped || card.isMatched;

              return (
                <button
                  key={card.id}
                  type="button"
                  className={`memory-card-box ${isFlipped ? 'flipped' : ''} ${
                    card.isMatched ? 'matched' : ''
                  }`}
                  onClick={() => handleCardClick(card)}
                  disabled={card.isMatched || isChecking}
                  aria-label={isFlipped ? `${card.name} card` : 'Hidden memory card'}
                >
                  <div className="card-flipper">
                    <div className="card-face-front">
                      <span className="front-question">?</span>
                    </div>
                    <div className="card-face-back">
                      <span className="back-emoji-display">{card.emoji}</span>
                      <span className="back-name-display">{card.name}</span>
                      {card.isMatched && <span className="matched-check-badge">✓</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
