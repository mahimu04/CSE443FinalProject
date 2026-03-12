import { useState, useRef, useEffect } from "react";
import { TAG_OPTIONS, SPEAKER_OPTIONS } from "../data/sampleTranscript";

export default function TranscriptRow({ entry, onUpdate, isCollapsed }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(entry.text);
  const [selectedWord, setSelectedWord] = useState(null);
  const [wordContext, setWordContext] = useState("");
  const [showWordPopup, setShowWordPopup] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const popupTextareaRef = useRef(null);
  const editTextareaRef = useRef(null);
  const annotateButtonRef = useRef(null);

  useEffect(() => {
    if (showWordPopup && popupTextareaRef.current) {
      popupTextareaRef.current.focus();
    }
  }, [showWordPopup]);

  useEffect(() => {
    if (isEditing && editTextareaRef.current) {
      editTextareaRef.current.focus();
    }
  }, [isEditing]);

  if (isCollapsed) return null;

  const announce = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 2500);
  };

  const handleSave = () => {
    onUpdate(entry.id, { text: editText, edited: editText !== (entry.originalText ?? entry.text) });
    setIsEditing(false);
    announce("Transcript text saved.");
  };

  const handleTagToggle = (tag) => {
    const current = entry.tags || [];
    const updated = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    onUpdate(entry.id, { tags: updated });
    announce(current.includes(tag) ? `Tag "${tag}" removed.` : `Tag "${tag}" added.`);
  };

  const handleSpeakerChange = (e) => {
    onUpdate(entry.id, { speaker: e.target.value });
    announce(`Speaker changed to ${e.target.value}.`);
  };

  const handleTextMouseUp = () => {
    const selection = window.getSelection();
    const selected = selection?.toString().trim();
    if (selected && selected.length > 0 && selected.length < 200) {
      setSelectedWord(selected);
      setWordContext("");
      setShowWordPopup(true);
    }
  };

  const handleAnnotateKeyboard = () => {
    const selection = window.getSelection();
    const selected = selection?.toString().trim();
    if (selected && selected.length > 0) {
      setSelectedWord(selected);
      setWordContext("");
      setShowWordPopup(true);
    } else {
      announce("Select some text first, then press Annotate Selection.");
    }
  };

  const handleSaveWordContext = () => {
    if (!wordContext.trim()) return;
    const existing = entry.wordNotes || [];
    const updated = [...existing, { word: selectedWord, note: wordContext, id: Date.now() }];
    onUpdate(entry.id, { wordNotes: updated });
    setShowWordPopup(false);
    setSelectedWord(null);
    setWordContext("");
    announce(`Annotation saved for "${selectedWord}".`);
    setTimeout(() => annotateButtonRef.current?.focus(), 50);
  };

  const handleClosePopup = () => {
    setShowWordPopup(false);
    setSelectedWord(null);
    setTimeout(() => annotateButtonRef.current?.focus(), 50);
  };

  const handleDeleteWordNote = (noteId, word) => {
    const updated = (entry.wordNotes || []).filter((n) => n.id !== noteId);
    onUpdate(entry.id, { wordNotes: updated });
    announce(`Annotation for "${word}" deleted.`);
  };

  const handlePopupKeyDown = (e) => {
    if (e.key === "Escape") handleClosePopup();
  };

  const confidenceClass =
    entry.confidence === "low" ? "confidence-low"
    : entry.confidence === "medium" ? "confidence-medium"
    : "confidence-high";

  const confidenceLabel =
    entry.confidence === "low" ? "Low confidence"
    : entry.confidence === "medium" ? "Medium confidence"
    : "High confidence";

  return (
    <div
      className={`transcript-row ${confidenceClass} ${entry.edited ? "edited" : ""}`}
      role="article"
      aria-label={`${confidenceLabel} transcript entry at ${entry.timestamp}, speaker: ${entry.speaker}`}>

      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {statusMsg}
      </span>

      <div className="row-meta">
        <span className="timestamp">
          <span className="sr-only">Timestamp: </span>
          {entry.timestamp}
        </span>
        <label htmlFor={`speaker-${entry.id}`} className="sr-only">Speaker</label>
        <select
          id={`speaker-${entry.id}`}
          className="speaker-select"
          value={entry.speaker}
          onChange={handleSpeakerChange}>
          {SPEAKER_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {entry.confidence === "low" && (
          <span className="confidence-badge" aria-label="Warning: low confidence">
            <span aria-hidden="true">⚠</span> Low Confidence
          </span>
        )}
        {entry.edited && (
          <span className="edited-badge" aria-label="This entry has been edited">
            <span aria-hidden="true">✏</span>
          </span>
        )}
      </div>

      <div className="row-content">
        {isEditing ? (
          <div className="edit-area">
            <label htmlFor={`edit-${entry.id}`} className="sr-only">
              Edit transcript text for entry at {entry.timestamp}
            </label>
            <textarea
              id={`edit-${entry.id}`}
              ref={editTextareaRef}
              className="edit-textarea"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
            />
            <div className="edit-actions">
              <button className="btn btn-save" onClick={handleSave}>Save</button>
              <button className="btn btn-cancel" onClick={() => { setEditText(entry.text); setIsEditing(false); }}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <p className="transcript-text" onMouseUp={handleTextMouseUp}>
              {entry.text}
            </p>
            <div className="text-actions">
              <button
                className="btn btn-edit-text"
                onClick={() => setIsEditing(true)}
                aria-label={`Edit transcript text at ${entry.timestamp}`}>
                <span aria-hidden="true">✏</span> Edit
              </button>
              <button
                ref={annotateButtonRef}
                className="btn btn-annotate"
                onClick={handleAnnotateKeyboard}
                aria-label="Annotate selected text. First select words in the transcript above, then press this button.">
                <span aria-hidden="true">💬</span> Annotate Selection
              </button>
            </div>
          </>
        )}
      </div>

      {showWordPopup && (
        <div
          className="word-popup"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`popup-label-${entry.id}`}
          onKeyDown={handlePopupKeyDown}>
          <div className="word-popup-header">
            <p id={`popup-label-${entry.id}`} className="word-popup-word">
              Add note for: <strong>"{selectedWord}"</strong>
            </p>
            <button
              className="word-popup-close"
              onClick={handleClosePopup}
              aria-label="Close annotation popup. Press Escape to close.">
              <span aria-hidden="true">✕</span>
            </button>
          </div>
          <label htmlFor={`word-note-input-${entry.id}`} className="sr-only">
            Annotation note for "{selectedWord}"
          </label>
          <textarea
            id={`word-note-input-${entry.id}`}
            ref={popupTextareaRef}
            className="word-popup-input"
            value={wordContext}
            onChange={(e) => setWordContext(e.target.value)}
            placeholder="Add context, definition, or note..."
            rows={2}
          />
          <div className="word-popup-actions">
            <button
              className="btn btn-save"
              onClick={handleSaveWordContext}
              disabled={!wordContext.trim()}
              aria-disabled={!wordContext.trim()}>
              Save Note
            </button>
            <button className="btn btn-cancel" onClick={handleClosePopup}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {entry.wordNotes?.length > 0 && (
        <section className="word-notes" aria-label={`Annotations for entry at ${entry.timestamp}`}>
          <p className="word-notes-label" aria-hidden="true">
            <span aria-hidden="true">📌</span> Annotations:
          </p>
          <ul className="word-notes-list">
            {entry.wordNotes.map((note) => (
              <li key={note.id} className="word-note-item">
                <span className="word-note-word">
                  <span className="sr-only">Word: </span>"{note.word}"
                </span>
                <span className="word-note-text">
                  <span className="sr-only">Note: </span>{note.note}
                </span>
                <button
                  className="word-note-delete"
                  onClick={() => handleDeleteWordNote(note.id, note.word)}
                  aria-label={`Delete annotation for "${note.word}"`}>
                  <span aria-hidden="true">✕</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="row-tags" role="group" aria-label={`Tags for entry at ${entry.timestamp}`}>
        {TAG_OPTIONS.map((tag) => {
          const isActive = entry.tags?.includes(tag);
          return (
            <button
              key={tag}
              className={`tag-btn ${isActive ? "tag-active" : ""}`}
              onClick={() => handleTagToggle(tag)}
              aria-pressed={isActive}>
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
