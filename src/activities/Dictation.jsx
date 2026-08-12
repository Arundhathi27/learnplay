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

  // Asynchronously load and cache speech synthesis voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const updateVoices = () => {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
      };

      updateVoices();

      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }
  }, []);

  // Voice Selection logic: Picks the clearest English voice available
  const getBestEnglishVoice = () => {
    if (!('speechSynthesis' in window)) return null;

    const availableVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
    if (!availableVoices || availableVoices.length === 0) return null;

    // Filter all English voices
    const englishVoices = availableVoices.filter(
      (v) => v.lang && (v.lang.toLowerCase().startsWith('en') || v.lang.toLowerCase().includes('en'))
    );

    const voiceList = englishVoices.length > 0 ? englishVoices : availableVoices;

    // Preferred keywords in order of priority for high-clarity natural synthesis
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
      const match = voiceList.find((v) =>
        v.name.toLowerCase().includes(keyword)
      );
      if (match) return match;
    }

    // Fall back to default English voice or first available English voice
    const defaultVoice = voiceList.find((v) => v.default);
    return defaultVoice || voiceList[0] || null;
  };

  const speakWord = (text) => {
    if (!('speechSynthesis' in window)) return;

    // Cancel any active speech synthesis
    window.speechSynthesis.cancel();

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Configure playback properties for dictation clarity
    utterance.lang = 'en-US';
    utterance.rate = 0.75; // Slower rate for clear dictation
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Select clearest available voice
    const selectedVoice = getBestEnglishVoice();
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

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

  // Focus input when question changes (without auto-speaking)
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
        message: `🎉 Great job! "${currentItem.word}" is correct!`
      });
    } else {
      setFeedback({
        type: 'error',
        message: '❌ Not quite right! Listen again and try again.'
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
      <div className="activity-container">
        <div className="activity-header">
          <button type="button" className="btn-back" onClick={onBack}>
            ← Back to Activities
          </button>
        </div>

        <div className="dictation-card dictation-results-card">
          <div className="result-icon">🎉</div>
          <h1 className="result-title">Great Job!</h1>
          <p className="result-subtitle">You completed the Dictation activity.</p>

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

  const getListenButtonText = () => {
    if (isSpeaking) return '🔊 Playing...';
    if (hasSpokenCurrent) return '🔊 Listen Again';
    return '🔊 Listen';
  };

  return (
    <div className="activity-container">
      <div className="activity-header">
        <button type="button" className="btn-back" onClick={onBack}>
          ← Back to Activities
        </button>
      </div>

      <div className="dictation-card">
        {/* Game Header Bar */}
        <div className="dictation-game-header">
          <div className="activity-title-group">
            <h1 className="dictation-title">🎧 Dictation</h1>
            <p className="dictation-instruction">Listen carefully and type what you hear.</p>
          </div>

          <div className="dictation-stats">
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

        {/* Listen Button */}
        <div className="listen-section">
          <button
            type="button"
            className={`listen-button ${isSpeaking ? 'speaking' : ''}`}
            onClick={() => speakWord(currentItem.word)}
            aria-label={getListenButtonText()}
          >
            <span className="listen-text">{getListenButtonText()}</span>
          </button>
        </div>

        {/* Form Input Section */}
        <form onSubmit={handleCheckAnswer} className="dictation-form">
          <div className="input-group">
            <label htmlFor="dictation-input" className="sr-only">
              Type what you heard
            </label>
            <input
              id="dictation-input"
              ref={inputRef}
              type="text"
              className={`dictation-input ${feedback ? feedback.type : ''}`}
              placeholder="Type what you heard..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={isCorrect}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
          </div>

          {/* Feedback Display */}
          {feedback && (
            <div className={`dictation-feedback feedback-${feedback.type}`} role="alert">
              {feedback.message}
            </div>
          )}

          {/* Action Buttons */}
          <div className="form-actions">
            {!isCorrect ? (
              <button
                type="submit"
                className="btn btn-primary btn-check"
                disabled={!userAnswer.trim()}
              >
                Check Answer
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-next"
                onClick={handleNextQuestion}
              >
                {currentIndex < totalQuestions - 1 ? 'Next Question ➔' : 'See Results 🏆'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
