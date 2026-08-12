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
  const totalGameItems = 12; // 4 rounds * 3 items
  const maxScore = totalGameItems * 10;

  const currentRound = ROUNDS_DATA[currentRoundIndex];
  const roundTotalItems = currentRound.items.length;
  const roundSortedCount = roundTotalItems - roundAvailableItems.length;
  const isRoundComplete = roundAvailableItems.length === 0;

  // Overall completed count across previous rounds + current round
  const completedPreviousItems = currentRoundIndex * 3;
  const totalCompletedCount = completedPreviousItems + roundSortedCount;

  const handleSortAttempt = (item, targetCategoryId) => {
    if (!item) return;

    if (item.category === targetCategoryId) {
      // Correct Match
      setScore((prev) => prev + 10);
      const remaining = roundAvailableItems.filter((i) => i.id !== item.id);
      setRoundAvailableItems(remaining);
      setRoundSortedItems((prev) => ({
        ...prev,
        [targetCategoryId]: [...prev[targetCategoryId], item]
      }));

      const categoryLabel = targetCategoryId === 'fruits' ? 'Fruits' : 'Animals';

      if (remaining.length === 0) {
        // Round Complete
        setFeedback({
          type: 'success',
          message: `🎉 Round ${currentRoundIndex + 1} Complete! Great job!`
        });
      } else {
        setFeedback({
          type: 'success',
          message: `🎉 Correct! +10 (${item.name} is in ${categoryLabel})`
        });
      }
    } else {
      // Incorrect Match
      setFeedback({
        type: 'error',
        message: "❌ That's not right. Try again!"
      });
    }

    setSelectedItem(null);
    setDraggedItem(null);
    setActiveDropZone(null);
  };

  // HTML5 Drag Event Handlers
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', item.id);
  };

  const handleDragOver = (e, categoryId) => {
    e.preventDefault();
    if (activeDropZone !== categoryId) {
      setActiveDropZone(categoryId);
    }
  };

  const handleDragLeave = (e, categoryId) => {
    e.preventDefault();
    if (activeDropZone === categoryId) {
      setActiveDropZone(null);
    }
  };

  const handleDrop = (e, categoryId) => {
    e.preventDefault();
    handleSortAttempt(draggedItem, categoryId);
  };

  // Click-to-Select Touch Fallback Handlers
  const handleItemClick = (item) => {
    if (selectedItem?.id === item.id) {
      setSelectedItem(null);
    } else {
      setSelectedItem(item);
    }
  };

  const handleCategoryClick = (categoryId) => {
    if (selectedItem) {
      handleSortAttempt(selectedItem, categoryId);
    }
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

  // Game Completion Screen
  if (isGameCompleted) {
    const percentage = Math.round((score / maxScore) * 100);

    return (
      <div className="activity-container">
        <div className="activity-header">
          <button type="button" className="btn-back" onClick={onBack}>
            ← Back to Activities
          </button>
        </div>

        <div className="drag-drop-card results-card">
          <div className="result-icon">🎉</div>
          <h1 className="result-title">Amazing!</h1>
          <p className="result-subtitle">You sorted everything correctly across all 4 rounds!</p>

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

      <div className="drag-drop-card">
        {/* Header Section */}
        <div className="game-header">
          <div className="activity-title-group">
            <h1 className="activity-main-title">🧩 Sort It!</h1>
            <p className="activity-instruction">Drag each item into the correct category.</p>
          </div>

          <div className="game-stats">
            <div className="stat-pill">
              <span className="stat-label">Round</span>
              <span className="stat-value">{currentRoundIndex + 1} / {totalRounds}</span>
            </div>
            <div className="stat-pill">
              <span className="stat-label">Round Items</span>
              <span className="stat-value">{roundSortedCount} / {roundTotalItems}</span>
            </div>
            <div className="stat-pill stat-score">
              <span className="stat-label">Score</span>
              <span className="stat-value">{score}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar (Overall Game Progress) */}
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${(totalCompletedCount / totalGameItems) * 100}%` }}
          ></div>
        </div>

        {/* Feedback Display */}
        {feedback && (
          <div className={`dictation-feedback feedback-${feedback.type}`} role="alert">
            {feedback.message}
          </div>
        )}

        {/* Round Complete Banner */}
        {isRoundComplete && (
          <div className="round-complete-box">
            <div className="round-complete-info">
              <h2>🎉 Round {currentRoundIndex + 1} Complete!</h2>
              <p>You earned {roundSortedCount * 10} points in this round.</p>
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

        {/* Available Items Section for Current Round */}
        {!isRoundComplete && (
          <section className="items-section">
            <div className="items-section-header">
              <h2 className="section-label">Round {currentRoundIndex + 1} Items to Sort</h2>
              {selectedItem && (
                <span className="selection-hint">
                  Selected: <strong>{selectedItem.emoji} {selectedItem.name}</strong> — Click a category below!
                </span>
              )}
            </div>

            <div className="items-grid">
              {roundAvailableItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onClick={() => handleItemClick(item)}
                    className={`draggable-item-card ${isSelected ? 'selected' : ''}`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    title="Drag or click to select"
                  >
                    <span className="item-emoji">{item.emoji}</span>
                    <span className="item-name">{item.name}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Drop Zones Section */}
        <section className="drop-zones-section">
          {CATEGORIES.map((category) => {
            const isHovered = activeDropZone === category.id;
            const itemsInCategory = roundSortedItems[category.id] || [];

            return (
              <div
                key={category.id}
                onDragOver={(e) => !isRoundComplete && handleDragOver(e, category.id)}
                onDragLeave={(e) => !isRoundComplete && handleDragLeave(e, category.id)}
                onDrop={(e) => !isRoundComplete && handleDrop(e, category.id)}
                onClick={() => !isRoundComplete && handleCategoryClick(category.id)}
                className={`drop-zone-card ${isHovered ? 'drop-hover' : ''} ${
                  selectedItem ? 'clickable-target' : ''
                }`}
              >
                <div className="drop-zone-header">
                  <span className="category-icon">{category.icon}</span>
                  <h3 className="category-title">{category.title}</h3>
                  <span className="category-count">{itemsInCategory.length} sorted</span>
                </div>

                <div className="sorted-items-grid">
                  {itemsInCategory.length === 0 ? (
                    <div className="drop-zone-placeholder">
                      {selectedItem
                        ? `Click here to place ${selectedItem.name}`
                        : `Drop ${category.title} here`}
                    </div>
                  ) : (
                    itemsInCategory.map((item) => (
                      <div key={item.id} className="sorted-item-badge">
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
  );
}
