import React, { useState } from 'react';

const ROUNDS_DATA = [
  {
    roundNumber: 1,
    items: [
      { id: 'r1_apple', name: 'Apple', emoji: '🍎', category: 'fruits' },
      { id: 'r1_dog', name: 'Dog', emoji: '🐶', category: 'animals' },
      { id: 'r1_banana', name: 'Banana', emoji: '🍌', category: 'fruits' }
    ]
  },
  {
    roundNumber: 2,
    items: [
      { id: 'r2_cat', name: 'Cat', emoji: '🐱', category: 'animals' },
      { id: 'r2_orange', name: 'Orange', emoji: '🍊', category: 'fruits' },
      { id: 'r2_rabbit', name: 'Rabbit', emoji: '🐰', category: 'animals' }
    ]
  },
  {
    roundNumber: 3,
    items: [
      { id: 'r3_mango', name: 'Mango', emoji: '🥭', category: 'fruits' },
      { id: 'r3_elephant', name: 'Elephant', emoji: '🐘', category: 'animals' },
      { id: 'r3_apple', name: 'Apple', emoji: '🍎', category: 'fruits' }
    ]
  },
  {
    roundNumber: 4,
    items: [
      { id: 'r4_dog', name: 'Dog', emoji: '🐶', category: 'animals' },
      { id: 'r4_banana', name: 'Banana', emoji: '🍌', category: 'fruits' },
      { id: 'r4_cat', name: 'Cat', emoji: '🐱', category: 'animals' }
    ]
  }
];

const CATEGORIES = [
  { id: 'fruits', title: 'Fruits', icon: '🍎' },
  { id: 'animals', title: 'Animals', icon: '🐾' }
];

