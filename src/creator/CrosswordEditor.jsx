import React, { useState, useEffect, useMemo } from 'react';
import { createActivity, updateActivity } from '../services/activityStorage';
import Crossword, { buildCrosswordLayout } from '../activities/Crossword';

export default function CrosswordEditor({ initialData, onBack }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(
    initialData?.description || 'Solve the clues and complete the crossword.'
  );

  // Words & Clues List
  const [words, setWords] = useState(() => {
    if (initialData?.content?.words && initialData.content.words.length > 0) {
      return initialData.content.words.map((w, idx) => ({
        id: w.id || `word_${idx + 1}`,
        clue: w.clue || '',
        answer: (w.answer || '').toUpperCase().trim(),
        extraClue: w.extraClue || ''
      }));
    }
    return [
      { id: 'w1', clue: 'A small animal that says meow.', answer: 'CAT', extraClue: 'Household pet.' },
      { id: 'w2', clue: 'A friendly animal that barks.', answer: 'DOG', extraClue: 'Man\'s best friend.' },
      { id: 'w3', clue: 'A common red or green fruit.', answer: 'APPLE', extraClue: 'Keeps the doctor away.' }
    ];
  });

  const [solutionWord, setSolutionWord] = useState(
    initialData?.content?.solutionWord || initialData?.solutionWord || 'LEARN'
  );

  // Feedback Messages
  const [correctFeedback, setCorrectFeedback] = useState(
    initialData?.feedback?.correct || 'Great job!'
  );
  const [incorrectFeedback, setIncorrectFeedback] = useState(
    initialData?.feedback?.incorrect || 'Check the highlighted answers and try again.'
  );
  const [completionFeedback, setCompletionFeedback] = useState(
    initialData?.feedback?.completion || '🎉 Crossword completed! Great job!'
  );

  const [validationError, setValidationError] = useState('');
  const [saveStatus, setSaveStatus] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      if (initialData.content?.words) {
        setWords(
          initialData.content.words.map((w, idx) => ({
            id: w.id || `word_${idx + 1}`,
            clue: w.clue || '',
            answer: (w.answer || '').toUpperCase().trim(),
            extraClue: w.extraClue || ''
          }))
        );
      }
      if (initialData.content?.solutionWord || initialData.solutionWord) {
        setSolutionWord(initialData.content?.solutionWord || initialData.solutionWord);
      }
      if (initialData.feedback) {
        setCorrectFeedback(initialData.feedback.correct || 'Great job!');
        setIncorrectFeedback(initialData.feedback.incorrect || 'Check the highlighted answers and try again.');
        setCompletionFeedback(initialData.feedback.completion || '🎉 Crossword completed! Great job!');
      }
    }
  }, [initialData]);

  // Generate live layout preview from valid words
  const validWords = useMemo(() => {
    return words
      .map((w) => ({ ...w, answer: w.answer.toUpperCase().trim() }))
      .filter((w) => w.answer && /^[A-Z]+$/.test(w.answer));
  }, [words]);

  const generatedLayout = useMemo(() => {
    if (validWords.length < 1) return null;
    try {
      return buildCrosswordLayout(validWords);
    } catch (err) {
      console.error('Error generating layout:', err);
      return null;
    }
  }, [validWords]);

  // Word Handlers
  const handleAddWord = () => {
    const newId = `word_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setWords([...words, { id: newId, clue: '', answer: '', extraClue: '' }]);
  };

  const handleUpdateWord = (id, field, value) => {
    setWords(
      words.map((w) => {
        if (w.id === id) {
          const val = field === 'answer' ? value.toUpperCase().trim() : value;
          return { ...w, [field]: val };
        }
        return w;
      })
    );
  };

  const handleDeleteWord = (id) => {
    if (words.length <= 2) {
      setValidationError('Please keep at least 2 words in the crossword.');
      return;
    }
    setWords(words.filter((w) => w.id !== id));
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

    if (words.length < 2) {
      setValidationError('Please add at least 2 words to create a Crossword.');
      return false;
    }

    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (!w.clue.trim()) {
        setValidationError(`Word ${i + 1} needs a clue.`);
        return false;
      }
      if (!w.answer.trim()) {
        setValidationError(`Word ${i + 1} needs an answer.`);
        return false;
      }
      if (!/^[A-Z]+$/.test(w.answer.trim())) {
        setValidationError(`Word ${i + 1} ("${w.answer}") must contain letters only (A-Z).`);
        return false;
      }
    }

    // Check for duplicate answers
    const answersList = words.map((w) => w.answer.trim().toUpperCase());
    const duplicates = answersList.filter((ans, idx) => answersList.indexOf(ans) !== idx);
    if (duplicates.length > 0) {
      setValidationError(`Duplicate answer word "${duplicates[0]}" found in the crossword list.`);
      return false;
    }

    // Check if layout generation placed all words
    if (!generatedLayout || generatedLayout.placedWords.length < validWords.length) {
      const unplaced = validWords.filter(
        (vw) => !generatedLayout?.placedWords.some((pw) => pw.id === vw.id)
      );
      const unplacedNames = unplaced.map((u) => u.answer).join(', ');
      setValidationError(
        `Unable to place word(s) [ ${unplacedNames} ] in the crossword grid. Try adding words with matching letters.`
      );
      return false;
    }

    setValidationError('');
    return true;
  };

  const buildPayload = (statusType) => {
    return {
      type: 'crossword',
      status: statusType,
      title: title.trim(),
      description: description.trim() || 'Solve the clues and complete the crossword.',
      content: {
        words: words.map((w) => ({
          id: w.id,
          clue: w.clue.trim(),
          answer: w.answer.trim().toUpperCase(),
          extraClue: w.extraClue.trim()
        })),
        solutionWord: solutionWord.trim().toUpperCase()
      },
      settings: {},
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
      statusType === 'draft' ? 'Crossword saved as draft.' : 'Crossword published successfully.'
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
          <span className="editor-type-tag">Crossword Authoring Tool</span>
          <h1 className="editor-main-title">
            {initialData ? 'Edit Crossword Activity' : 'Create Crossword Activity'}
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
            <label className="form-label" htmlFor="cw-title">Title *</label>
            <input
              id="cw-title"
              type="text"
              className="editor-input"
              placeholder="e.g. Animal Crossword"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cw-desc">Task Description</label>
            <textarea
              id="cw-desc"
              className="editor-textarea"
              rows={3}
              placeholder="Solve the clues and complete the crossword."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Section 2: Words & Clues */}
        <div className="editor-section">
          <h2 className="section-heading">2. Words & Clues ({words.length}) *</h2>
          <p className="editor-info-text">
            Add each answer and its clue. Answers should be uppercase alphabetic letters (A-Z) only.
          </p>

          {words.map((w, idx) => (
            <div key={w.id} className="card-editor-box" style={{ background: '#f8fafc', border: '2px solid #e2e8f0', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span className="box-header" style={{ fontSize: '1.05rem' }}>
                  Word {idx + 1}
                </span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
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
                    onClick={() => handleDeleteWord(w.id)}
                  >
                    🗑️ Delete Word
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Clue *</label>
                <input
                  type="text"
                  className="editor-input"
                  placeholder="e.g. A small animal that says meow."
                  value={w.clue}
                  onChange={(e) => handleUpdateWord(w.id, 'clue', e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label className="form-label">Answer Word * (Letters A-Z only)</label>
                <input
                  type="text"
                  className="editor-input"
                  placeholder="e.g. CAT"
                  value={w.answer}
                  onChange={(e) => handleUpdateWord(w.id, 'answer', e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label className="form-label">Extra Clue (Optional)</label>
                <input
                  type="text"
                  className="editor-input"
                  placeholder="e.g. Common household pet."
                  value={w.extraClue}
                  onChange={(e) => handleUpdateWord(w.id, 'extraClue', e.target.value)}
                />
              </div>
            </div>
          ))}

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

        {/* Section 3: Live Generated Grid Preview */}
        {generatedLayout && (
          <div className="editor-section">
            <h2 className="section-heading">3. Generated Crossword Grid Live Preview</h2>
            <p className="editor-info-text">
              The puzzle grid is automatically generated from your word intersections.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${generatedLayout.cols}, 36px)`,
                gap: '2px',
                background: '#334155',
                padding: '10px',
                borderRadius: '10px',
                width: 'fit-content',
                marginTop: '1rem'
              }}
            >
              {generatedLayout.grid.map((row, r) =>
                row.map((cell, c) => (
                  <div
                    key={`${r}-${c}`}
                    style={{
                      width: '36px',
                      height: '36px',
                      background: cell ? '#ffffff' : '#1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '0.9rem',
                      color: '#2563eb',
                      borderRadius: '4px'
                    }}
                  >
                    {cell ? cell.char : ''}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Section 4: Overall Solution Word */}
        <div className="editor-section">
          <h2 className="section-heading">4. Overall Solution Word (Optional)</h2>
          <div className="form-group">
            <label className="form-label">Overall Solution Word</label>
            <input
              type="text"
              className="editor-input"
              placeholder="e.g. LEARN"
              value={solutionWord}
              onChange={(e) => setSolutionWord(e.target.value.toUpperCase())}
            />
            <p className="editor-info-text">
              Optional. Revealed when the learner completes the crossword puzzle.
            </p>
          </div>
        </div>

        {/* Section 5: Feedback */}
        <div className="editor-section">
          <h2 className="section-heading">5. Feedback Messages</h2>

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
              <h3>✏️ Crossword Learner Live Preview</h3>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsPreviewOpen(false)}
              >
                ✕ Close Preview
              </button>
            </div>

            <div className="preview-modal-body">
              <Crossword
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
