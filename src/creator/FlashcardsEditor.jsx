import React, { useState, useEffect } from 'react';
import { createActivity, updateActivity } from '../services/activityStorage';
import Flashcards from '../activities/Flashcards';

export default function FlashcardsEditor({ initialData, onBack }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(
    initialData?.description || 'Test your knowledge with interactive study flashcards.'
  );

  // Cards List
  const [cards, setCards] = useState(() => {
    if (initialData?.content?.cards && initialData.content.cards.length > 0) {
      return initialData.content.cards.map((c, idx) => ({
        id: c.id || `card_${idx + 1}`,
        question: c.question || '',
        answer: c.answer || '',
        image: c.image || null,
        altText: c.altText || ''
      }));
    }
    return [
      { id: 'c1', question: 'What animal says meow?', answer: 'Cat', image: null, altText: 'Cat' },
      { id: 'c2', question: 'What is 2 + 2?', answer: '4', image: null, altText: 'Four' },
      { id: 'c3', question: 'What color is the sky?', answer: 'Blue', image: null, altText: 'Blue' }
    ];
  });

  // Settings
  const [requireInput, setRequireInput] = useState(initialData?.settings?.requireInput ?? true);
  const [caseSensitive, setCaseSensitive] = useState(initialData?.settings?.caseSensitive ?? false);
  const [randomize, setRandomize] = useState(initialData?.settings?.randomize ?? true);

  // Feedback Messages
  const [correctFeedback, setCorrectFeedback] = useState(
    initialData?.feedback?.correct || 'Correct!'
  );
  const [incorrectFeedback, setIncorrectFeedback] = useState(
    initialData?.feedback?.incorrect || 'Not quite. Try again.'
  );
  const [completionFeedback, setCompletionFeedback] = useState(
    initialData?.feedback?.completion || 'Great job! You completed the flashcards.'
  );

  const [validationError, setValidationError] = useState('');
  const [saveStatus, setSaveStatus] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      if (initialData.content?.cards) {
        setCards(
          initialData.content.cards.map((c, idx) => ({
            id: c.id || `card_${idx + 1}`,
            question: c.question || '',
            answer: c.answer || '',
            image: c.image || null,
            altText: c.altText || ''
          }))
        );
      }
      if (initialData.settings) {
        if (initialData.settings.requireInput !== undefined) setRequireInput(initialData.settings.requireInput);
        if (initialData.settings.caseSensitive !== undefined) setCaseSensitive(initialData.settings.caseSensitive);
        if (initialData.settings.randomize !== undefined) setRandomize(initialData.settings.randomize);
      }
      if (initialData.feedback) {
        setCorrectFeedback(initialData.feedback.correct || 'Correct!');
        setIncorrectFeedback(initialData.feedback.incorrect || 'Not quite. Try again.');
        setCompletionFeedback(initialData.feedback.completion || 'Great job! You completed the flashcards.');
      }
    }
  }, [initialData]);

  // Card Management Handlers
  const handleAddCard = () => {
    const newId = `card_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setCards([...cards, { id: newId, question: '', answer: '', image: null, altText: '' }]);
  };

  const handleUpdateCard = (id, field, value) => {
    setCards(cards.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const handleImageUpload = (id, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      handleUpdateCard(id, 'image', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteCard = (id) => {
    if (cards.length <= 1) {
      setValidationError('Please keep at least one card in the flashcard deck.');
      return;
    }
    setCards(cards.filter((c) => c.id !== id));
    setValidationError('');
  };

  const handleMoveCard = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= cards.length) return;
    const updated = [...cards];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setCards(updated);
  };

  const validateForm = () => {
    if (!title.trim()) {
      setValidationError('Please enter an Activity Title.');
      return false;
    }

    if (cards.length === 0) {
      setValidationError('Please add at least one card.');
      return false;
    }

    for (let i = 0; i < cards.length; i++) {
      if (!cards[i].question.trim()) {
        setValidationError(`Card ${i + 1} needs a question.`);
        return false;
      }
      if (!cards[i].answer.trim()) {
        setValidationError(`Card ${i + 1} needs an answer.`);
        return false;
      }
    }

    setValidationError('');
    return true;
  };

  const buildPayload = (statusType) => {
    return {
      type: 'flashcards',
      status: statusType,
      title: title.trim(),
      description: description.trim() || 'Test your knowledge with interactive study flashcards.',
      content: {
        cards: cards.map((c) => ({
          id: c.id,
          question: c.question.trim(),
          answer: c.answer.trim(),
          image: c.image || null,
          altText: c.altText.trim() || c.answer.trim()
        }))
      },
      settings: {
        requireInput,
        caseSensitive,
        randomize
      },
      feedback: {
        correct: correctFeedback.trim(),
        incorrect: incorrectFeedback.trim(),
        completion: completionFeedback.trim()
      }
    };
  };

  const handleSave = (statusType) => {
    if (!validateForm()) return;

    const payload = buildPayload(statusType);
    if (initialData?.id) {
      updateActivity(initialData.id, payload);
    } else {
      createActivity(payload);
    }

    setSaveStatus(
      statusType === 'draft' ? 'Flashcards saved as draft.' : 'Flashcards published successfully.'
    );
    setTimeout(() => {
      setSaveStatus(null);
    }, 4000);
  };

  const getLivePreviewData = () => {
    return buildPayload('preview');
  };

  return (
    <div className="editor-container">
      {/* Editor Header */}
      <div className="editor-header">
        <button type="button" className="btn-back" onClick={onBack}>
          ← Back to Activity Types
        </button>

        <div className="editor-title-block">
          <span className="editor-type-tag">Flashcards Authoring Tool</span>
          <h1 className="editor-main-title">
            {initialData ? 'Edit Flashcards Activity' : 'Create Flashcards Activity'}
          </h1>
        </div>
      </div>

      {/* Inline Alerts */}
      {validationError && (
        <div className="editor-alert alert-error" role="alert">
          ⚠️ {validationError}
        </div>
      )}

      {saveStatus && (
        <div className="editor-alert alert-success" role="alert">
          ✅ {saveStatus}
        </div>
      )}

      <div className="editor-card">
        {/* Section 1: Basic Information */}
        <div className="editor-section">
          <h2 className="section-heading">1. Basic Information</h2>

          <div className="form-group">
            <label className="form-label" htmlFor="fc-title">Title *</label>
            <input
              id="fc-title"
              type="text"
              className="editor-input"
              placeholder="e.g. Basic English Flashcards"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="fc-desc">Task Description</label>
            <textarea
              id="fc-desc"
              className="editor-textarea"
              rows={3}
              placeholder="Learn these words using flashcards."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Section 2: Cards List */}
        <div className="editor-section">
          <h2 className="section-heading">2. Flashcards ({cards.length}) *</h2>
          <p className="editor-info-text">
            Add a question and answer for each card. Accepted alternative answers can be separated with <code>/</code> (e.g. <code>Cat / Kitten</code>).
          </p>

          {cards.map((card, idx) => (
            <div key={card.id} className="card-editor-box" style={{ background: '#f8fafc', border: '2px solid #e2e8f0', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span className="box-header" style={{ fontSize: '1.05rem' }}>
                  Card {idx + 1}
                </span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleMoveCard(idx, -1)}
                    disabled={idx === 0}
                    title="Move Up"
                  >
                    ⬆️
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleMoveCard(idx, 1)}
                    disabled={idx === cards.length - 1}
                    title="Move Down"
                  >
                    ⬇️
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDeleteCard(card.id)}
                  >
                    🗑️ Delete Card
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Question *</label>
                <input
                  type="text"
                  className="editor-input"
                  placeholder="e.g. What animal says meow?"
                  value={card.question}
                  onChange={(e) => handleUpdateCard(card.id, 'question', e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label className="form-label">Answer * (Use / for alternatives)</label>
                <input
                  type="text"
                  className="editor-input"
                  placeholder="e.g. Cat / Kitten"
                  value={card.answer}
                  onChange={(e) => handleUpdateCard(card.id, 'answer', e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label className="form-label">Upload Card Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="editor-input"
                  onChange={(e) => handleImageUpload(card.id, e.target.files[0])}
                />
                {card.image && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={card.image} alt="Card preview" style={{ height: '50px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleUpdateCard(card.id, 'image', null)}
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label className="form-label">Alternative Text</label>
                <input
                  type="text"
                  className="editor-input"
                  placeholder="e.g. Cat"
                  value={card.altText}
                  onChange={(e) => handleUpdateCard(card.id, 'altText', e.target.value)}
                />
              </div>
            </div>
          ))}

          <div style={{ marginTop: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddCard}
            >
              + Add Card
            </button>
          </div>
        </div>

        {/* Section 3: Settings */}
        <div className="editor-section">
          <h2 className="section-heading">3. Settings</h2>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={requireInput}
                onChange={(e) => setRequireInput(e.target.checked)}
              />
              Require user input (learner types answer before solution reveal)
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
              />
              Case sensitive (enforces exact case matching)
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={randomize}
                onChange={(e) => setRandomize(e.target.checked)}
              />
              Randomize cards (shuffles deck order when study starts)
            </label>
          </div>
        </div>

        {/* Section 4: Feedback */}
        <div className="editor-section">
          <h2 className="section-heading">4. Feedback Messages</h2>

          <div className="form-group">
            <label className="form-label">Correct Answer Feedback</label>
            <input
              type="text"
              className="editor-input"
              value={correctFeedback}
              onChange={(e) => setCorrectFeedback(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Incorrect Answer Feedback</label>
            <input
              type="text"
              className="editor-input"
              value={incorrectFeedback}
              onChange={(e) => setIncorrectFeedback(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Completion Message</label>
            <input
              type="text"
              className="editor-input"
              value={completionFeedback}
              onChange={(e) => setCompletionFeedback(e.target.value)}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="editor-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsPreviewOpen(true)}
          >
            👁️ Preview
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleSave('draft')}
          >
            💾 Save Draft
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleSave('published')}
          >
            🚀 Publish
          </button>
        </div>
      </div>

      {/* Live Learner Preview Modal */}
      {isPreviewOpen && (
        <div className="preview-modal-overlay">
          <div className="preview-modal-content">
            <div className="preview-modal-header">
              <h3>🎴 Flashcards Learner Live Preview</h3>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsPreviewOpen(false)}
              >
                ✕ Close Preview
              </button>
            </div>

            <div className="preview-modal-body">
              <Flashcards
                data={getLivePreviewData()}
                onBack={() => setIsPreviewOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
