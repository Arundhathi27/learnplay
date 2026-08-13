import React, { useState, useEffect, useRef } from 'react';

// Default data configuration for Flashcards
export const DEFAULT_FLASHCARDS_DATA = {
  id: 'flashcards-1',
  type: 'flashcards',
  title: 'Flashcards',
  description: 'Test your knowledge with interactive study flashcards.',
  settings: {
    requireInput: true,
    caseSensitive: false,
    randomize: true
  },
  cards: [
    {
      id: 'c1',
      question: 'What animal says meow?',
      answer: 'Cat',
      emoji: '🐱',
      altText: 'Cat emoji'
    },
    {
      id: 'c2',
      question: 'What is 2 + 2?',
      answer: '4',
      emoji: '🔢',
      altText: 'Numbers emoji'
    },
    {
      id: 'c3',
      question: 'What color is the sun usually drawn as?',
      answer: 'Yellow',
      emoji: '☀️',
      altText: 'Sun emoji'
    },
    {
      id: 'c4',
      question: 'What is the largest planet in our solar system?',
      answer: 'Jupiter',
      emoji: '🪐',
      altText: 'Planet Jupiter emoji'
    }
  ]
};

// Helper: Fisher-Yates array shuffle
function shuffleArray(array) {
  if (!array || !Array.isArray(array)) return [];
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Flashcards({ onBack, data: propsData }) {
  const data = propsData || DEFAULT_FLASHCARDS_DATA;
  const rawCards = data?.content?.cards || data?.cards || DEFAULT_FLASHCARDS_DATA.cards;
  const activeSettings = data?.settings || DEFAULT_FLASHCARDS_DATA.settings;

  const [cards, setCards] = useState(() => {
    return activeSettings?.randomize ? shuffleArray(rawCards) : [...rawCards];
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [answeredCards, setAnsweredCards] = useState({});
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const inputRef = useRef(null);

  // Initialize cards on load / data change
  useEffect(() => {
    const freshRawCards = data?.content?.cards || data?.cards || DEFAULT_FLASHCARDS_DATA.cards;
    const freshSettings = data?.settings || DEFAULT_FLASHCARDS_DATA.settings;
    const initialCards = freshSettings?.randomize
      ? shuffleArray(freshRawCards)
      : [...freshRawCards];
    setCards(initialCards);
    setCurrentIndex(0);
    setShowAnswer(false);
    setUserAnswer('');
    setFeedback(null);
    setAnsweredCards({});
    setScore(0);
    setIsCompleted(false);
  }, [data]);

  const currentCard = cards[currentIndex] || cards[0] || {};
  const totalCards = cards.length;
  const maxScore = Math.max(totalCards * 10, 10);
  const isCardAnswered = Boolean(answeredCards[currentIndex]);

  // Focus input field when card changes
  useEffect(() => {
    if (activeSettings?.requireInput && !isCompleted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, isCompleted, activeSettings?.requireInput]);

  const handleToggleAnswer = () => {
    setShowAnswer((prev) => !prev);
  };

  const handleCheckAnswer = (e) => {
    e.preventDefault();
    if (!userAnswer.trim() || isCardAnswered) return;

    const inputVal = userAnswer.trim();
    const targetAns = (currentCard.answer || '').trim();
    const acceptedAnswers = targetAns.split('/').map((a) => a.trim()).filter(Boolean);

    let isMatch = false;
    if (activeSettings?.caseSensitive) {
      isMatch = acceptedAnswers.some((ans) => inputVal === ans);
    } else {
      isMatch = acceptedAnswers.some((ans) => inputVal.toLowerCase() === ans.toLowerCase());
    }

    if (isMatch) {
      setScore((prev) => prev + 10);
      setIsCorrectFeedback();
    } else {
      setFeedback({
        type: 'error',
        message: '❌ Not quite right! Try again or reveal answer.'
      });
    }
  };

  const setIsCorrectFeedback = () => {
    setAnsweredCards((prev) => ({ ...prev, [currentIndex]: true }));
    setShowAnswer(true);
    setFeedback({
      type: 'success',
      message: `🎉 Correct! +10`
    });
  };

  const handleNextCard = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowAnswer(false);
      setUserAnswer('');
      setFeedback(null);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowAnswer(false);
      setUserAnswer('');
      setFeedback(null);
    }
  };

  const handlePlayAgain = () => {
    const freshRawCards = data?.content?.cards || data?.cards || DEFAULT_FLASHCARDS_DATA.cards;
    const freshCards = activeSettings?.randomize
      ? shuffleArray(freshRawCards)
      : [...freshRawCards];
    setCards(freshCards);
    setCurrentIndex(0);
    setShowAnswer(false);
    setUserAnswer('');
    setFeedback(null);
    setAnsweredCards({});
    setScore(0);
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

        <div className="flashcard-card results-card">
          <div className="result-icon">🏆</div>
          <h1 className="result-title">Great Job!</h1>
          <p className="result-subtitle">You completed all the Flashcards.</p>

          <div className="score-summary-box">
            <div className="score-main">
              <span className="score-value">{score}</span>
              <span className="score-max">/ {maxScore}</span>
            </div>
            <div className="score-percentage-badge">
              {percentage}% Score
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

      <div className="flashcard-card">
        {/* Header Bar */}
        <div className="game-header">
          <div className="activity-title-group">
            <h1 className="activity-main-title">{data?.title || '🎴 Flashcards'}</h1>
            <p className="activity-instruction">{data?.description || 'Test your knowledge card by card.'}</p>
          </div>

          <div className="game-stats">
            <div className="stat-pill">
              <span className="stat-label">Card</span>
              <span className="stat-value">{currentIndex + 1} / {totalCards}</span>
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
            style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
          ></div>
        </div>

        {/* Flashcard Main Display Stage */}
        <div className="flashcard-stage">
          <div className={`flashcard-item ${showAnswer ? 'flipped' : ''}`}>
            {/* Front Side: Question */}
            <div className="flashcard-face flashcard-front">
              {currentCard.image ? (
                <img
                  src={currentCard.image}
                  alt={currentCard.altText || currentCard.answer || 'Flashcard image'}
                  style={{ maxHeight: '140px', borderRadius: '8px', marginBottom: '0.75rem', objectFit: 'contain' }}
                />
              ) : currentCard.emoji ? (
                <div className="flashcard-emoji" aria-label={currentCard.altText || ''}>
                  {currentCard.emoji}
                </div>
              ) : null}
              <h2 className="flashcard-question-text">{currentCard.question}</h2>

              {showAnswer && (
                <div className="flashcard-answer-reveal">
                  <span className="reveal-label">Answer:</span>
                  <span className="reveal-text">{currentCard.answer}</span>
                </div>
              )}
            </div>
          </div>

          {/* Reveal Answer Button */}
          <div className="flashcard-reveal-section">
            <button
              type="button"
              className="btn btn-secondary btn-reveal-toggle"
              onClick={handleToggleAnswer}
            >
              {showAnswer ? '🙈 Hide Answer' : '👁️ Show Answer'}
            </button>
          </div>
        </div>

        {/* Optional User Input Section */}
        {activeSettings?.requireInput && (
          <form onSubmit={handleCheckAnswer} className="dictation-form">
            <div className="input-group">
              <label htmlFor="flashcard-input" className="sr-only">
                Type your answer
              </label>
              <input
                id="flashcard-input"
                ref={inputRef}
                type="text"
                className={`dictation-input ${feedback ? feedback.type : ''}`}
                placeholder="Type your answer..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={isCardAnswered}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
            </div>

            {/* Feedback Message */}
            {feedback && (
              <div className={`dictation-feedback feedback-${feedback.type}`} role="alert">
                {feedback.message}
              </div>
            )}

            {!isCardAnswered && (
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary btn-check"
                  disabled={!userAnswer.trim()}
                >
                  Check Answer
                </button>
              </div>
            )}
          </form>
        )}

        {/* Navigation Bar (Previous / Next) */}
        <div className="flashcard-nav-bar">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePrevCard}
            disabled={currentIndex === 0}
          >
            ◄ Previous
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleNextCard}
          >
            {currentIndex < totalCards - 1 ? 'Next Card ►' : 'See Results 🏆'}
          </button>
        </div>
      </div>
    </div>
  );
}
