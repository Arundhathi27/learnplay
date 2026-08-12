import React, { useState, useEffect } from 'react';
import { createActivity, updateActivity } from '../services/activityStorage';

// Learner Activity Preview Components
import Dictation from '../activities/Dictation';
import DragDrop from '../activities/DragDrop';
import Hotspot from '../activities/Hotspot';
import FindHotspot from '../activities/FindHotspot';
import MemoryGame from '../activities/MemoryGame';
import WordScramble from '../activities/WordScramble';
import Flashcards from '../activities/Flashcards';
import Crossword from '../activities/Crossword';
import DragTheWords from '../activities/DragTheWords';

import DictationEditor from './DictationEditor';
import DragDropEditor from './DragDropEditor';
import MultipleHotspotEditor from './MultipleHotspotEditor';
import FindHotspotEditor from './FindHotspotEditor';
import MemoryEditor from './MemoryEditor';
import WordScrambleEditor from './WordScrambleEditor';
import FlashcardsEditor from './FlashcardsEditor';
import CrosswordEditor from './CrosswordEditor';
import DragWordsEditor from './DragWordsEditor';

export default function ActivityEditor({ type, initialData, onBack }) {
  if (type === 'dictation') {
    return <DictationEditor initialData={initialData} onBack={onBack} />;
  }

  if (type === 'drag-drop') {
    return <DragDropEditor initialData={initialData} onBack={onBack} />;
  }

  if (type === 'find-multiple-hotspot' || type === 'multiple-hotspot' || type === 'find-multiple-hotspots') {
    return <MultipleHotspotEditor initialData={initialData} onBack={onBack} />;
  }

  if (type === 'find-hotspot') {
    return <FindHotspotEditor initialData={initialData} onBack={onBack} />;
  }

  if (type === 'memory' || type === 'memory-game') {
    return <MemoryEditor initialData={initialData} onBack={onBack} />;
  }

  if (type === 'word-scramble') {
    return <WordScrambleEditor initialData={initialData} onBack={onBack} />;
  }

  if (type === 'flashcards') {
    return <FlashcardsEditor initialData={initialData} onBack={onBack} />;
  }

  if (type === 'crossword') {
    return <CrosswordEditor initialData={initialData} onBack={onBack} />;
  }

  if (type === 'drag-words' || type === 'drag-the-words') {
    return <DragWordsEditor initialData={initialData} onBack={onBack} />;
  }

  // General Fields
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [correctFeedback, setCorrectFeedback] = useState(initialData?.feedback?.correct || '🎉 Great job!');
  const [incorrectFeedback, setIncorrectFeedback] = useState(initialData?.feedback?.incorrect || '❌ Not quite right. Try again!');

  // Settings
  const [randomize, setRandomize] = useState(true);
  const [requireInput, setRequireInput] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [difficulty, setDifficulty] = useState('Easy');
  const [solutionWord, setSolutionWord] = useState('');

  // Activity Specific Content States
  const [words, setWords] = useState(['Elephant', 'Tiger', 'Rabbit']);
  const [dropZones, setDropZones] = useState(['Fruits', 'Animals']);
  const [dropItems, setDropItems] = useState([
    { id: '1', name: 'Apple', targetZone: 'Fruits' },
    { id: '2', name: 'Dog', targetZone: 'Animals' }
  ]);
  const [hotspots, setHotspots] = useState([
    { id: 1, x: 50, y: 40, isCorrect: true, label: 'Target 1' }
  ]);
  const [singleHotspot, setSingleHotspot] = useState({ x: 52, y: 38, radius: 10 });
  const [memoryPairs, setMemoryPairs] = useState([
    { id: 'p1', cardA: '🍎', cardB: 'Apple' },
    { id: 'p2', cardB: '🐶', cardA: 'Dog' }
  ]);
  const [flashcardList, setFlashcardList] = useState([
    { id: 'c1', question: 'What animal says meow?', answer: 'Cat', emoji: '🐱', altText: 'Cat' }
  ]);
  const [crosswordList, setCrosswordList] = useState([
    { id: 'w1', clue: 'A small animal that says meow.', answer: 'CAT' },
    { id: 'w2', clue: 'A common red or green fruit.', answer: 'APPLE' }
  ]);
  const [dragWordsText, setDragWordsText] = useState('The capital of France is *Paris*. The capital of India is *Delhi*.');
  const [distractors, setDistractors] = useState(['London', 'Berlin']);

  // Status & Validation
  const [saveStatus, setSaveStatus] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Validate form required fields
  const validateForm = () => {
    if (!title.trim()) {
      setValidationError('Activity Title is required.');
      return false;
    }

    if (type === 'dictation' && words.filter((w) => w.trim()).length === 0) {
      setValidationError('At least one word is required for Dictation.');
      return false;
    }

    if (type === 'flashcards' && flashcardList.length === 0) {
      setValidationError('At least one card is required for Flashcards.');
      return false;
    }

    if (type === 'crossword' && crosswordList.length === 0) {
      setValidationError('At least one clue and word is required for Crossword.');
      return false;
    }

    setValidationError('');
    return true;
  };

  const buildActivityPayload = (statusType) => {
    let contentObj = {};

    switch (type) {
      case 'dictation':
        contentObj = { words: words.filter((w) => w.trim()) };
        break;
      case 'drag-drop':
        contentObj = { dropZones, items: dropItems };
        break;
      case 'multiple-hotspot':
        contentObj = { hotspots, requiredCount: hotspots.filter((h) => h.isCorrect).length };
        break;
      case 'find-hotspot':
        contentObj = { correctHotspot: singleHotspot };
        break;
      case 'memory-game':
        contentObj = { pairs: memoryPairs };
        break;
      case 'word-scramble':
        contentObj = { words: words.filter((w) => w.trim()), difficulty };
        break;
      case 'flashcards':
        contentObj = { cards: flashcardList };
        break;
      case 'crossword':
        contentObj = { words: crosswordList, solutionWord };
        break;
      case 'drag-the-words':
        contentObj = { text: dragWordsText, distractors };
        break;
      default:
        break;
    }

    return {
      type,
      status: statusType,
      title: title.trim(),
      description: description.trim() || 'Interactive learning activity created with Vblivestream.',
      content: contentObj,
      settings: {
        randomize,
        requireInput,
        caseSensitive,
        difficulty
      },
      feedback: {
        correct: correctFeedback,
        incorrect: incorrectFeedback
      }
    };
  };

  const handleSave = (statusType) => {
    if (!validateForm()) return;

    const payload = buildActivityPayload(statusType);
    if (initialData?.id) {
      updateActivity(initialData.id, payload);
    } else {
      createActivity(payload);
    }
    setSaveStatus(statusType === 'draft' ? 'Activity saved as draft!' : 'Activity published successfully!');

    setTimeout(() => {
      setSaveStatus(null);
    }, 4000);
  };

  return (
    <div className="editor-container">
      {/* Editor Header Navigation */}
      <div className="editor-header">
        <button type="button" className="btn-back" onClick={onBack}>
          ← Back to Activity Types
        </button>

        <div className="editor-title-block">
          <span className="editor-type-tag">Custom Activity Editor</span>
          <h1 className="editor-main-title">Create {type.toUpperCase().replace('-', ' ')} Activity</h1>
        </div>
      </div>

      {/* Validation & Save Status Alerts */}
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

      {/* Main Form Body */}
      <div className="editor-card">
        {/* Section 1: General Info */}
        <div className="editor-section">
          <h2 className="section-heading">1. General Information</h2>
          <div className="form-group">
            <label className="form-label" htmlFor="act-title">Activity Title *</label>
            <input
              id="act-title"
              type="text"
              className="editor-input"
              placeholder="e.g. Animals Vocabulary Quiz"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="act-desc">Instructions / Description</label>
            <textarea
              id="act-desc"
              className="editor-textarea"
              rows={3}
              placeholder="Instructions for the learner..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Section 2: Activity-Specific Content Editor */}
        <div className="editor-section">
          <h2 className="section-heading">2. Activity Content & Elements</h2>

          {/* Dictation Sub-Editor */}
          {type === 'dictation' && (
            <div className="sub-editor">
              <label className="form-label">Target Words List</label>
              {words.map((w, idx) => (
                <div key={idx} className="dynamic-input-row">
                  <input
                    type="text"
                    className="editor-input"
                    placeholder={`Word ${idx + 1}`}
                    value={w}
                    onChange={(e) => {
                      const copy = [...words];
                      copy[idx] = e.target.value;
                      setWords(copy);
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setWords(words.filter((_, i) => i !== idx))}
                  >
                    🗑️ Delete
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setWords([...words, ''])}
              >
                + Add Word
              </button>
            </div>
          )}

          {/* Flashcards Sub-Editor */}
          {type === 'flashcards' && (
            <div className="sub-editor">
              <label className="form-label">Flashcard Cards</label>
              {flashcardList.map((card, idx) => (
                <div key={card.id || idx} className="card-editor-box">
                  <div className="box-header">Card {idx + 1}</div>
                  <div className="form-group">
                    <label className="form-label">Question</label>
                    <input
                      type="text"
                      className="editor-input"
                      value={card.question}
                      onChange={(e) => {
                        const copy = [...flashcardList];
                        copy[idx].question = e.target.value;
                        setFlashcardList(copy);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Answer</label>
                    <input
                      type="text"
                      className="editor-input"
                      value={card.answer}
                      onChange={(e) => {
                        const copy = [...flashcardList];
                        copy[idx].answer = e.target.value;
                        setFlashcardList(copy);
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setFlashcardList(flashcardList.filter((_, i) => i !== idx))}
                  >
                    🗑️ Delete Card
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  setFlashcardList([
                    ...flashcardList,
                    { id: `c-${Date.now()}`, question: '', answer: '', emoji: '❓' }
                  ])
                }
              >
                + Add Card
              </button>
            </div>
          )}

          {/* Crossword Sub-Editor */}
          {type === 'crossword' && (
            <div className="sub-editor">
              <label className="form-label">Crossword Clues & Answers</label>
              {crosswordList.map((item, idx) => (
                <div key={item.id || idx} className="card-editor-box">
                  <div className="form-group">
                    <label className="form-label">Clue {idx + 1}</label>
                    <input
                      type="text"
                      className="editor-input"
                      placeholder="e.g. A small animal that says meow"
                      value={item.clue}
                      onChange={(e) => {
                        const copy = [...crosswordList];
                        copy[idx].clue = e.target.value;
                        setCrosswordList(copy);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Answer Word</label>
                    <input
                      type="text"
                      className="editor-input"
                      placeholder="e.g. CAT"
                      value={item.answer}
                      onChange={(e) => {
                        const copy = [...crosswordList];
                        copy[idx].answer = e.target.value.toUpperCase();
                        setCrosswordList(copy);
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCrosswordList(crosswordList.filter((_, i) => i !== idx))}
                  >
                    🗑️ Delete
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  setCrosswordList([
                    ...crosswordList,
                    { id: `w-${Date.now()}`, clue: '', answer: '' }
                  ])
                }
              >
                + Add Word & Clue
              </button>

              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label className="form-label">Overall Solution Word (Optional)</label>
                <input
                  type="text"
                  className="editor-input"
                  placeholder="e.g. LEARN"
                  value={solutionWord}
                  onChange={(e) => setSolutionWord(e.target.value.toUpperCase())}
                />
              </div>
            </div>
          )}

          {/* Drag the Words Sub-Editor */}
          {type === 'drag-the-words' && (
            <div className="sub-editor">
              <div className="form-group">
                <label className="form-label">Sentence Text (Wrap draggable words in *asterisks*)</label>
                <textarea
                  className="editor-textarea"
                  rows={4}
                  value={dragWordsText}
                  onChange={(e) => setDragWordsText(e.target.value)}
                />
              </div>

              <label className="form-label">Extra Distractor Words</label>
              {distractors.map((d, idx) => (
                <div key={idx} className="dynamic-input-row">
                  <input
                    type="text"
                    className="editor-input"
                    value={d}
                    onChange={(e) => {
                      const copy = [...distractors];
                      copy[idx] = e.target.value;
                      setDistractors(copy);
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setDistractors(distractors.filter((_, i) => i !== idx))}
                  >
                    🗑️ Delete
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDistractors([...distractors, ''])}
              >
                + Add Distractor
              </button>
            </div>
          )}

          {/* Generic fallback for remaining types */}
          {['drag-drop', 'multiple-hotspot', 'find-hotspot', 'memory-game', 'word-scramble'].includes(type) && (
            <div className="sub-editor">
              <p className="editor-info-text">
                Custom configuration parameters for {type} activity content.
              </p>
              <div className="form-group">
                <label className="form-label">Target Items / Questions</label>
                {words.map((w, idx) => (
                  <div key={idx} className="dynamic-input-row">
                    <input
                      type="text"
                      className="editor-input"
                      value={w}
                      onChange={(e) => {
                        const copy = [...words];
                        copy[idx] = e.target.value;
                        setWords(copy);
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setWords(words.filter((_, i) => i !== idx))}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setWords([...words, ''])}
                >
                  + Add Item
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Settings & Feedback */}
        <div className="editor-section">
          <h2 className="section-heading">3. Settings & Feedback</h2>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={randomize}
                onChange={(e) => setRandomize(e.target.checked)}
              />
              Randomize elements / shuffle array on start
            </label>

            {type === 'flashcards' && (
              <>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={requireInput}
                    onChange={(e) => setRequireInput(e.target.checked)}
                  />
                  Require text input answer from learner
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={caseSensitive}
                    onChange={(e) => setCaseSensitive(e.target.checked)}
                  />
                  Case-sensitive answer validation
                </label>
              </>
            )}
          </div>

          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label className="form-label">Correct Feedback Message</label>
            <input
              type="text"
              className="editor-input"
              value={correctFeedback}
              onChange={(e) => setCorrectFeedback(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Incorrect Feedback Message</label>
            <input
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
            👁️ Preview Activity
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
            🚀 Publish Activity
          </button>
        </div>
      </div>

      {/* Live Preview Modal Overlay */}
      {isPreviewOpen && (
        <div className="preview-modal-overlay">
          <div className="preview-modal-content">
            <div className="preview-modal-header">
              <h3>👁️ Live Learner Preview</h3>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsPreviewOpen(false)}
              >
                ✕ Close Preview
              </button>
            </div>

            <div className="preview-modal-body">
              {type === 'dictation' && <Dictation onBack={() => setIsPreviewOpen(false)} />}
              {type === 'drag-drop' && <DragDrop onBack={() => setIsPreviewOpen(false)} />}
              {type === 'multiple-hotspot' && <Hotspot onBack={() => setIsPreviewOpen(false)} />}
              {type === 'find-hotspot' && <FindHotspot onBack={() => setIsPreviewOpen(false)} />}
              {type === 'memory-game' && <MemoryGame onBack={() => setIsPreviewOpen(false)} />}
              {type === 'word-scramble' && <WordScramble onBack={() => setIsPreviewOpen(false)} />}
              {type === 'flashcards' && <Flashcards onBack={() => setIsPreviewOpen(false)} />}
              {type === 'crossword' && <Crossword onBack={() => setIsPreviewOpen(false)} />}
              {type === 'drag-the-words' && <DragTheWords onBack={() => setIsPreviewOpen(false)} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
