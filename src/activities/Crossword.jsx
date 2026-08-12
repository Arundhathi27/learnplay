import React, { useState, useEffect, useRef } from 'react';

export const DEFAULT_CROSSWORD_DATA = {
  id: 'crossword-1',
  type: 'crossword',
  title: 'Animal & Nature Crossword',
  description: 'Read each clue and fill in the crossword puzzle.',
  solutionWord: 'LEARN',
  words: [
    {
      id: 'w1',
      answer: 'CAT',
      clue: 'A small animal that says meow.'
    },
    {
      id: 'w2',
      answer: 'DOG',
      clue: 'A friendly animal that often lives with people.'
    },
    {
      id: 'w3',
      answer: 'SUN',
      clue: 'The star that gives Earth light.'
    },
    {
      id: 'w4',
      answer: 'APPLE',
      clue: 'A common red or green fruit.'
    }
  ],
  feedback: {
    correct: '🎉 Great job! Crossword completed!',
    incorrect: 'Some answers are not correct yet. Keep trying!'
  }
};

// Dynamic Crossword Grid Generator
function canPlaceWord(grid, word, r, c, dir, maxDim) {
  if (r < 0 || c < 0) return false;
  if (dir === 'across' && c + word.length > maxDim) return false;
  if (dir === 'down' && r + word.length > maxDim) return false;

  for (let i = 0; i < word.length; i++) {
    const curR = dir === 'down' ? r + i : r;
    const curC = dir === 'across' ? c + i : c;
    const cell = grid[curR][curC];

    if (cell && cell.char !== word[i]) {
      return false;
    }
  }
  return true;
}

function placeWord(grid, word, r, c, dir, wordId) {
  for (let i = 0; i < word.length; i++) {
    const curR = dir === 'down' ? r + i : r;
    const curC = dir === 'across' ? c + i : c;
    if (!grid[curR][curC]) {
      grid[curR][curC] = { char: word[i], wordIds: [wordId] };
    } else {
      if (!grid[curR][curC].wordIds.includes(wordId)) {
        grid[curR][curC].wordIds.push(wordId);
      }
    }
  }
}

export function buildCrosswordLayout(wordsList) {
  const GRID_SIZE = 12;
  let grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
  const placedWords = [];

  wordsList.forEach((wordObj, index) => {
    const word = wordObj.answer.toUpperCase();
    let placed = false;

    if (index === 0) {
      const r = Math.floor(GRID_SIZE / 2);
      const c = Math.max(0, Math.floor((GRID_SIZE - word.length) / 2));
      placeWord(grid, word, r, c, 'across', wordObj.id);
      placedWords.push({
        ...wordObj,
        answer: word,
        row: r,
        col: c,
        direction: 'across'
      });
      placed = true;
    } else {
      for (let pWord of placedWords) {
        if (placed) break;
        const pStr = pWord.answer;

        for (let i = 0; i < word.length; i++) {
          if (placed) break;
          const char = word[i];

          for (let j = 0; j < pStr.length; j++) {
            if (pStr[j] === char) {
              const intersectR = pWord.direction === 'across' ? pWord.row : pWord.row + j;
              const intersectC = pWord.direction === 'across' ? pWord.col + j : pWord.col;

              const newDir = pWord.direction === 'across' ? 'down' : 'across';
              const newR = newDir === 'down' ? intersectR - i : intersectR;
              const newC = newDir === 'across' ? intersectC - i : intersectC;

              if (canPlaceWord(grid, word, newR, newC, newDir, GRID_SIZE)) {
                placeWord(grid, word, newR, newC, newDir, wordObj.id);
                placedWords.push({
                  ...wordObj,
                  answer: word,
                  row: newR,
                  col: newC,
                  direction: newDir
                });
                placed = true;
                break;
              }
            }
          }
        }
      }

      if (!placed) {
        for (let r = 0; r < GRID_SIZE; r++) {
          if (placed) break;
          for (let c = 0; c < GRID_SIZE - word.length; c++) {
            if (canPlaceWord(grid, word, r, c, 'across', GRID_SIZE)) {
              placeWord(grid, word, r, c, 'across', wordObj.id);
              placedWords.push({
                ...wordObj,
                answer: word,
                row: r,
                col: c,
                direction: 'across'
              });
              placed = true;
              break;
            }
          }
        }
      }
    }
  });

  // Minimum bounding box
  let minR = GRID_SIZE, maxR = 0, minC = GRID_SIZE, maxC = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c]) {
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
      }
    }
  }

  const rows = maxR - minR + 1;
  const cols = maxC - minC + 1;

  placedWords.forEach((pw) => {
    pw.row = pw.row - minR;
    pw.col = pw.col - minC;
  });

  // Assign starting cell clue numbers
  const startMap = {};
  placedWords.forEach((pw) => {
    const key = `${pw.row}-${pw.col}`;
    if (!startMap[key]) {
      startMap[key] = [];
    }
    startMap[key].push(pw);
  });

  let clueNum = 1;
  const sortedKeys = Object.keys(startMap).sort((a, b) => {
    const [r1, c1] = a.split('-').map(Number);
    const [r2, c2] = b.split('-').map(Number);
    if (r1 !== r2) return r1 - r2;
    return c1 - c2;
  });

  sortedKeys.forEach((key) => {
    const pwList = startMap[key];
    pwList.forEach((pw) => {
      pw.number = clueNum;
    });
    clueNum++;
  });

  // Build final normalized grid
  const finalGrid = Array(rows).fill(null).map(() => Array(cols).fill(null));

  placedWords.forEach((pw) => {
    for (let i = 0; i < pw.answer.length; i++) {
      const r = pw.direction === 'down' ? pw.row + i : pw.row;
      const c = pw.direction === 'across' ? pw.col + i : pw.col;

      if (!finalGrid[r][c]) {
        finalGrid[r][c] = {
          char: pw.answer[i],
          number: i === 0 ? pw.number : null,
          wordIds: [pw.id]
        };
      } else {
        if (i === 0) finalGrid[r][c].number = pw.number;
        if (!finalGrid[r][c].wordIds.includes(pw.id)) {
          finalGrid[r][c].wordIds.push(pw.id);
        }
      }
    }
  });

  return { grid: finalGrid, placedWords, rows, cols };
}

