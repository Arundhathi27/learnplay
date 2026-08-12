import React, { useState, useEffect, useRef } from 'react';
import { createActivity, updateActivity } from '../services/activityStorage';
import FindHotspot from '../activities/FindHotspot';

export default function FindHotspotEditor({ initialData, onBack }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(
    initialData?.description || 'Find the target item in the picture.'
  );
  const [image, setImage] = useState(initialData?.content?.image || '');

  // Single Correct Hotspot (Mandatory)
  const [correctHotspot, setCorrectHotspot] = useState(
    initialData?.content?.correctHotspot || null
  );
  const [radius, setRadius] = useState(initialData?.content?.correctHotspot?.radius || 10);

  // Optional Incorrect Hotspots
  const [incorrectHotspots, setIncorrectHotspots] = useState(
    initialData?.content?.incorrectHotspots || []
  );

  // Feedback Messages
  const [correctFeedback, setCorrectFeedback] = useState(
    initialData?.feedback?.correct || 'Great job! You found it.'
  );
  const [incorrectFeedback, setIncorrectFeedback] = useState(
    initialData?.feedback?.incorrect || 'Not quite. Try again!'
  );
  const [completionFeedback, setCompletionFeedback] = useState(
    initialData?.feedback?.completion || 'Excellent! You found the correct hotspot.'
  );

  const [validationError, setValidationError] = useState('');
  const [saveStatus, setSaveStatus] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAddingIncorrect, setIsAddingIncorrect] = useState(false);

  const canvasRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      if (initialData.content?.image) setImage(initialData.content.image);
      if (initialData.content?.correctHotspot) {
        setCorrectHotspot(initialData.content.correctHotspot);
        if (initialData.content.correctHotspot.radius) setRadius(initialData.content.correctHotspot.radius);
      }
      if (initialData.content?.incorrectHotspots) setIncorrectHotspots(initialData.content.incorrectHotspots);
      if (initialData.feedback) {
        setCorrectFeedback(initialData.feedback.correct || 'Great job! You found it.');
        setIncorrectFeedback(initialData.feedback.incorrect || 'Not quite. Try again!');
        setCompletionFeedback(initialData.feedback.completion || 'Excellent! You found the correct hotspot.');
      }
    }
  }, [initialData]);

  // Handle Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Canvas Click: Calculates percentage coordinates and updates hotspot
  const handleCanvasClick = (e) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const xPercent = Math.round((clickX / rect.width) * 1000) / 10;
    const yPercent = Math.round((clickY / rect.height) * 1000) / 10;

    if (isAddingIncorrect) {
      const newInc = {
        id: `inc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        x: xPercent,
        y: yPercent,
        radius: radius,
        feedback: 'That is not the target item.'
      };
      setIncorrectHotspots([...incorrectHotspots, newInc]);
      setIsAddingIncorrect(false);
    } else {
      // Set or relocate the single correct hotspot
      setCorrectHotspot({
        x: xPercent,
        y: yPercent,
        radius: Number(radius)
      });
    }
    setValidationError('');
  };

  const handleDeleteIncorrect = (id) => {
    setIncorrectHotspots(incorrectHotspots.filter((inc) => inc.id !== id));
  };

  const validateForm = () => {
    if (!title.trim()) {
      setValidationError('Please enter an Activity Title.');
      return false;
    }

    if (!description.trim()) {
      setValidationError('Please enter Question/Instructions.');
      return false;
    }

    if (!image) {
      setValidationError('Please upload a background image.');
      return false;
    }

    if (!correctHotspot) {
      setValidationError('Please click on the image to place the correct hotspot.');
      return false;
    }

    setValidationError('');
    return true;
  };

  const buildPayload = (statusType) => {
    return {
      type: 'find-hotspot',
      status: statusType,
      title: title.trim(),
      description: description.trim(),
      content: {
        image,
        correctHotspot: {
          x: correctHotspot.x,
          y: correctHotspot.y,
          radius: Number(radius)
        },
        incorrectHotspots: incorrectHotspots.map((inc) => ({
          id: inc.id,
          x: inc.x,
          y: inc.y,
          radius: Number(inc.radius || radius),
          feedback: inc.feedback || ''
        }))
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
      statusType === 'draft' ? 'Find Hotspot saved as draft.' : 'Find Hotspot published successfully.'
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
          <span className="editor-type-tag">Single Hotspot Authoring Tool</span>
          <h1 className="editor-main-title">
            {initialData ? 'Edit Find Hotspot' : 'Create Find Hotspot'}
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
            <label className="form-label" htmlFor="fh-title">Title *</label>
            <input
              id="fh-title"
              type="text"
              className="editor-input"
              placeholder="e.g. Find the Apple"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="fh-desc">Question / Instructions *</label>
            <textarea
              id="fh-desc"
              className="editor-textarea"
              rows={3}
              placeholder="Find the red apple in the picture."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Section 2: Interactive Image Canvas */}
        <div className="editor-section">
          <h2 className="section-heading">2. Background Image & Hotspot Placement *</h2>
          <p className="editor-info-text">
            {isAddingIncorrect
              ? '📍 Click on the image to place an INCORRECT distractor hotspot.'
              : '🎯 Click on the image to set or relocate the ONE correct hotspot target.'}
          </p>

          <div className="form-group">
            <label className="form-label">Upload Background Image</label>
            <input
              type="file"
              accept="image/*"
              className="editor-input"
              onChange={handleImageUpload}
            />
          </div>

          {image ? (
            <div className="hotspot-editor-canvas-container" style={{ marginTop: '1.25rem' }}>
              <div
                ref={canvasRef}
                className="single-hotspot-editor-canvas"
                onClick={handleCanvasClick}
                style={{
                  position: 'relative',
                  width: '100%',
                  minHeight: '380px',
                  maxHeight: '550px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'crosshair',
                  backgroundImage: `url(${image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: isAddingIncorrect ? '3px solid #ef4444' : '3px solid #2563eb',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                {/* Render Single Correct Hotspot Marker */}
                {correctHotspot && (
                  <div
                    style={{
                      position: 'absolute',
                      top: `${correctHotspot.y}%`,
                      left: `${correctHotspot.x}%`,
                      transform: 'translate(-50%, -50%)',
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(37, 99, 235, 0.85)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '1.1rem',
                      border: '3px solid #ffffff',
                      boxShadow: '0 0 0 5px rgba(37, 99, 235, 0.4)',
                      zIndex: 10
                    }}
                    title={`Correct Hotspot Target (X: ${correctHotspot.x}%, Y: ${correctHotspot.y}%)`}
                  >
                    🎯
                  </div>
                )}

                {/* Render Optional Incorrect Hotspot Markers */}
                {incorrectHotspots.map((inc, idx) => (
                  <div
                    key={inc.id}
                    style={{
                      position: 'absolute',
                      top: `${inc.y}%`,
                      left: `${inc.x}%`,
                      transform: 'translate(-50%, -50%)',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(239, 68, 68, 0.85)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      border: '2px solid #ffffff',
                      zIndex: 5
                    }}
                    title={`Incorrect Distractor #${idx + 1}`}
                  >
                    📍
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  type="button"
                  className={`btn ${isAddingIncorrect ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  onClick={() => setIsAddingIncorrect(!isAddingIncorrect)}
                >
                  {isAddingIncorrect ? '🎯 Switch to Setting Correct Target' : '📍 + Add Distractor Hotspot'}
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-saved-box" style={{ marginTop: '1rem' }}>
              <p>📷 Upload a background image to enable single hotspot placement.</p>
            </div>
          )}
        </div>

        {/* Section 3: Hotspot Properties */}
        <div className="editor-section">
          <h2 className="section-heading">3. Hotspot Target Properties</h2>

          <div className="form-group">
            <label className="form-label">Click Radius Tolerance</label>
            <select
              className="editor-input"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
            >
              <option value={6}>Small (6% precision)</option>
              <option value={10}>Medium (10% standard)</option>
              <option value={15}>Large (15% relaxed)</option>
            </select>
          </div>

          {correctHotspot ? (
            <div className="card-editor-box">
              <div className="box-header">🎯 Correct Target Location</div>
              <p style={{ fontSize: '0.9rem', color: '#334155' }}>
                Position: <strong>X: {correctHotspot.x}%</strong>, <strong>Y: {correctHotspot.y}%</strong>
              </p>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                💡 Click anywhere on the image canvas above to move this target position.
              </p>
            </div>
          ) : (
            <p className="editor-info-text">⚠️ No correct hotspot placed yet. Click on the image above!</p>
          )}

          {incorrectHotspots.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                Incorrect Distractor Hotspots ({incorrectHotspots.length})
              </h3>
              {incorrectHotspots.map((inc, idx) => (
                <div key={inc.id} className="dynamic-input-row" style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '800', width: '2.5rem' }}>#{idx + 1}</span>
                  <span className="status-pill" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                    Distractor
                  </span>
                  <span style={{ flex: 1, fontSize: '0.85rem' }}>Pos: ({inc.x}%, {inc.y}%)</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDeleteIncorrect(inc.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Feedback Messages */}
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
              <h3>🎯 Find Hotspot Learner Live Preview</h3>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsPreviewOpen(false)}
              >
                ✕ Close Preview
              </button>
            </div>

            <div className="preview-modal-body">
              <FindHotspot
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
