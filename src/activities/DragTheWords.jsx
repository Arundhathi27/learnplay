import React, { useState, useEffect } from 'react';

export const DEFAULT_DRAG_WORDS_DATA = {
  id: 'drag-words-1',
  type: 'drag-the-words',
  title: 'Countries and Capitals',
  description: 'Drag the correct words into the blanks.',
  text: 'The capital of France is *Paris*. The capital of India is *Delhi*. The capital of Japan is *Tokyo*.',
  distractors: ['London', 'Berlin', 'Seoul'],
  feedback: {
    correct: '🎉 Great job! All blanks filled correctly!',
    partial: 'Good try! Check the highlighted answers.',
    incorrect: 'Some answers are incorrect. Try again!'
  },
  settings: {
    randomize: true
  }
};

// Helper: Fisher-Yates array shuffle
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Parser for *word* syntax
export function parseDragTheWordsText(rawText) {
  const regex = /\*(.*?)\*/g;
  const segments = [];
  const blanks = [];
  let lastIndex = 0;
  let match;
  let blankId = 0;

  while ((match = regex.exec(rawText)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: rawText.substring(lastIndex, match.index)
      });
    }

    const answerWord = match[1];
    const bId = `blank-${blankId++}`;
    blanks.push({ id: bId, answer: answerWord });

    segments.push({
      type: 'blank',
      blankId: bId,
      answer: answerWord
    });

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < rawText.length) {
    segments.push({
      type: 'text',
      content: rawText.substring(lastIndex)
    });
  }

  return { segments, blanks };
}

