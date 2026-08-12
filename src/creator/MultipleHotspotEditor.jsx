import React, { useState, useEffect, useRef } from 'react';
import { createActivity, updateActivity } from '../services/activityStorage';
import Hotspot from '../activities/Hotspot';

export default function MultipleHotspotEditor({ initialData, onBack }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(
    initialData?.description || 'Find all the target items in the picture.'
  );
  const [image, setImage] = useState(initialData?.content?.image || '');
  const [hotspots, setHotspots] = useState(initialData?.content?.hotspots || []);
  const [selectedHotspotId, setSelectedHotspotId] = useState(null);
  const [requiredCorrect, setRequiredCorrect] = useState(initialData?.content?.requiredCorrect || 1);

  // General Feedback
  const [correctFeedback, setCorrectFeedback] = useState(
    initialData?.feedback?.correct || 'Great! You found a correct item.'
  );
  const [incorrectFeedback, setIncorrectFeedback] = useState(
    initialData?.feedback?.incorrect || "That's not what you're looking for."
  );
  const [completionFeedback, setCompletionFeedback] = useState(
    initialData?.feedback?.completion || 'Great job! You found everything.'
  );

  const [validationError, setValidationError] = useState('');
  const [saveStatus, setSaveStatus] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const canvasRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      if (initialData.content?.image) setImage(initialData.content.image);
      if (initialData.content?.hotspots) setHotspots(initialData.content.hotspots);
      if (initialData.content?.requiredCorrect) setRequiredCorrect(initialData.content.requiredCorrect);
      if (initialData.feedback) {
        setCorrectFeedback(initialData.feedback.correct || 'Great! You found a correct item.');
        setIncorrectFeedback(initialData.feedback.incorrect || "That's not what you're looking for.");
        setCompletionFeedback(initialData.feedback.completion || 'Great job! You found everything.');
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

  // Canvas Click: Calculate percentage coordinates and place hotspot
  const handleCanvasClick = (e) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const xPercent = Math.round((clickX / rect.width) * 1000) / 10;
    const yPercent = Math.round((clickY / rect.height) * 1000) / 10;

    const newHotspot = {
      id: `hs_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      x: xPercent,
      y: yPercent,
      isCorrect: true,
      label: `Hotspot ${hotspots.length + 1}`,
      feedback: 'Yes! You found it.'
    };

    setHotspots([...hotspots, newHotspot]);
    setSelectedHotspotId(newHotspot.id);
  };

  const handleUpdateHotspot = (id, field, value) => {
    setHotspots(hotspots.map((h) => (h.id === id ? { ...h, [field]: value } : h)));
  };

  const handleDeleteHotspot = (id) => {
    setHotspots(hotspots.filter((h) => h.id !== id));
    if (selectedHotspotId === id) setSelectedHotspotId(null);
  };

  const selectedHotspot = hotspots.find((h) => h.id === selectedHotspotId);
  const correctHotspotsCount = hotspots.filter((h) => h.isCorrect).length;

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

    if (hotspots.length === 0) {
      setValidationError('Please click on the image to add at least one hotspot.');
      return false;
    }

    if (correctHotspotsCount === 0) {
      setValidationError('Please mark at least one hotspot as Correct.');
      return false;
    }

    if (requiredCorrect <= 0) {
      setValidationError('Required correct hotspots count must be at least 1.');
      return false;
    }

    if (requiredCorrect > correctHotspotsCount) {
      setValidationError(
        `Required hotspots (${requiredCorrect}) cannot exceed total correct hotspots (${correctHotspotsCount}).`
      );
      return false;
    }

    setValidationError('');
    return true;
  };

  const buildPayload = (statusType) => {
    return {
      type: 'multiple-hotspot',
      status: statusType,
      title: title.trim(),
      description: description.trim(),
      content: {
        image,
        hotspots: hotspots.map((h) => ({
          id: h.id,
          x: h.x,
          y: h.y,
          isCorrect: Boolean(h.isCorrect),
          label: h.label.trim() || 'Target',
          feedback: h.feedback.trim() || ''
        })),
        requiredCorrect: Number(requiredCorrect)
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
      statusType === 'draft'
        ? 'Find Multiple Hotspots saved as draft.'
        : 'Find Multiple Hotspots published successfully.'
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
          <span className="editor-type-tag">Find Multiple Hotspots Authoring Tool</span>
          <h1 className="editor-main-title">
            {initialData ? 'Edit Find Multiple Hotspots' : 'Create Find Multiple Hotspots'}
          </h1>
        </div>
      </div>

      {/* Inline Validation & Status Alerts */}
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
        {/* Section 1: Basic Info */}
        <div className="editor-section">
          <h2 className="section-heading">1. Basic Information</h2>

          <div className="form-group">
            <label className="form-label" htmlFor="hs-title">Title *</label>
            <input
              id="hs-title"
              type="text"
              className="editor-input"
              placeholder="e.g. Find the Fruits"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="hs-desc">Question / Instructions *</label>
            <textarea
              id="hs-desc"
              className="editor-textarea"
              rows={3}
              placeholder="Find all the fruits in the picture."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Section 2: Interactive Canvas & Background Image */}
        <div className="editor-section">
          <h2 className="section-heading">2. Background Image & Hotspot Canvas *</h2>
          <p className="editor-info-text">
            Upload an image and <strong>click anywhere on the image</strong> to place hotspot markers.
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
                className="hotspot-editor-canvas"
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
                  border: '3px solid #2563eb',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                {/* Render Placed Hotspot Markers */}
                {hotspots.map((h, idx) => {
                  const isSelected = h.id === selectedHotspotId;
                  return (
                    <div
                      key={h.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHotspotId(h.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: `${h.y}%`,
                        left: `${h.x}%`,
                        transform: 'translate(-50%, -50%)',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: h.isCorrect ? '#2563eb' : '#ef4444',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '0.85rem',
                        border: isSelected ? '3px solid #ffffff' : '2px solid #ffffff',
                        boxShadow: isSelected ? '0 0 0 4px rgba(37, 99, 235, 0.5)' : '0 2px 8px rgba(0,0,0,0.3)',
                        cursor: 'pointer',
                        zIndex: isSelected ? 10 : 5
                      }}
                      title={`${h.label || `Hotspot ${idx + 1}`} (${h.isCorrect ? 'Correct' : 'Incorrect'})`}
                    >
                      {idx + 1}
                    </div>
                  );
                })}
              </div>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                💡 Click anywhere on the image to add a hotspot. Click an existing marker to edit it.
              </p>
            </div>
          ) : (
            <div className="empty-saved-box" style={{ marginTop: '1rem' }}>
              <p>📷 Upload a background image to enable hotspot placement canvas.</p>
            </div>
          )}
        </div>

        {/* Section 3: Selected Hotspot Configuration Panel */}
        {selectedHotspot && (
          <div className="editor-section" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '2px solid #cbd5e1' }}>
            <h2 className="section-heading" style={{ color: '#2563eb' }}>
              Edit Selected Hotspot ({hotspots.findIndex((h) => h.id === selectedHotspot.id) + 1})
            </h2>

            <div className="form-group">
              <label className="form-label">Hotspot Type</label>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <label className="checkbox-label">
                  <input
                    type="radio"
                    name="hs-type"
                    checked={selectedHotspot.isCorrect}
                    onChange={() => handleUpdateHotspot(selectedHotspot.id, 'isCorrect', true)}
                  />
                  Correct ✓
                </label>
                <label className="checkbox-label">
                  <input
                    type="radio"
                    name="hs-type"
                    checked={!selectedHotspot.isCorrect}
                    onChange={() => handleUpdateHotspot(selectedHotspot.id, 'isCorrect', false)}
                  />
                  Incorrect ✕
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Label / Name</label>
              <input
                type="text"
                className="editor-input"
                value={selectedHotspot.label}
                onChange={(e) => handleUpdateHotspot(selectedHotspot.id, 'label', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Specific Feedback Message</label>
              <input
                type="text"
                className="editor-input"
                value={selectedHotspot.feedback}
                onChange={(e) => handleUpdateHotspot(selectedHotspot.id, 'feedback', e.target.value)}
              />
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleDeleteHotspot(selectedHotspot.id)}
            >
              🗑️ Delete Hotspot
            </button>
          </div>
        )}

        {/* Section 4: Hotspots Summary List */}
        <div className="editor-section">
          <h2 className="section-heading">3. Hotspots Summary ({hotspots.length})</h2>
          {hotspots.length === 0 ? (
            <p className="editor-info-text">No hotspots added yet. Click on the image canvas above!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {hotspots.map((h, idx) => (
                <div
                  key={h.id}
                  className="dynamic-input-row"
                  style={{
                    background: h.id === selectedHotspotId ? '#eff6ff' : '#f8fafc',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: h.id === selectedHotspotId ? '2px solid #2563eb' : '1px solid #e2e8f0'
                  }}
                >
                  <span style={{ fontWeight: '800', width: '2.5rem' }}>#{idx + 1}</span>
                  <span
                    className="status-pill"
                    style={{
                      backgroundColor: h.isCorrect ? '#dcfce7' : '#fee2e2',
                      color: h.isCorrect ? '#15803d' : '#991b1b'
                    }}
                  >
                    {h.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                  <span style={{ flex: 1, fontWeight: '700' }}>{h.label || 'Target'}</span>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', marginRight: '1rem' }}>
                    Pos: ({h.x}%, {h.y}%)
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedHotspotId(h.id)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDeleteHotspot(h.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 5: Settings & Required Count */}
        <div className="editor-section">
          <h2 className="section-heading">4. Required Correct Hotspots Settings</h2>
          <div className="form-group">
            <label className="form-label" htmlFor="hs-req">Required Correct Hotspots to Complete *</label>
            <input
              id="hs-req"
              type="number"
              min={1}
              max={correctHotspotsCount || 1}
              className="editor-input"
              value={requiredCorrect}
              onChange={(e) => setRequiredCorrect(Math.max(1, parseInt(e.target.value) || 1))}
            />
            <p className="editor-info-text">
              Total correct hotspots available: <strong>{correctHotspotsCount}</strong>.
            </p>
          </div>
        </div>

        {/* Section 6: Feedback */}
        <div className="editor-section">
          <h2 className="section-heading">5. Feedback Messages</h2>

          <div className="form-group">
            <label className="form-label">Correct Hotspot Feedback</label>
            <input
              type="text"
              className="editor-input"
              value={correctFeedback}
              onChange={(e) => setCorrectFeedback(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Incorrect Hotspot Feedback</label>
            <input
              type="text"
              className="editor-input"
              value={incorrectFeedback}
              onChange={(e) => setIncorrectFeedback(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">General Completion Feedback</label>
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
              <h3>🔎 Find Multiple Hotspots Learner Live Preview</h3>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsPreviewOpen(false)}
              >
                ✕ Close Preview
              </button>
            </div>

            <div className="preview-modal-body">
              <Hotspot
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
