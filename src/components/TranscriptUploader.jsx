import { useState } from "react";
import { TAG_OPTIONS, SPEAKER_OPTIONS } from "../data/sampleTranscript";

const PASTE_PLACEHOLDER = `Paste transcript lines here. Each line = one segment.
Supported formats:

[00:01:23] Professor: Some text here
00:01:23 - Professor: Some text here
Professor: Some text here
Just plain text on each line

Confidence and tags will be auto-assigned.`;

function parseTranscriptText(raw) {
  const lines = raw.split("\n").filter((l) => l.trim().length > 0);
  const entries = [];

  lines.forEach((line, i) => {
    // Try to match [00:00:00] Speaker: text
    let match = line.match(/^\[?(\d{2}:\d{2}:\d{2})\]?\s*[-–]?\s*([^:]+):\s*(.+)$/);
    if (match) {
      entries.push({
        id: i + 1,
        timestamp: match[1],
        speaker: match[2].trim(),
        text: match[3].trim(),
        confidence: "medium",
        tags: [],
        edited: false,
      });
      return;
    }

    // Try Speaker: text (no timestamp)
    match = line.match(/^([A-Za-z ]{2,30}):\s*(.+)$/);
    if (match) {
      const speakerGuess = match[1].trim();
      const knownSpeaker = SPEAKER_OPTIONS.find(
        (s) => s.toLowerCase() === speakerGuess.toLowerCase()
      ) || speakerGuess;
      entries.push({
        id: i + 1,
        timestamp: `00:0${Math.floor(i / 60)}:${String(i % 60).padStart(2, "0")}`,
        speaker: knownSpeaker,
        text: match[2].trim(),
        confidence: "medium",
        tags: [],
        edited: false,
      });
      return;
    }

    // Plain text fallback
    if (line.trim().length > 0) {
      entries.push({
        id: i + 1,
        timestamp: `00:0${Math.floor(i / 60)}:${String(i % 60).padStart(2, "0")}`,
        speaker: "Unknown",
        text: line.trim(),
        confidence: "medium",
        tags: [],
        edited: false,
      });
    }
  });

  return entries;
}

export default function TranscriptUploader({ onLoad, onClose }) {
  const [pastedText, setPastedText] = useState("");
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const handlePreview = () => {
    setError(null);
    if (!pastedText.trim()) {
      setError("Please paste some transcript text first.");
      return;
    }
    const parsed = parseTranscriptText(pastedText);
    if (parsed.length === 0) {
      setError("Could not parse any transcript entries. Please check the format.");
      return;
    }
    setPreview(parsed);
  };

  const handleLoad = () => {
    if (preview) {
      onLoad(preview);
    }
  };

  return (
    <div className="transcript-uploader" role="region" aria-label="Load custom transcript">
      <div className="uploader-inner">
        <div className="uploader-header">
          <h2 className="uploader-title">
            <span aria-hidden="true">📂</span> Load Your Own Transcript
          </h2>
          <button className="btn btn-cancel uploader-close" onClick={onClose} aria-label="Close transcript loader">
            ✕ Close
          </button>
        </div>

        <div className="uploader-body">
          <div className="uploader-left">
            <label htmlFor="transcript-paste" className="uploader-label">
              Paste your transcript below:
            </label>
            <textarea
              id="transcript-paste"
              className="uploader-textarea"
              value={pastedText}
              onChange={(e) => { setPastedText(e.target.value); setPreview(null); setError(null); }}
              placeholder={PASTE_PLACEHOLDER}
              rows={10}
              aria-describedby="uploader-format-hint"
            />
            <p id="uploader-format-hint" className="uploader-hint">
              Supports formats like <code>[00:01:23] Speaker: text</code> or plain lines.
            </p>
            {error && <p className="uploader-error" role="alert">{error}</p>}
            <div className="uploader-actions">
              <button className="btn btn-save" onClick={handlePreview} aria-label="Preview parsed transcript">
                Preview →
              </button>
              {preview && (
                <button className="btn btn-load-confirm" onClick={handleLoad} aria-label="Load this transcript">
                  ✓ Load {preview.length} segments
                </button>
              )}
            </div>
          </div>

          {preview && (
            <div className="uploader-preview" aria-live="polite" aria-label="Transcript preview">
              <h3 className="uploader-preview-title">Preview ({preview.length} segments)</h3>
              <ul className="uploader-preview-list">
                {preview.slice(0, 8).map((entry) => (
                  <li key={entry.id} className="uploader-preview-item">
                    <span className="preview-timestamp">{entry.timestamp}</span>
                    <span className="preview-speaker">{entry.speaker}</span>
                    <span className="preview-text">{entry.text.substring(0, 80)}{entry.text.length > 80 ? "…" : ""}</span>
                  </li>
                ))}
                {preview.length > 8 && (
                  <li className="uploader-preview-more">…and {preview.length - 8} more segments</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