export default function DragTheWords({ onBack, data = DEFAULT_DRAG_WORDS_DATA }) {
  const [parsed, setParsed] = useState(null);
  const [availableWords, setAvailableWords] = useState([]);
  const [placedAnswers, setPlacedAnswers] = useState({});
  const [selectedWord, setSelectedWord] = useState(null);
  const [draggedWord, setDraggedWord] = useState(null);
  const [checkedStates, setCheckedStates] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize parsed text & words pool
  useEffect(() => {
    const rawText = data?.content?.text || data?.text || DEFAULT_DRAG_WORDS_DATA.text;
    const distractors = data?.content?.distractors || data?.distractors || DEFAULT_DRAG_WORDS_DATA.distractors;
    const settings = data?.settings || DEFAULT_DRAG_WORDS_DATA.settings;

    const parsedResult = parseDragTheWordsText(rawText);
    setParsed(parsedResult);

    const correctWords = parsedResult.blanks.map((b) => b.answer);
    const allWordsList = [...correctWords, ...(distractors || [])].map((w, idx) => ({
      id: `w-${idx}-${w}`,
      text: w
    }));

    const wordPool = settings?.randomize !== false ? shuffleArray(allWordsList) : allWordsList;
    setAvailableWords(wordPool);
    setPlacedAnswers({});
    setCheckedStates({});
    setFeedback(null);
    setScore(0);
    setIsCompleted(false);
    setSelectedWord(null);
  }, [data]);

  if (!parsed) return null;

  const totalBlanks = parsed.blanks.length;
  const maxScore = totalBlanks * 10;
  const showInst = data?.settings?.showInstructions !== false;
  const activityTitle = data?.title || '📝 Drag the Words';
  const activityDesc = data?.description || 'Drag the correct words into the blanks.';

  // Place word into target blank
  const placeWordInBlank = (wordObj, blankId) => {
    // If blank already has a word, return that word back to available pool
    const existingObj = placedAnswers[blankId];

    setPlacedAnswers((prev) => ({
      ...prev,
      [blankId]: wordObj
    }));

    setAvailableWords((prev) => {
      let nextList = prev.filter((w) => w.id !== wordObj.id);
      if (existingObj) {
        nextList = [...nextList, existingObj];
      }
      return nextList;
    });

    setCheckedStates((prev) => ({ ...prev, [blankId]: null }));
    setSelectedWord(null);
  };

  // Remove word from blank back to available pool
  const removeWordFromBlank = (blankId) => {
    const wordObj = placedAnswers[blankId];
    if (!wordObj) return;

    const newPlaced = { ...placedAnswers };
    delete newPlaced[blankId];
    setPlacedAnswers(newPlaced);

    setAvailableWords((prev) => [...prev, wordObj]);
    setCheckedStates((prev) => ({ ...prev, [blankId]: null }));
  };

  // HTML5 Drag Handlers
  const handleDragStart = (e, wordObj) => {
    setDraggedWord(wordObj);
    e.dataTransfer.setData('text/plain', JSON.stringify(wordObj));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnBlank = (e, blankId) => {
    e.preventDefault();
    if (draggedWord) {
      placeWordInBlank(draggedWord, blankId);
      setDraggedWord(null);
    }
  };

  // Touch / Click Handler
  const handleWordClick = (wordObj) => {
    if (selectedWord?.id === wordObj.id) {
      setSelectedWord(null);
    } else {
      setSelectedWord(wordObj);
    }
  };

  const handleBlankClick = (blankId) => {
    if (selectedWord) {
      placeWordInBlank(selectedWord, blankId);
    } else if (placedAnswers[blankId]) {
      removeWordFromBlank(blankId);
    }
  };

  const handleCheckAnswers = () => {
    let correctCount = 0;
    const newChecked = {};

    parsed.blanks.forEach((b) => {
      const placed = placedAnswers[b.id];
      if (placed) {
        if (placed.text.trim().toLowerCase() === b.answer.trim().toLowerCase()) {
          newChecked[b.id] = 'success';
          correctCount++;
        } else {
          newChecked[b.id] = 'error';
        }
      }
    });

    setCheckedStates(newChecked);
    const newScore = correctCount * 10;
    setScore(newScore);

    if (correctCount === totalBlanks) {
      setIsCompleted(true);
      setFeedback({
        type: 'success',
        message: data.feedback?.correct || '🎉 Great job! All blanks filled correctly!'
      });
    } else if (correctCount > 0) {
      setFeedback({
        type: 'error',
        message: data.feedback?.partial || 'Good try! Check the highlighted answers.'
      });
    } else {
      setFeedback({
        type: 'error',
        message: data.feedback?.incorrect || 'Some answers are incorrect. Try again!'
      });
    }
  };

  const handlePlayAgain = () => {
    const correctWords = parsed.blanks.map((b) => b.answer);
    const allWordsList = [...correctWords, ...(data.distractors || [])].map((w, idx) => ({
      id: `w-${idx}-${w}`,
      text: w
    }));

    const wordPool = data.settings?.randomize ? shuffleArray(allWordsList) : allWordsList;
    setAvailableWords(wordPool);
    setPlacedAnswers({});
    setCheckedStates({});
    setFeedback(null);
    setScore(0);
    setIsCompleted(false);
    setSelectedWord(null);
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

        <div className="drag-words-card results-card">
          <div className="result-icon">🎉</div>
          <h1 className="result-title">Activity Complete!</h1>
          <p className="result-subtitle">You filled all the blanks correctly.</p>

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

      <div className="drag-words-card">
        {/* Header Bar */}
        <div className="game-header">
          <div className="activity-title-group">
            <h1 className="activity-main-title">{activityTitle}</h1>
            {showInst && activityDesc && <p className="activity-instruction">{activityDesc}</p>}
          </div>

          <div className="game-stats">
            <div className="stat-pill stat-score">
              <span className="stat-label">Score</span>
              <span className="stat-value">{score}</span>
            </div>
          </div>
        </div>

        {/* Text Paragraph Stage with Inline Blanks */}
        <div className="drag-words-text-stage">
          <div className="drag-words-paragraph">
            {parsed.segments.map((seg, idx) => {
              if (seg.type === 'text') {
                return <span key={idx} className="text-segment">{seg.content}</span>;
              }

              const bId = seg.blankId;
              const placed = placedAnswers[bId];
              const checkState = checkedStates[bId] || '';

              return (
                <span
                  key={idx}
                  className={`word-blank-slot ${placed ? 'filled' : ''} ${checkState}`}
                  onClick={() => handleBlankClick(bId)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnBlank(e, bId)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Blank for ${seg.answer}`}
                >
                  {placed ? (
                    <span className="placed-word-chip">
                      {placed.text}
                      <span className="remove-cross" title="Remove word">×</span>
                    </span>
                  ) : (
                    <span className="blank-placeholder">______</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>

        {/* Available Draggable Words Bank */}
        <div className="words-bank-section">
          <h3 className="bank-title">Available Words</h3>
          <div className="words-bank-grid">
            {availableWords.map((wObj) => {
              const isSelected = selectedWord?.id === wObj.id;

              return (
                <div
                  key={wObj.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, wObj)}
                  onClick={() => handleWordClick(wObj)}
                  className={`draggable-word-tile ${isSelected ? 'selected' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Draggable word ${wObj.text}`}
                >
                  {wObj.text}
                </div>
              );
            })}
          </div>
        </div>

        {/* Feedback Display */}
        {feedback && (
          <div className={`dictation-feedback feedback-${feedback.type}`} role="alert">
            {feedback.message}
          </div>
        )}

        {/* Action Button */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-primary btn-check"
            onClick={handleCheckAnswers}
            disabled={Object.keys(placedAnswers).length === 0}
          >
            Check Answers
          </button>
        </div>
      </div>
    </div>
  );
}
