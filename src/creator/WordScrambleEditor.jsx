import React, { useState, useEffect } from 'react';
import { createActivity, updateActivity } from '../services/activityStorage';
import WordScramble from '../activities/WordScramble';

export default function WordScrambleEditor({ initialData, onBack }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(
    initialData?.description || 'Rearrange the letters to make the correct word.'
  );
  const [words, setWords] = useState(
    initialData?.content?.words || ['ELEPHANT', 'TIGER', 'RABBIT', 'BUTTERFLY']
  );
  const [difficulty, setDifficulty] = useState(
    initialData?.settings?.difficulty || initialData?.content?.difficulty || 'Medium'
  );
  const [randomize, setRandomize] = useState(initialData?.settings?.randomize ?? true);

  const [correctFeedback, setCorrectFeedback] = useState(
    initialData?.feedback?.correct || 'Great job!'
  );
  const [incorrectFeedback, setIncorrectFeedback] = useState(
    initialData?.feedback?.incorrect || 'Not quite! Try again.'
  );
  const [completionFeedback, setCompletionFeedback] = useState(
    initialData?.feedback?.completion || '🎉 Word Master!'
  );

  const [validationError, setValidationError] = useState('');
  const [saveStatus, setSaveStatus] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      if (initialData.content?.words) setWords(initialData.content.words);
      if (initialData.settings?.difficulty || initialData.content?.difficulty) {
        setDifficulty(initialData.settings?.difficulty || initialData.content?.difficulty);
      }
      if (initialData.settings?.randomize !== undefined) setRandomize(initialData.settings.randomize);
      if (initialData.feedback) {
        setCorrectFeedback(initialData.feedback.correct || 'Great job!');
        setIncorrectFeedback(initialData.feedback.incorrect || 'Not quite! Try again.');
        setCompletionFeedback(initialData.feedback.completion || '🎉 Word Master!');
      }
    }
  }, [initialData]);

  const handleWordChange = (index, value) => {
    const updated = [...words];
    updated[index] = value.toUpperCase();
    setWords(updated);
  };

  const handleAddWord = () => {
    setWords([...words, '']);
  };

  const handleDeleteWord = (index) => {
    if (words.length <= 1) {
      setValidationError('At least one word is required.');
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
      setValidationError('Please add at least one word.');
      return false;
    }

    for (let i = 0; i < words.length; i++) {
      if (!words[i].trim()) {
        setValidationError(`Word ${i + 1} cannot be empty.`);
        return false;
      }
    }

    // Check for duplicates
    const upperWords = words.map((w) => w.trim().toUpperCase());
    const duplicates = upperWords.filter((w, idx) => upperWords.indexOf(w) !== idx);
    if (duplicates.length > 0) {
      setValidationError(`Duplicate word "${duplicates[0]}" found in the list.`);
      return false;
    }

    setValidationError('');
    return true;
  };

  const buildPayload = (statusType) => {
    const cleanWords = words.map((w) => w.trim().toUpperCase()).filter(Boolean);
    return {
      type: 'word-scramble',
      status: statusType,
      title: title.trim(),
      description: description.trim() || 'Rearrange the letters to make the correct word.',
      content: {
        words: cleanWords
      },
      settings: {
        difficulty,
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
      statusType === 'draft' ? 'Word Scramble saved as draft.' : 'Word Scramble published successfully.'
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
          <span className="editor-type-tag">Word Scramble Authoring Tool</span>
          <h1 className="editor-main-title">
            {initialData ? 'Edit Word Scramble' : 'Create Word Scramble'}
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
            <label className="form-label" htmlFor="ws-title">Title *</label>
            <input
              id="ws-title"
              type="text"
              className="editor-input"
              placeholder="e.g. Animals Word Scramble"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ws-desc">Instructions</label>
            <textarea
              id="ws-desc"
              className="editor-textarea"
              rows={3}
              placeholder="Rearrange the letters to make the correct word."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Section 2: Words List */}
        <div className="editor-section">
          <h2 className="section-heading">2. Target Words ({words.length}) *</h2>
          <p className="editor-info-text">
            Add the words learners will unscramble. Letters will automatically be uppercase.
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
                  placeholder="e.g. ELEPHANT"
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
          <h2 className="section-heading">3. Settings</h2>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Difficulty Level</label>
            <select
              className="editor-input"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={randomize}
                onChange={(e) => setRandomize(e.target.checked)}
              />
              Randomize words (shuffles question order when learner starts)
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
              <h3>🔤 Word Scramble Learner Live Preview</h3>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsPreviewOpen(false)}
              >
                ✕ Close Preview
              </button>
            </div>

            <div className="preview-modal-body">
              <WordScramble
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
