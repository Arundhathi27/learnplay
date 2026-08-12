import React, { useState, useEffect } from 'react';
import { createActivity, updateActivity } from '../services/activityStorage';
import DragDrop from '../activities/DragDrop';

export default function DragDropEditor({ initialData, onBack }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(
    initialData?.description || 'Drag each item to the correct category.'
  );
  const [bgImage, setBgImage] = useState(initialData?.content?.backgroundImage || '');

  // Drop Zones list
  const [dropZones, setDropZones] = useState(() => {
    if (initialData?.content?.dropZones && initialData.content.dropZones.length > 0) {
      return initialData.content.dropZones.map((z, idx) =>
        typeof z === 'string'
          ? { id: `zone_${idx + 1}`, name: z }
          : { id: z.id || `zone_${idx + 1}`, name: z.name || z.title }
      );
    }
    return [
      { id: 'zone_fruits', name: 'Fruits' },
      { id: 'zone_animals', name: 'Animals' }
    ];
  });

  // Draggable Items list
  const [items, setItems] = useState(() => {
    if (initialData?.content?.items && initialData.content.items.length > 0) {
      return initialData.content.items.map((i, idx) => ({
        id: i.id || `item_${idx + 1}`,
        name: i.name || i.text || '',
        correctZoneId: i.correctZoneId || i.targetZone?.toLowerCase() || 'zone_fruits',
        emoji: i.emoji || '📦'
      }));
    }
    return [
      { id: 'item_1', name: 'Apple', correctZoneId: 'zone_fruits', emoji: '🍎' },
      { id: 'item_2', name: 'Dog', correctZoneId: 'zone_animals', emoji: '🐶' }
    ];
  });

  // Settings & Feedback
  const [randomize, setRandomize] = useState(initialData?.settings?.randomize ?? true);
  const [correctFeedback, setCorrectFeedback] = useState(initialData?.feedback?.correct || 'Great job!');
  const [incorrectFeedback, setIncorrectFeedback] = useState(
    initialData?.feedback?.incorrect || "That's not the correct place. Try again!"
  );

  const [validationError, setValidationError] = useState('');
  const [saveStatus, setSaveStatus] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      if (initialData.content?.backgroundImage) setBgImage(initialData.content.backgroundImage);
      if (initialData.content?.dropZones) {
        setDropZones(
          initialData.content.dropZones.map((z, idx) =>
            typeof z === 'string'
              ? { id: `zone_${idx + 1}`, name: z }
              : { id: z.id || `zone_${idx + 1}`, name: z.name || z.title }
          )
        );
      }
      if (initialData.content?.items) {
        setItems(
          initialData.content.items.map((i, idx) => ({
            id: i.id || `item_${idx + 1}`,
            name: i.name || i.text || '',
            correctZoneId: i.correctZoneId || i.targetZone?.toLowerCase() || '',
            emoji: i.emoji || '📦'
          }))
        );
      }
      if (initialData.settings?.randomize !== undefined) setRandomize(initialData.settings.randomize);
      if (initialData.feedback) {
        setCorrectFeedback(initialData.feedback.correct || 'Great job!');
        setIncorrectFeedback(initialData.feedback.incorrect || "That's not the correct place. Try again!");
      }
    }
  }, [initialData]);

  // Drop Zone Handlers
  const handleAddDropZone = () => {
    const newId = `zone_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setDropZones([...dropZones, { id: newId, name: '' }]);
  };

  const handleUpdateDropZone = (id, newName) => {
    setDropZones(dropZones.map((z) => (z.id === id ? { ...z, name: newName } : z)));
  };

  const handleDeleteDropZone = (id) => {
    if (dropZones.length <= 1) {
      setValidationError('At least one drop zone is required.');
      return;
    }
    setDropZones(dropZones.filter((z) => z.id !== id));
    // Clear assigned zone for items pointing to deleted zone
    setItems(items.map((i) => (i.correctZoneId === id ? { ...i, correctZoneId: '' } : i)));
    setValidationError('');
  };

  // Item Handlers
  const handleAddItem = () => {
    const newId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const defaultZone = dropZones[0]?.id || '';
    setItems([...items, { id: newId, name: '', correctZoneId: defaultZone, emoji: '📦' }]);
  };

  const handleUpdateItem = (id, field, value) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const handleDeleteItem = (id) => {
    if (items.length <= 1) {
      setValidationError('At least one draggable item is required.');
      return;
    }
    setItems(items.filter((i) => i.id !== id));
    setValidationError('');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBgImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      setValidationError('Please enter an Activity Title.');
      return false;
    }

    const cleanZones = dropZones.filter((z) => z.name.trim());
    if (cleanZones.length === 0) {
      setValidationError('Please add at least one drop zone.');
      return false;
    }

    for (let i = 0; i < dropZones.length; i++) {
      if (!dropZones[i].name.trim()) {
        setValidationError(`Drop Zone ${i + 1} name cannot be empty.`);
        return false;
      }
    }

    const cleanItems = items.filter((i) => i.name.trim());
    if (cleanItems.length === 0) {
      setValidationError('Please add at least one draggable item.');
      return false;
    }

    for (let i = 0; i < items.length; i++) {
      if (!items[i].name.trim()) {
        setValidationError(`Draggable Item ${i + 1} name cannot be empty.`);
        return false;
      }
      if (!items[i].correctZoneId) {
        setValidationError(`Select a correct drop zone for "${items[i].name}".`);
        return false;
      }
    }

    setValidationError('');
    return true;
  };

  const buildPayload = (statusType) => {
    return {
      type: 'drag-drop',
      status: statusType,
      title: title.trim(),
      description: description.trim() || 'Drag each item to the correct category.',
      content: {
        backgroundImage: bgImage,
        dropZones: dropZones.map((z) => ({ id: z.id, name: z.name.trim() })),
        items: items.map((i) => ({
          id: i.id,
          name: i.name.trim(),
          correctZoneId: i.correctZoneId,
          emoji: i.emoji || '📦'
        }))
      },
      settings: {
        randomize
      },
      feedback: {
        correct: correctFeedback.trim() || 'Great job!',
        incorrect: incorrectFeedback.trim() || "That's not the correct place. Try again!"
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
      statusType === 'draft' ? 'Drag & Drop saved as draft.' : 'Drag & Drop published successfully.'
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
          <span className="editor-type-tag">Sort & Match Authoring Tool</span>
          <h1 className="editor-main-title">
            {initialData ? 'Edit Drag & Drop Activity' : 'Create Drag & Drop Activity'}
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
        {/* Section 1: Basic Info */}
        <div className="editor-section">
          <h2 className="section-heading">Basic Information</h2>

          <div className="form-group">
            <label className="form-label" htmlFor="dd-title">Title *</label>
            <input
              id="dd-title"
              type="text"
              className="editor-input"
              placeholder="e.g. Fruit and Animals"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="dd-desc">Instructions</label>
            <textarea
              id="dd-desc"
              className="editor-textarea"
              rows={3}
              placeholder="Drag each item to the correct category."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Section 2: Optional Background Image */}
        <div className="editor-section">
          <h2 className="section-heading">Background Image (Optional)</h2>
          <div className="form-group">
            <label className="form-label">Upload Background Image</label>
            <input
              type="file"
              accept="image/*"
              className="editor-input"
              onChange={handleImageUpload}
            />
          </div>

          {bgImage && (
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img
                src={bgImage}
                alt="Background preview"
                style={{ maxHeight: '120px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setBgImage('')}
              >
                🗑️ Remove Image
              </button>
            </div>
          )}
        </div>

        {/* Section 3: Drop Zones */}
        <div className="editor-section">
          <h2 className="section-heading">Drop Zones</h2>
          <p className="editor-info-text">
            Create the categories/places where learners should drop items.
          </p>

          {dropZones.map((zone, idx) => (
            <div key={zone.id} className="dynamic-input-row" style={{ marginBottom: '0.75rem' }}>
              <span className="word-row-number" style={{ minWidth: '6.5rem', fontWeight: '800', color: '#2563eb' }}>
                Drop Zone {idx + 1}
              </span>
              <input
                type="text"
                className="editor-input"
                placeholder="e.g. Fruits"
                value={zone.name}
                onChange={(e) => handleUpdateDropZone(zone.id, e.target.value)}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleDeleteDropZone(zone.id)}
              >
                🗑️ Delete
              </button>
            </div>
          ))}

          <div style={{ marginTop: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddDropZone}
            >
              + Add Drop Zone
            </button>
          </div>
        </div>

        {/* Section 4: Draggable Items */}
        <div className="editor-section">
          <h2 className="section-heading">Draggable Items</h2>
          <p className="editor-info-text">
            Add items and choose the correct drop zone for each one.
          </p>

          {dropZones.length === 0 ? (
            <div className="empty-saved-box">
              <p>⚠️ Create a drop zone before adding items.</p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={item.id} className="card-editor-box">
                <div className="box-header">Item {idx + 1}</div>

                <div className="form-group">
                  <label className="form-label">Item Text / Name</label>
                  <input
                    type="text"
                    className="editor-input"
                    placeholder="e.g. Apple"
                    value={item.name}
                    onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Correct Drop Zone</label>
                  <select
                    className="editor-input"
                    value={item.correctZoneId}
                    onChange={(e) => handleUpdateItem(item.id, 'correctZoneId', e.target.value)}
                  >
                    <option value="">-- Select Drop Zone --</option>
                    {dropZones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name || `Drop Zone ${z.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    🗑️ Delete Item
                  </button>
                </div>
              </div>
            ))
          )}

          <div style={{ marginTop: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddItem}
              disabled={dropZones.length === 0}
            >
              + Add Item
            </button>
          </div>
        </div>

        {/* Section 5: Settings */}
        <div className="editor-section">
          <h2 className="section-heading">Settings</h2>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={randomize}
                onChange={(e) => setRandomize(e.target.checked)}
              />
              Randomize items order when learner starts
            </label>
          </div>
        </div>

        {/* Section 6: Feedback */}
        <div className="editor-section">
          <h2 className="section-heading">Feedback</h2>

          <div className="form-group">
            <label className="form-label">Correct Answer Message</label>
            <input
              type="text"
              className="editor-input"
              value={correctFeedback}
              onChange={(e) => setCorrectFeedback(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Incorrect Answer Message</label>
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
              <h3>🧩 Drag & Drop Learner Live Preview</h3>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsPreviewOpen(false)}
              >
                ✕ Close Preview
              </button>
            </div>

            <div className="preview-modal-body">
              <DragDrop
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
