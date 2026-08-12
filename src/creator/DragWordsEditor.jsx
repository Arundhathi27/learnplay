import React, { useState, useEffect, useRef } from 'react';
import { createActivity, updateActivity } from '../services/activityStorage';
import DragTheWords, { parseDragTheWordsText } from '../activities/DragTheWords';

export default function DragWordsEditor({ initialData, onBack }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(
    initialData?.description || 'Drag the correct words into the blanks.'
  );
  const [rawText, setRawText] = useState(
    initialData?.content?.text || initialData?.text || 'Oslo is the capital of *Norway*, Stockholm is the capital of *Sweden*.'
  );

  // Distractors List
  const [distractors, setDistractors] = useState(
    initialData?.content?.distractors || initialData?.distractors || ['Reykjavik', 'Helsinki', 'Berlin']
  );

  // Settings & Feedback
  const [randomize, setRandomize] = useState(initialData?.settings?.randomize ?? true);
  const [showInstructions, setShowInstructions] = useState(initialData?.settings?.showInstructions ?? true);

  const [correctFeedback, setCorrectFeedback] = useState(
    initialData?.feedback?.correct || 'Great job!'
  );
  const [incorrectFeedback, setIncorrectFeedback] = useState(
    initialData?.feedback?.incorrect || 'That\'s not the correct word. Try again!'
  );
  const [completionFeedback, setCompletionFeedback] = useState(
    initialData?.feedback?.completion || '🎉 Excellent! You completed the activity.'
  );

  const [validationError, setValidationError] = useState('');
  const [saveStatus, setSaveStatus] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const textareaRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      if (initialData.content?.text || initialData.text) {
        setRawText(initialData.content?.text || initialData.text);
      }
      if (initialData.content?.distractors || initialData.distractors) {
        setDistractors(initialData.content?.distractors || initialData.distractors);
      }
      if (initialData.settings) {
        if (initialData.settings.randomize !== undefined) setRandomize(initialData.settings.randomize);
        if (initialData.settings.showInstructions !== undefined) setShowInstructions(initialData.settings.showInstructions);
      }
      if (initialData.feedback) {
        setCorrectFeedback(initialData.feedback.correct || 'Great job!');
        setIncorrectFeedback(initialData.feedback.incorrect || 'That\'s not the correct word. Try again!');
        setCompletionFeedback(initialData.feedback.completion || '🎉 Excellent! You completed the activity.');
      }
    }
  }, [initialData]);

  // Parse marked answers dynamically from rawText (*word* syntax)
  const parsedResult = React.useMemo(() => {
    try {
      return parseDragTheWordsText(rawText);
    } catch {
      return { segments: [], blanks: [] };
    }
  }, [rawText]);

  // Helper to mark selected text in textarea as an answer (*word*)
  const handleMarkSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = rawText.substring(start, end).trim();

    if (!selectedText) {
      setValidationError('Please highlight/select a word in the activity text to mark it as an answer.');
      return;
    }

    if (selectedText.includes('*')) {
      setValidationError('Selection already contains asterisks (*).');
      return;
    }

    const before = rawText.substring(0, start);
    const after = rawText.substring(end);
    const newText = `${before}*${selectedText}*${after}`;
    setRawText(newText);
    setValidationError('');
  };

  const handleRemoveMarkedAnswer = (blankIndex) => {
    let count = 0;
    const newText = rawText.replace(/\*(.*?)\*/g, (match, word) => {
      if (count === blankIndex) {
        count++;
        return word; // strip asterisks
      }
      count++;
      return match;
    });
    setRawText(newText);
  };

  // Distractor Management Handlers
  const handleAddDistractor = () => {
    setDistractors([...distractors, '']);
  };

  const handleUpdateDistractor = (index, value) => {
    const updated = [...distractors];
    updated[index] = value;
    setDistractors(updated);
  };

  const handleDeleteDistractor = (index) => {
    setDistractors(distractors.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!title.trim()) {
      setValidationError('Please enter an Activity Title.');
      return false;
    }

    if (!description.trim()) {
      setValidationError('Please enter a Task Description.');
      return false;
    }

    if (!rawText.trim()) {
      setValidationError('Please enter the Activity Text.');
      return false;
    }

    if (parsedResult.blanks.length === 0) {
      setValidationError('Please mark at least one word as an answer by highlighting it and clicking "Mark Selected Word as Answer" (or using *word* syntax).');
      return false;
    }

    const correctWords = parsedResult.blanks.map((b) => b.answer.trim().toLowerCase());
    const cleanDistractors = distractors.map((d) => d.trim()).filter(Boolean);

    for (let d of cleanDistractors) {
      if (correctWords.includes(d.toLowerCase())) {
        setValidationError(`Distractor "${d}" is identical to a correct marked answer.`);
        return false;
      }
    }

    setValidationError('');
    return true;
  };

  const buildPayload = (statusType) => {
    const cleanDistractors = distractors.map((d) => d.trim()).filter(Boolean);
    return {
      type: 'drag-words',
      status: statusType,
      title: title.trim(),
      description: description.trim(),
      content: {
        text: rawText.trim(),
        distractors: cleanDistractors
      },
      settings: {
        randomize,
        showInstructions
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
      statusType === 'draft' ? 'Drag the Words saved as draft.' : 'Drag the Words published successfully.'
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
          <span className="editor-type-tag">Drag the Words Authoring Tool</span>
          <h1 className="editor-main-title">
            {initialData ? 'Edit Drag the Words' : 'Create Drag the Words'}
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
            <label className="form-label" htmlFor="dtw-title">Title *</label>
            <input
              id="dtw-title"
              type="text"
              className="editor-input"
              placeholder="e.g. European Capitals"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="dtw-desc">Task Description *</label>
            <textarea
              id="dtw-desc"
              className="editor-textarea"
              rows={3}
              placeholder="Drag the correct words into the blanks."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Section 2: Activity Text & Marked Words */}
        <div className="editor-section">
          <h2 className="section-heading">2. Activity Text & Answer Words *</h2>
          <p className="editor-info-text">
            Type your text below. Highlight any word and click <strong>🎯 Mark Selected Word as Answer</strong> to create a drop blank. You can also manually enclose words with <code>*word*</code>.
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="dtw-text">Activity Text</label>
            <textarea
              id="dtw-text"
              ref={textareaRef}
              className="editor-textarea"
              rows={4}
              placeholder="Oslo is the capital of *Norway*, Stockholm is the capital of *Sweden*."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
            <div style={{ marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleMarkSelection}
              >
                🎯 Mark Selected Word as Answer
              </button>
            </div>
          </div>

          {/* Marked Answers Preview */}
          <div style={{ marginTop: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.5rem' }}>
              Marked Target Blank Answers ({parsedResult.blanks.length})
            </h3>
            {parsedResult.blanks.length > 0 ? (
              <div className="words-editor-list">
                {parsedResult.blanks.map((b, idx) => (
                  <div key={idx} className="dynamic-input-row" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '800', width: '4.5rem', color: '#2563eb' }}>
                      Blank #{idx + 1}
                    </span>
                    <span className="status-pill" style={{ backgroundColor: '#dbeafe', color: '#1e40af', fontWeight: '700' }}>
                      {b.answer}
                    </span>
                    <span style={{ flex: 1 }} />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleRemoveMarkedAnswer(idx)}
                      title="Remove blank target"
                    >
                      🗑️ Remove Blank
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="editor-info-text">⚠️ No words marked as blanks yet. Highlight a word in the text above!</p>
            )}
          </div>
        </div>

        {/* Section 3: Incorrect / Distractor Words */}
        <div className="editor-section">
          <h2 className="section-heading">3. Incorrect / Distractor Words ({distractors.length})</h2>
          <p className="editor-info-text">
            Add extra distractor words that will appear in the learner's word bank but are not correct answers.
          </p>

          {distractors.map((dist, idx) => (
            <div key={idx} className="dynamic-input-row" style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: '800', width: '6rem', color: '#64748b' }}>
                Distractor #{idx + 1}
              </span>
              <input
                type="text"
                className="editor-input"
                placeholder="e.g. Reykjavik"
                value={dist}
                onChange={(e) => handleUpdateDistractor(idx, e.target.value)}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleDeleteDistractor(idx)}
              >
                🗑️ Delete
              </button>
            </div>
          ))}

          <div style={{ marginTop: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddDistractor}
            >
              + Add Distractor Word
            </button>
          </div>
        </div>

        {/* Section 4: Settings */}
        <div className="editor-section">
          <h2 className="section-heading">4. Settings</h2>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={randomize}
                onChange={(e) => setRandomize(e.target.checked)}
              />
              Randomize words (shuffles word bank order when activity starts)
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showInstructions}
                onChange={(e) => setShowInstructions(e.target.checked)}
              />
              Show instructions (displays task instructions banner to learner)
            </label>
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
              <h3>📝 Drag the Words Learner Live Preview</h3>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsPreviewOpen(false)}
              >
                ✕ Close Preview
              </button>
            </div>

            <div className="preview-modal-body">
              <DragTheWords
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