export default function DragDrop({ onBack }) {
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [roundAvailableItems, setRoundAvailableItems] = useState(ROUNDS_DATA[0].items);
  const [roundSortedItems, setRoundSortedItems] = useState({ fruits: [], animals: [] });
  const [score, setScore] = useState(0);
  const [draggedItem, setDraggedItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeDropZone, setActiveDropZone] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isGameCompleted, setIsGameCompleted] = useState(false);

  const totalRounds = ROUNDS_DATA.length;
  const totalGameItems = 12;
  const maxScore = totalGameItems * 10;

  const currentRound = ROUNDS_DATA[currentRoundIndex];
  const roundTotalItems = currentRound.items.length;
  const roundSortedCount = roundTotalItems - roundAvailableItems.length;
  const isRoundComplete = roundAvailableItems.length === 0;

  const completedPreviousItems = currentRoundIndex * 3;
  const totalCompletedCount = completedPreviousItems + roundSortedCount;

  const handleSortAttempt = (item, targetCategoryId) => {
    if (!item) return;

    if (item.category === targetCategoryId) {
      setScore((prev) => prev + 10);
      const remaining = roundAvailableItems.filter((i) => i.id !== item.id);
      setRoundAvailableItems(remaining);
      setRoundSortedItems((prev) => ({
        ...prev,
        [targetCategoryId]: [...prev[targetCategoryId], item]
      }));

      const categoryLabel = targetCategoryId === 'fruits' ? 'Fruits' : 'Animals';

      if (remaining.length === 0) {
        setFeedback({
          type: 'success',
          message: `🎉 Round ${currentRoundIndex + 1} Complete! Excellent sorting!`
        });
      } else {
        setFeedback({
          type: 'success',
          message: `🎉 Correct! ${item.name} is in ${categoryLabel}. (+10 pts)`
        });
      }
    } else {
      setFeedback({
        type: 'error',
        message: "❌ Try again! That item doesn't belong in that category."
      });
    }

    setSelectedItem(null);
    setDraggedItem(null);
    setActiveDropZone(null);
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', item.id);
  };

  const handleDragOver = (e, categoryId) => {
    e.preventDefault();
    if (activeDropZone !== categoryId) setActiveDropZone(categoryId);
  };

  const handleDragLeave = (e, categoryId) => {
    e.preventDefault();
    if (activeDropZone === categoryId) setActiveDropZone(null);
  };

  const handleDrop = (e, categoryId) => {
    e.preventDefault();
    handleSortAttempt(draggedItem, categoryId);
  };

  const handleItemClick = (item) => {
    if (selectedItem?.id === item.id) setSelectedItem(null);
    else setSelectedItem(item);
  };

  const handleCategoryClick = (categoryId) => {
    if (selectedItem) handleSortAttempt(selectedItem, categoryId);
  };

  const handleNextRound = () => {
    if (currentRoundIndex < totalRounds - 1) {
      const nextIndex = currentRoundIndex + 1;
      setCurrentRoundIndex(nextIndex);
      setRoundAvailableItems(ROUNDS_DATA[nextIndex].items);
      setRoundSortedItems({ fruits: [], animals: [] });
      setFeedback(null);
      setSelectedItem(null);
      setDraggedItem(null);
    } else {
      setIsGameCompleted(true);
    }
  };

  const handlePlayAgain = () => {
    setCurrentRoundIndex(0);
    setRoundAvailableItems(ROUNDS_DATA[0].items);
    setRoundSortedItems({ fruits: [], animals: [] });
    setScore(0);
    setDraggedItem(null);
    setSelectedItem(null);
    setActiveDropZone(null);
    setFeedback(null);
    setIsGameCompleted(false);
  };

  if (isGameCompleted) {
    const percentage = Math.round((score / maxScore) * 100);

    return (
      <div className="activity-page-wrapper theme-blue">
        <div className="activity-container">
          <button type="button" className="btn-back-pill" onClick={onBack}>
            ← Back to Activities
          </button>

          <div className="game-card results-card">
            <div className="results-badge-icon">🧩</div>
            <h1 className="results-title">Sort & Match Completed!</h1>
            <p className="results-subtitle">Awesome job! You sorted all 12 items correctly across 4 rounds.</p>

            <div className="score-summary-banner">
              <div className="score-main-value">{score} <span className="score-max-value">/ {maxScore}</span></div>
              <div className="score-percent-badge">{percentage}% Accuracy</div>
            </div>

            <div className="results-actions-row">
              <button type="button" className="btn btn-activity-action theme-blue" onClick={handlePlayAgain}>
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
    <div className="activity-page-wrapper theme-blue">
      <div className="activity-container">
        <button type="button" className="btn-back-pill" onClick={onBack}>
          ← Back to Activities
        </button>

        <div className="game-card">
          {/* Header */}
          <div className="game-header-bar">
            <div className="game-title-group">
              <span className="game-header-icon">🧩</span>
              <div>
                <h1 className="game-main-title">Sort & Match</h1>
                <p className="game-instruction">Drag each item into the correct category.</p>
              </div>
            </div>

            <div className="game-stats-pills">
              <div className="stat-pill-badge">
                <span className="stat-pill-label">ROUND</span>
                <span className="stat-pill-value">{currentRoundIndex + 1} / {totalRounds}</span>
              </div>
              <div className="stat-pill-badge">
                <span className="stat-pill-label">ITEMS</span>
                <span className="stat-pill-value">{roundSortedCount} / {roundTotalItems}</span>
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
              className="progress-bar-fill theme-blue"
              style={{ width: `${(totalCompletedCount / totalGameItems) * 100}%` }}
            ></div>
          </div>

          {feedback && (
            <div className={`activity-feedback-banner feedback-${feedback.type}`} role="alert">
              {feedback.message}
            </div>
          )}

          {isRoundComplete && (
            <div className="round-complete-banner theme-blue">
              <div>
                <h2 className="banner-title">Round {currentRoundIndex + 1} Complete!</h2>
                <p className="banner-subtitle">You sorted all items for this round!</p>
              </div>
              <button type="button" className="btn btn-activity-action theme-blue" onClick={handleNextRound}>
                {currentRoundIndex < totalRounds - 1 ? 'Next Round →' : 'See Results'}
              </button>
            </div>
          )}

          {!isRoundComplete && (
            <section className="drag-items-section">
              <div className="items-section-header">
                <h2 className="section-label-text">Available Items (Round {currentRoundIndex + 1})</h2>
                {selectedItem && (
                  <span className="touch-selection-hint">
                    Selected: {selectedItem.emoji} {selectedItem.name} — Click a category below!
                  </span>
                )}
              </div>

              <div className="drag-items-grid">
                {roundAvailableItems.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onClick={() => handleItemClick(item)}
                    className={`draggable-card ${selectedItem?.id === item.id ? 'selected-item' : ''}`}
                    role="button"
                    tabIndex={0}
                  >
                    <span className="drag-emoji">{item.emoji}</span>
                    <span className="drag-name">{item.name}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Categories Grid */}
          <section className="categories-grid">
            {CATEGORIES.map((category) => {
              const isHovered = activeDropZone === category.id;
              const sortedItems = roundSortedItems[category.id] || [];

              return (
                <div
                  key={category.id}
                  onDragOver={(e) => !isRoundComplete && handleDragOver(e, category.id)}
                  onDragLeave={(e) => !isRoundComplete && handleDragLeave(e, category.id)}
                  onDrop={(e) => !isRoundComplete && handleDrop(e, category.id)}
                  onClick={() => !isRoundComplete && handleCategoryClick(category.id)}
                  className={`category-drop-card ${isHovered ? 'hover-drop' : ''} ${
                    selectedItem ? 'clickable-target' : ''
                  }`}
                >
                  <div className="category-header-row">
                    <span className="cat-icon">{category.icon}</span>
                    <h3 className="cat-title">{category.title}</h3>
                    <span className="cat-count-badge">{sortedItems.length} sorted</span>
                  </div>

                  <div className="sorted-chips-area">
                    {sortedItems.length === 0 ? (
                      <div className="category-empty-placeholder">
                        {selectedItem ? `Click here to place ${selectedItem.name}` : `Drop ${category.title} here`}
                      </div>
                    ) : (
                      sortedItems.map((item) => (
                        <div key={item.id} className="sorted-item-chip">
                          <span>{item.emoji}</span>
                          <span>{item.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        </div>
      </div>
    </div>
  );
}
