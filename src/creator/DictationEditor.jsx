import React, { useState, useEffect } from 'react';
import { createActivity, updateActivity } from '../services/activityStorage';
import Dictation from '../activities/Dictation';

export default function DictationEditor({ initialData, onBack }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || 'Listen carefully and type what you hear.');
  const [words, setWords] = useState(initialData?.content?.words || ['Elephant', 'Tiger', 'Rabbit']);
  const [randomize, setRandomize] = useState(initialData?.settings?.randomize ?? false);
  const [correctFeedback, setCorrectFeedback] = useState(initialData?.feedback?.correct || 'Great job!');
  const [incorrectFeedback, setIncorrectFeedback] = useState(initialData?.feedback?.incorrect || 'Listen again and try!');

  const [validationError, setValidationError] = useState('');
  const [saveStatus, setSaveStatus] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      if (initialData.content?.words) setWords(initialData.content.words);
      if (initialData.settings?.randomize !== undefined) setRandomize(initialData.settings.randomize);
      if (initialData.feedback) {
        setCorrectFeedback(initialData.feedback.correct || 'Great job!');
        setIncorrectFeedback(initialData.feedback.incorrect || 'Listen again and try!');
      }
    }
  }, [initialData]);

  const handleWordChange = (index, value) => {
    const updated = [...words];
    updated[index] = value;
    setWords(updated);
  };

  const handleAddWord = () => {
    setWords([...words, '']);
  };

  const handleDeleteWord = (index) => {
    if (words.length <= 1) {
      setValidationError('Dictation requires at least one word.');
      return;
    }
    setWords(words.filter((_, i) => i !== index));
    setValidationError('');
  };

  const handleMoveWord = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= words.length) return;
    const updated = [...words];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setWords(updated);
  };

  const validateForm = () => {
    if (!title.trim()) {
      setValidationError('Please enter an Activity Title.');
      return false;
    }

    const cleanWords = words.map((w) => w.trim()).filter(Boolean);
    if (cleanWords.length === 0) {
      setValidationError('Please add at least one valid word.');
      return false;
    }

    // Check if any row is currently empty
    for (let i = 0; i < words.length; i++) {
      if (!words[i].trim()) {
        setValidationError(`Word ${i + 1} cannot be empty.`);
        return false;
      }
    }

    setValidationError('');
    return true;
  };

  const buildPayload = (statusType) => {
    const cleanWords = words.map((w) => w.trim()).filter(Boolean);
    return {
      type: 'dictation',
      status: statusType,
      title: title.trim(),
      description: description.trim() || 'Listen carefully and type what you hear.',
      content: {
        words: cleanWords
      },
      settings: {
        randomize
      },
      feedback: {
        correct: correctFeedback.trim() || 'Great job!',
        incorrect: incorrectFeedback.trim() || 'Listen again and try!'
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

    setSaveStatus(statusType === 'draft' ? 'Dictation saved as draft.' : 'Dictation published successfully.');
    setTimeout(() => {
      setSaveStatus(null);
    }, 4000);
  };

  // Construct unsaved live preview object
  const getLivePreviewData = () => {
    const cleanWords = words.map((w) => w.trim()).filter(Boolean);
    return {
      type: 'dictation',
      title: title.trim() || 'Dictation Preview',
      description: description.trim() || 'Listen carefully and type what you hear.',
      content: {
        words: cleanWords.length > 0 ? cleanWords : ['Elephant', 'Tiger']
      },
      settings: {
        randomize
      },
      feedback: {
        correct: correctFeedback,
        incorrect: incorrectFeedback
      }
    };
  };

  return (
    <div className="editor-container">
      {/* Editor Header */}
      <div className="editor-header">
        <button type="button" className="btn-back" onClick={onBack}>
          ← Back to Activity Types
        </button>

        <div className="editor-title-block">
          <span className="editor-type-tag">Dictation Authoring Tool</span>
          <h1 className="editor-main-title">
            {initialData ? 'Edit Dictation Activity' : 'Create Dictation Activity'}
          </h1>
        </div>
      </div>

      {/* Inline Validation & Save Status Alerts */}
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
        {/* Section 1: General Info */}
        <div className="editor-section">
          <h2 className="section-heading">General Information</h2>

          <div className="form-group">
            <label className="form-label" htmlFor="dict-title">Title *</label>
            <input
              id="dict-title"
              type="text"
              className="editor-input"
              placeholder="e.g. Animals Dictation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="dict-desc">Instructions</label>
            <textarea
              id="dict-desc"
              className="editor-textarea"
              rows={3}
              placeholder="Listen carefully and type what you hear."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Section 2: Words List */}
        <div className="editor-section">
          <h2 className="section-heading">Words</h2>
          <p className="editor-info-text">
            🦉 The Vblivestream owl will dictate these words to the learner.
          </p>

          <div className="words-editor-list">
            {words.map((word, idx) => (
              <div key={idx} className="dynamic-input-row" style={{ marginBottom: '0.75rem' }}>
                <span className="word-row-number" style={{ minWidth: '4.5rem', fontWeight: '800', color: '#2563eb' }}>
                  Word {idx + 1}
                </span>
                <input
                  type="text"
                  className="editor-input"
                  placeholder="e.g. Elephant"
                  value={word}
                  onChange={(e) => handleWordChange(idx, e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleMoveWord(idx, -1)}
                  disabled={idx === 0}
                  title="Move Up"
                >
                  ⬆️
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleMoveWord(idx, 1)}
                  disabled={idx === words.length - 1}
                  title="Move Down"
                >
                  ⬇️
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleDeleteWord(idx)}
                  title="Delete Word"
                >
                  🗑️ Delete
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddWord}
            >
              + Add Word
            </button>
          </div>
        </div>

        {/* Section 3: Settings */}
        <div className="editor-section">
          <h2 className="section-heading">Settings</h2>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={randomize}
                onChange={(e) => setRandomize(e.target.checked)}
              />
              Randomize words (shuffles word order when learner starts)
            </label>
          </div>
        </div>

        {/* Section 4: Feedback Messages */}
        <div className="editor-section">
          <h2 className="section-heading">Feedback</h2>

          <div className="form-group">
            <label className="form-label" htmlFor="dict-fb-correct">Correct Answer Message</label>
            <input
              id="dict-fb-correct"
              type="text"
              className="editor-input"
              value={correctFeedback}
              onChange={(e) => setCorrectFeedback(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="dict-fb-incorrect">Incorrect Answer Message</label>
            <input
              id="dict-fb-incorrect"
              type="text"
              className="editor-input"
              value={incorrectFeedback}
              onChange={(e) => setIncorrectFeedback(e.target.value)}
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
              <h3>🦉 Dictation Learner Live Preview</h3>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsPreviewOpen(false)}
              >
                ✕ Close Preview
              </button>
            </div>

            <div className="preview-modal-body">
              <Dictation
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
