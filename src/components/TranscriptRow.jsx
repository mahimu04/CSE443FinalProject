import { useState } from "react";
import { TAG_OPTIONS, SPEAKER_OPTIONS } from "../data/sampleTranscript";

export default function TranscriptRow({ entry, onUpdate, isCollapsed }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(entry.text);

  if (isCollapsed) return null;

  const handleSave = () => {
    onUpdate(entry.id, { text: editText, edited: editText !== entry.originalText ?? entry.text });
    setIsEditing(false);
  };

  const handleTagToggle = (tag) => {
    const current = entry.tags || [];
    const updated = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    onUpdate(entry.id, { tags: updated });
  };

  const handleSpeakerChange = (e) => {
    onUpdate(entry.id, { speaker: e.target.value });
  };

  const confidenceClass =
    entry.confidence === "low"
      ? "confidence-low"
      : entry.confidence === "medium"
      ? "confidence-medium"
      : "confidence-high";

  return (
    <div className={`transcript-row ${confidenceClass} ${entry.edited ? "edited" : ""}`}
      role="article"
      aria-label={`Transcript entry at ${entry.timestamp}`}>

      {/* Timestamp + Speaker */}
      <div className="row-meta">
        <span className="timestamp" aria-label={`Timestamp ${entry.timestamp}`}>
          {entry.timestamp}
        </span>
        <select
          className="speaker-select"
          value={entry.speaker}
          onChange={handleSpeakerChange}
          aria-label="Speaker label">
          {SPEAKER_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {entry.confidence === "low" && (
          <span className="confidence-badge" role="img" aria-label="Low confidence - may contain errors">
            ⚠ Low Confidence
          </span>
        )}
        {entry.edited && (
          <span className="edited-badge" aria-label="This entry has been edited">
            ✏ Edited
          </span>
        )}
      </div>

      {/* Text / Edit Area */}
      <div className="row-content">
        {isEditing ? (
          <div className="edit-area">
            <textarea
              className="edit-textarea"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              aria-label="Edit transcript text"
              rows={3}
              autoFocus
            />
            <div className="edit-actions">
              <button className="btn btn-save" onClick={handleSave} aria-label="Save edits">
                Save
              </button>
              <button
                className="btn btn-cancel"
                onClick={() => { setEditText(entry.text); setIsEditing(false); }}
                aria-label="Cancel editing">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p
            className="transcript-text"
            onClick={() => setIsEditing(true)}
            role="button"
            tabIndex={0}
            aria-label="Click to edit this text"
            onKeyDown={(e) => e.key === "Enter" && setIsEditing(true)}>
            {entry.text}
          </p>
        )}
      </div>

      {/* Tags */}
      <div className="row-tags" role="group" aria-label="Content tags">
        {TAG_OPTIONS.map((tag) => (
          <button
            key={tag}
            className={`tag-btn ${entry.tags?.includes(tag) ? "tag-active" : ""}`}
            onClick={() => handleTagToggle(tag)}
            aria-pressed={entry.tags?.includes(tag)}
            aria-label={`Tag as ${tag}`}>
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
