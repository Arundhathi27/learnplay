import React, { useState, useEffect } from 'react';
import { createActivity, updateActivity } from '../services/activityStorage';
import MemoryGame from '../activities/MemoryGame';

export default function MemoryEditor({ initialData, onBack }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(
    initialData?.description || 'Match the pairs. Flip two cards at a time.'
  );

  // Pairs List
  const [pairs, setPairs] = useState(() => {
    if (initialData?.content?.pairs && initialData.content.pairs.length > 0) {
      return initialData.content.pairs.map((p, idx) => ({
        id: p.id || `pair_${idx + 1}`,
        cardA: {
          text: p.cards?.[0]?.text || p.cardA || 'Dog',
          image: p.cards?.[0]?.image || null,
          altText: p.cards?.[0]?.altText || 'Card A'
        },
        cardB: {
          text: p.cards?.[1]?.text || p.cardB || '🐶',
          image: p.cards?.[1]?.image || null,
          altText: p.cards?.[1]?.altText || 'Card B'
        }
      }));
    }
    return [
      {
        id: 'pair_1',
        cardA: { text: 'Dog', image: null, altText: 'Dog' },
        cardB: { text: '🐶', image: null, altText: 'Dog Emoji' }
      },
      {
        id: 'pair_2',
        cardA: { text: 'Cat', image: null, altText: 'Cat' },
        cardB: { text: '🐱', image: null, altText: 'Cat Emoji' }
      },
      {
        id: 'pair_3',
        cardA: { text: 'Apple', image: null, altText: 'Apple' },
        cardB: { text: '🍎', image: null, altText: 'Apple Emoji' }
      }
    ];
  });

  // Settings & Feedback
  const [randomize, setRandomize] = useState(initialData?.settings?.randomize ?? true);
  const [correctFeedback, setCorrectFeedback] = useState(
    initialData?.feedback?.correct || 'Great match!'
  );
  const [incorrectFeedback, setIncorrectFeedback] = useState(
    initialData?.feedback?.incorrect || 'Not a match. Try again!'
  );
  const [completionFeedback, setCompletionFeedback] = useState(
    initialData?.feedback?.completion || '🎉 Memory Master!'
  );

  const [validationError, setValidationError] = useState('');
  const [saveStatus, setSaveStatus] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      if (initialData.content?.pairs) {
        setPairs(
          initialData.content.pairs.map((p, idx) => ({
            id: p.id || `pair_${idx + 1}`,
            cardA: {
              text: p.cards?.[0]?.text || p.cardA || '',
              image: p.cards?.[0]?.image || null,
              altText: p.cards?.[0]?.altText || ''
            },
            cardB: {
              text: p.cards?.[1]?.text || p.cardB || '',
              image: p.cards?.[1]?.image || null,
              altText: p.cards?.[1]?.altText || ''
            }
          }))
        );
      }
      if (initialData.settings?.randomize !== undefined) setRandomize(initialData.settings.randomize);
      if (initialData.feedback) {
        setCorrectFeedback(initialData.feedback.correct || 'Great match!');
        setIncorrectFeedback(initialData.feedback.incorrect || 'Not a match. Try again!');
        setCompletionFeedback(initialData.feedback.completion || '🎉 Memory Master!');
      }
    }
  }, [initialData]);

  // Pair Management Handlers
  const handleAddPair = () => {
    const newId = `pair_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setPairs([
      ...pairs,
      {
        id: newId,
        cardA: { text: '', image: null, altText: '' },
        cardB: { text: '', image: null, altText: '' }
      }
    ]);
  };

  const handleUpdateCard = (pairId, cardKey, field, value) => {
    setPairs(
      pairs.map((p) => {
        if (p.id === pairId) {
          return {
            ...p,
            [cardKey]: {
              ...p[cardKey],
              [field]: value
            }
          };
        }
        return p;
      })
    );
  };

  const handleCardImageUpload = (pairId, cardKey, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      handleUpdateCard(pairId, cardKey, 'image', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePair = (id) => {
    if (pairs.length <= 2) {
      setValidationError('Add at least 2 pairs to create a memory game.');
      return;
    }
    setPairs(pairs.filter((p) => p.id !== id));
    setValidationError('');
  };

  const validateForm = () => {
    if (!title.trim()) {
      setValidationError('Please enter an Activity Title.');
      return false;
    }

    if (pairs.length < 2) {
      setValidationError('Please add at least 2 matching pairs to create a Memory Game.');
      return false;
    }

    for (let i = 0; i < pairs.length; i++) {
      const p = pairs[i];
      if (!p.cardA.text.trim() && !p.cardA.image) {
        setValidationError(`Pair ${i + 1} needs content (text or image) for Card A.`);
        return false;
      }
      if (!p.cardB.text.trim() && !p.cardB.image) {
        setValidationError(`Pair ${i + 1} needs content (text or image) for Card B.`);
        return false;
      }
    }

    setValidationError('');
    return true;
  };

  const buildPayload = (statusType) => {
    return {
      type: 'memory-game',
      status: statusType,
      title: title.trim(),
      description: description.trim() || 'Match the pairs. Flip two cards at a time.',
      content: {
        pairs: pairs.map((p) => ({
          id: p.id,
          cards: [
            {
              id: `card_${p.id}_a`,
              text: p.cardA.text.trim(),
              image: p.cardA.image || null,
              altText: p.cardA.altText.trim() || p.cardA.text.trim()
            },
            {
              id: `card_${p.id}_b`,
              text: p.cardB.text.trim(),
              image: p.cardB.image || null,
              altText: p.cardB.altText.trim() || p.cardB.text.trim()
            }
          ]
        }))
      },
      settings: {
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
      statusType === 'draft' ? 'Memory Game saved as draft.' : 'Memory Game published successfully.'
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
          <span className="editor-type-tag">Memory Game Authoring Tool</span>
          <h1 className="editor-main-title">
            {initialData ? 'Edit Memory Game Activity' : 'Create Memory Game Activity'}
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
            <label className="form-label" htmlFor="mem-title">Title *</label>
            <input
              id="mem-title"
              type="text"
              className="editor-input"
              placeholder="e.g. Animals Memory Game"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="mem-desc">Instructions</label>
            <textarea
              id="mem-desc"
              className="editor-textarea"
              rows={3}
              placeholder="Match the pairs. Flip two cards at a time."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Section 2: Matching Pairs Management */}
        <div className="editor-section">
          <h2 className="section-heading">2. Matching Pairs ({pairs.length}) *</h2>
          <p className="editor-info-text">
            Add two matching cards for each pair. Minimum 2 pairs required.
          </p>

          {pairs.map((pair, idx) => (
            <div
              key={pair.id}
              className="card-editor-box"
              style={{ background: '#f8fafc', border: '2px solid #e2e8f0', marginBottom: '1.25rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span className="box-header" style={{ fontSize: '1.05rem' }}>
                  Pair {idx + 1}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleDeletePair(pair.id)}
                >
                  🗑️ Delete Pair
                </button>
              </div>

              {/* Responsive 2-Column Grid for Card A and Card B */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {/* Card A Box */}
                <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#2563eb', marginBottom: '0.75rem' }}>
                    Card A
                  </h4>
                  <div className="form-group">
                    <label className="form-label">Text / Emoji</label>
                    <input
                      type="text"
                      className="editor-input"
                      placeholder="e.g. Dog"
                      value={pair.cardA.text}
                      onChange={(e) => handleUpdateCard(pair.id, 'cardA', 'text', e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginTop: '0.75rem' }}>
                    <label className="form-label">Upload Image (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="editor-input"
                      onChange={(e) => handleCardImageUpload(pair.id, 'cardA', e.target.files[0])}
                    />
                    {pair.cardA.image && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src={pair.cardA.image} alt="Card A preview" style={{ height: '40px', borderRadius: '4px' }} />
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleUpdateCard(pair.id, 'cardA', 'image', null)}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card B Box */}
                <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#2563eb', marginBottom: '0.75rem' }}>
                    Card B
                  </h4>
                  <div className="form-group">
                    <label className="form-label">Text / Emoji</label>
                    <input
                      type="text"
                      className="editor-input"
                      placeholder="e.g. 🐶"
                      value={pair.cardB.text}
                      onChange={(e) => handleUpdateCard(pair.id, 'cardB', 'text', e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginTop: '0.75rem' }}>
                    <label className="form-label">Upload Image (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="editor-input"
                      onChange={(e) => handleCardImageUpload(pair.id, 'cardB', e.target.files[0])}
                    />
                    {pair.cardB.image && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src={pair.cardB.image} alt="Card B preview" style={{ height: '40px', borderRadius: '4px' }} />
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleUpdateCard(pair.id, 'cardB', 'image', null)}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div style={{ marginTop: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddPair}
            >
              + Add Pair
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
                checked={randomize}
                onChange={(e) => setRandomize(e.target.checked)}
              />
              Randomize cards (shuffles card order when game starts)
            </label>
          </div>
        </div>

        {/* Section 4: Feedback */}
        <div className="editor-section">
          <h2 className="section-heading">4. Feedback Messages</h2>

          <div className="form-group">
            <label className="form-label">Correct Match Message</label>
            <input
              type="text"
              className="editor-input"
              value={correctFeedback}
              onChange={(e) => setCorrectFeedback(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Incorrect Match Message</label>
            <input
              type="text"
              className="editor-input"
              value={incorrectFeedback}
              onChange={(e) => setIncorrectFeedback(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">General Completion Message</label>
            <input
              type="text"
              className="editor-input"
              value={completionFeedback}
              onChange={(e) => setCompletionFeedback(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
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
              <h3>🧠 Memory Game Learner Live Preview</h3>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsPreviewOpen(false)}
              >
                ✕ Close Preview
              </button>
            </div>

            <div className="preview-modal-body">
              <MemoryGame
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