export default function Crossword({ onBack, data = DEFAULT_CROSSWORD_DATA }) {
  const [layout, setLayout] = useState(null);
  const [userInputs, setUserInputs] = useState({});
  const [cellStates, setCellStates] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const inputRefs = useRef({});

  useEffect(() => {
    const rawWords = data?.content?.words || data?.words || DEFAULT_CROSSWORD_DATA.words;
    const generated = buildCrosswordLayout(rawWords);
    setLayout(generated);
    setUserInputs({});
    setCellStates({});
    setFeedback(null);
    setScore(0);
    setIsCompleted(false);
    setShowSolution(false);
  }, [data]);

  if (!layout) return null;

  const { grid, placedWords, rows, cols } = layout;
  const totalWords = placedWords.length;
  const maxScore = totalWords * 10;

  const acrossClues = placedWords.filter((w) => w.direction === 'across');
  const downClues = placedWords.filter((w) => w.direction === 'down');

  const handleInputChange = (r, c, val) => {
    const char = val.toUpperCase().slice(-1);
    const key = `${r}-${c}`;

    setUserInputs((prev) => ({ ...prev, [key]: char }));
    setCellStates((prev) => ({ ...prev, [key]: null }));

    // Auto-advance focus to next cell
    if (char) {
      const nextKey = `${r}-${c + 1}`;
      if (inputRefs.current[nextKey]) {
        inputRefs.current[nextKey].focus();
      }
    }
  };

  const handleKeyDown = (r, c, e) => {
    let nextR = r;
    let nextC = c;

    if (e.key === 'ArrowRight') nextC = c + 1;
    else if (e.key === 'ArrowLeft') nextC = c - 1;
    else if (e.key === 'ArrowDown') nextR = r + 1;
    else if (e.key === 'ArrowUp') nextR = r - 1;
    else if (e.key === 'Backspace' && !userInputs[`${r}-${c}`]) {
      nextC = c - 1;
    }

    const nextKey = `${nextR}-${nextC}`;
    if (inputRefs.current[nextKey]) {
      inputRefs.current[nextKey].focus();
    }
  };

  const handleCheckAnswers = (e) => {
    e.preventDefault();

    let solvedCount = 0;
    const newCellStates = {};

    placedWords.forEach((pw) => {
      let isWordCorrect = true;

      for (let i = 0; i < pw.answer.length; i++) {
        const r = pw.direction === 'down' ? pw.row + i : pw.row;
        const c = pw.direction === 'across' ? pw.col + i : pw.col;
        const key = `${r}-${c}`;
        const userChar = (userInputs[key] || '').toUpperCase();

        if (userChar === pw.answer[i]) {
          if (newCellStates[key] !== 'error') {
            newCellStates[key] = 'success';
          }
        } else {
          isWordCorrect = false;
          newCellStates[key] = 'error';
        }
      }

      if (isWordCorrect) {
        solvedCount++;
      }
    });

    setCellStates(newCellStates);
    const currentScore = solvedCount * 10;
    setScore(currentScore);

    if (solvedCount === totalWords) {
      setIsCompleted(true);
      setShowSolution(true);
      setFeedback({
        type: 'success',
        message: data.feedback?.correct || '🎉 Great job! Crossword completed!'
      });
    } else {
      setFeedback({
        type: 'error',
        message: data.feedback?.incorrect || 'Some answers are not correct yet. Keep trying!'
      });
    }
  };

  const handlePlayAgain = () => {
    const generated = buildCrosswordLayout(data.words);
    setLayout(generated);
    setUserInputs({});
    setCellStates({});
    setFeedback(null);
    setScore(0);
    setIsCompleted(false);
    setShowSolution(false);
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

        <div className="crossword-card results-card">
          <div className="result-icon">✏️</div>
          <h1 className="result-title">Great Job!</h1>
          <p className="result-subtitle">You completed the Crossword puzzle.</p>

          {data.solutionWord && (
            <div className="solution-word-banner">
              <span className="solution-label">Solution Word:</span>
              <span className="solution-value">{data.solutionWord}</span>
            </div>
          )}

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

      <div className="crossword-card">
        {/* Header Bar */}
        <div className="game-header">
          <div className="activity-title-group">
            <h1 className="activity-main-title">✏️ Crossword</h1>
            <p className="activity-instruction">{data.description}</p>
          </div>

          <div className="game-stats">
            <div className="stat-pill stat-score">
              <span className="stat-label">Score</span>
              <span className="stat-value">{score}</span>
            </div>
          </div>
        </div>

        {/* Main Content Layout: Grid + Clues */}
        <div className="crossword-main-layout">
          {/* Crossword Grid Stage */}
          <div className="crossword-grid-container">
            <div
              className="crossword-grid"
              style={{
                gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
              }}
            >
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  const key = `${r}-${c}`;
                  const stateClass = cellStates[key] || '';

                  if (!cell) {
                    return <div key={key} className="crossword-cell cell-empty" />;
                  }

                  return (
                    <div key={key} className={`crossword-cell cell-active ${stateClass}`}>
                      {cell.number && <span className="cell-number">{cell.number}</span>}
                      <input
                        ref={(el) => (inputRefs.current[key] = el)}
                        type="text"
                        maxLength={1}
                        className="cell-input"
                        value={userInputs[key] || ''}
                        onChange={(e) => handleInputChange(r, c, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(r, c, e)}
                        aria-label={`Letter cell for Row ${r + 1} Column ${c + 1}${cell.number ? `, Clue ${cell.number}` : ''}`}
                        autoComplete="off"
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Clues Panel */}
          <div className="crossword-clues-panel">
            {acrossClues.length > 0 && (
              <div className="clues-section">
                <h3 className="clues-title">Across</h3>
                <ul className="clues-list">
                  {acrossClues.map((w) => (
                    <li key={w.id} className="clue-item">
                      <span className="clue-number">{w.number}.</span>
                      <span className="clue-text">{w.clue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {downClues.length > 0 && (
              <div className="clues-section">
                <h3 className="clues-title">Down</h3>
                <ul className="clues-list">
                  {downClues.map((w) => (
                    <li key={w.id} className="clue-item">
                      <span className="clue-number">{w.number}.</span>
                      <span className="clue-text">{w.clue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
          >
            Check Answers
          </button>
        </div>
      </div>
    </div>
  );
}
