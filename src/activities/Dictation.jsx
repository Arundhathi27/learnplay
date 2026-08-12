import React, { useState, useEffect, useRef } from 'react';

const WORDS = [
  { id: 1, word: 'Apple' },
  { id: 2, word: 'Dog' },
  { id: 3, word: 'Garden' },
  { id: 4, word: 'Computer' },
  { id: 5, word: 'Elephant' },
  { id: 6, word: 'Butterfly' },
  { id: 7, word: 'Rainbow' },
  { id: 8, word: 'Beautiful' }
];

export default function Dictation({ onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasSpokenCurrent, setHasSpokenCurrent] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [voices, setVoices] = useState([]);

  const inputRef = useRef(null);

  const currentItem = WORDS[currentIndex];
  const totalQuestions = WORDS.length;
  const maxScore = totalQuestions * 10;

  // Asynchronously load speech synthesis voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const updateVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };
      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }
  }, []);

  const getBestEnglishVoice = () => {
    if (!('speechSynthesis' in window)) return null;

    const availableVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
    if (!availableVoices || availableVoices.length === 0) return null;

    const englishVoices = availableVoices.filter(
      (v) => v.lang && (v.lang.toLowerCase().startsWith('en') || v.lang.toLowerCase().includes('en'))
    );

    const voiceList = englishVoices.length > 0 ? englishVoices : availableVoices;

    const preferredKeywords = [
      'google us english',
      'google uk english',
      'google',
      'microsoft',
      'samantha',
      'alex',
      'natural',
      'online'
    ];

    for (const keyword of preferredKeywords) {
      const match = voiceList.find((v) => v.name.toLowerCase().includes(keyword));
      if (match) return match;
    }

    const defaultVoice = voiceList.find((v) => v.default);
    return defaultVoice || voiceList[0] || null;
  };

  const speakWord = (text) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.75;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const selectedVoice = getBestEnglishVoice();
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setHasSpokenCurrent(true);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setHasSpokenCurrent(true);
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!isCompleted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, isCompleted]);

  const handleCheckAnswer = (e) => {
    e.preventDefault();
    if (!userAnswer.trim() || isCorrect) return;

    const trimmedInput = userAnswer.trim().toLowerCase();
    const targetWord = currentItem.word.toLowerCase();

    if (trimmedInput === targetWord) {
      setIsCorrect(true);
      setScore((prev) => prev + 10);
      setFeedback({
        type: 'success',
        message: `🎉 Correct! "${currentItem.word}" is right.`
      });
    } else {
      setFeedback({
        type: 'error',
        message: '❌ Try again! Listen closely and re-type.'
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer('');
      setFeedback(null);
      setIsCorrect(false);
      setHasSpokenCurrent(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePlayAgain = () => {
    setCurrentIndex(0);
    setScore(0);
    setUserAnswer('');
    setFeedback(null);
    setIsCorrect(false);
    setHasSpokenCurrent(false);
    setIsCompleted(false);
  };

  if (isCompleted) {
    const percentage = Math.round((score / maxScore) * 100);

    return (
      <div className="activity-page-wrapper theme-purple">
        <div className="activity-container">
          <button type="button" className="btn-back-pill" onClick={onBack}>
            ← Back to Activities
          </button>

          <div className="game-card results-card">
            <div className="results-badge-icon">🎧</div>
            <h1 className="results-title">Dictation Completed!</h1>
            <p className="results-subtitle">Great job on practicing your listening and spelling!</p>

            <div className="score-summary-banner">
              <div className="score-main-value">{score} <span className="score-max-value">/ {maxScore}</span></div>
              <div className="score-percent-badge">{percentage}% Accuracy</div>
            </div>

            <div className="results-actions-row">
              <button type="button" className="btn btn-activity-action theme-purple" onClick={handlePlayAgain}>
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

  const getListenButtonText = () => {
    if (isSpeaking) return 'Playing...';
    if (hasSpokenCurrent) return 'Listen Again 🔊';
    return 'Listen 🔊';
  };

  return (
    <div className="activity-page-wrapper theme-purple">
      <div className="activity-container">
        <button type="button" className="btn-back-pill" onClick={onBack}>
          ← Back to Activities
        </button>

        <div className="game-card">
          {/* Activity Banner Header */}
          <div className="game-header-bar">
            <div className="game-title-group">
              <span className="game-header-icon">🎧</span>
              <div>
                <h1 className="game-main-title">Dictation</h1>
                <p className="game-instruction">Listen carefully and type what you hear.</p>
              </div>
            </div>

            <div className="game-stats-pills">
              <div className="stat-pill-badge">
                <span className="stat-pill-label">QUESTION</span>
                <span className="stat-pill-value">{currentIndex + 1} / {totalQuestions}</span>
              </div>
              <div className="stat-pill-badge stat-score">
                <span className="stat-pill-label">SCORE</span>
                <span className="stat-pill-value">{score}</span>
              </div>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill theme-purple"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>

          {/* Playful Audio Listen Button */}
          <div className="audio-trigger-area">
            <button
              type="button"
              className={`btn-listen-large ${isSpeaking ? 'pulse-speaking' : ''}`}
              onClick={() => speakWord(currentItem.word)}
            >
              {getListenButtonText()}
            </button>
          </div>

          {/* Answer Form */}
          <form onSubmit={handleCheckAnswer} className="activity-form-area">
            <div className="input-field-wrapper">
              <label htmlFor="dictation-input" className="sr-only">
                Type what you heard
              </label>
              <input
                id="dictation-input"
                ref={inputRef}
                type="text"
                className="dictation-text-input"
                placeholder="Type what you heard..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={isCorrect}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
            </div>

            {feedback && (
              <div className={`activity-feedback-banner feedback-${feedback.type}`} role="alert">
                {feedback.message}
              </div>
            )}

            <div className="form-action-row">
              {!isCorrect ? (
                <button
                  type="submit"
                  className="btn btn-activity-action theme-purple"
                  disabled={!userAnswer.trim()}
                >
                  Check Answer
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-activity-action theme-purple"
                  onClick={handleNextQuestion}
                >
                  {currentIndex < totalQuestions - 1 ? 'Next Word →' : 'See Results'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
