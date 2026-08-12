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

  // Fisher-Yates shuffle
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
  const totalPairsGame = 12; // 3 rounds * 4 pairs
  const maxScore = totalPairsGame * 10;

  const matchedInRound = cards.filter((c) => c.isMatched).length / 2;
  const isRoundComplete = matchedInRound === 4;

  const completedPreviousPairs = currentRoundIndex * 4;
  const totalMatchedPairs = completedPreviousPairs + matchedInRound;

  // Initialize cards on round change
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

    // Flip clicked card
    const updatedCards = cards.map((c) =>
      c.id === clickedCard.id ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);

    const newFlipped = [...flippedCards, clickedCard];
    setFlippedCards(newFlipped);

    // If two cards are now flipped, check match
    if (newFlipped.length === 2) {
      const [firstCard, secondCard] = newFlipped;
      setIsChecking(true);

      if (firstCard.pairId === secondCard.pairId) {
        // MATCH!
        setScore((prev) => prev + 10);
        setCards((prev) =>
          prev.map((c) =>
            c.pairId === firstCard.pairId ? { ...c, isMatched: true } : c
          )
        );
        setFeedback({
          type: 'success',
          message: `🎉 Match! "${firstCard.name}" pair found!`
        });
        setFlippedCards([]);
        setIsChecking(false);
      } else {
        // NO MATCH
        setFeedback({
          type: 'error',
          message: '❌ Not a match!'
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
      <div className="activity-container">
        <div className="activity-header">
          <button type="button" className="btn-back" onClick={onBack}>
            ← Back to Activities
          </button>
        </div>

        <div className="memory-card results-card">
          <div className="result-icon">🏆</div>
          <h1 className="result-title">Memory Master!</h1>
          <p className="result-subtitle">You matched all {totalPairsGame} pairs across all 3 rounds!</p>

          <div className="score-summary-box">
            <div className="score-main">
              <span className="score-value">{score}</span>
              <span className="score-max">/ {maxScore}</span>
            </div>
            <div className="score-percentage-badge">
              {percentage}% Accuracy ({totalMatchedPairs} / {totalPairsGame} Pairs)
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

      <div className="memory-card">
        {/* Game Header Bar */}
        <div className="game-header">
          <div className="activity-title-group">
            <h1 className="activity-main-title">🧠 Match the Pairs</h1>
            <p className="activity-instruction">Flip two cards to find matching pairs.</p>
          </div>

          <div className="game-stats">
            <div className="stat-pill">
              <span className="stat-label">Round</span>
              <span className="stat-value">{currentRoundIndex + 1} / {totalRounds}</span>
            </div>
            <div className="stat-pill">
              <span className="stat-label">Matches</span>
              <span className="stat-value">{matchedInRound} / 4</span>
            </div>
            <div className="stat-pill stat-score">
              <span className="stat-label">Score</span>
              <span className="stat-value">{score}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar (Overall Pairs Matched: 12 Total) */}
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${(totalMatchedPairs / totalPairsGame) * 100}%` }}
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
              <p>You matched all 4 pairs in this round!</p>
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

        {/* Cards Grid */}
        <div className="memory-grid">
          {cards.map((card) => {
            const isFlipped = card.isFlipped || card.isMatched;
            const cardLabel = isFlipped ? `${card.name} card` : 'Hidden card';

            return (
              <button
                key={card.id}
                type="button"
                className={`memory-card-item ${isFlipped ? 'flipped' : ''} ${
                  card.isMatched ? 'matched' : ''
                }`}
                onClick={() => handleCardClick(card)}
                disabled={card.isMatched || isChecking}
                aria-label={cardLabel}
              >
                <div className="card-inner">
                  {/* Card Front (Face Down) */}
                  <div className="card-face card-front">
                    <span className="card-question-mark">?</span>
                  </div>

                  {/* Card Back (Face Up) */}
                  <div className="card-face card-back">
                    <span className="card-emoji">{card.emoji}</span>
                    <span className="card-name">{card.name}</span>
                    {card.isMatched && <span className="matched-badge">✅</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
