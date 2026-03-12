import { useState } from "react";

const SPEAKER_COLORS = {
  Professor: { bg: "#e8eef8", border: "#2a5caa", text: "#1a3a6b" },
  Student: { bg: "#eaf5ee", border: "#1a7a3a", text: "#0f4a22" },
  "Teaching Assistant": { bg: "#f3eef9", border: "#6b3fa0", text: "#3d1f6b" },
  Unknown: { bg: "#f0ece4", border: "#8a8278", text: "#4a4540" },
};

export default function SpeakerView({ transcript }) {
  const [expandedSpeakers, setExpandedSpeakers] = useState(new Set(
    [...new Set(transcript.map((e) => e.speaker))]
  ));

  const speakers = [...new Set(transcript.map((e) => e.speaker))];

  const toggleSpeaker = (speaker) => {
    setExpandedSpeakers((prev) => {
      const next = new Set(prev);
      next.has(speaker) ? next.delete(speaker) : next.add(speaker);
      return next;
    });
  };

  const groupedBySpeaker = speakers.map((speaker) => ({
    speaker,
    entries: transcript.filter((e) => e.speaker === speaker),
  }));

  return (
    <div className="speaker-view" aria-label="Speaker view of transcript">
      <p className="view-description">
        Transcript entries grouped by speaker. Click a speaker to collapse or expand their entries.
      </p>

      <div className="speaker-groups" role="list">
        {groupedBySpeaker.map(({ speaker, entries }) => {
          const colors = SPEAKER_COLORS[speaker] || SPEAKER_COLORS.Unknown;
          const isExpanded = expandedSpeakers.has(speaker);
          const lowCount = entries.filter((e) => e.confidence === "low").length;
          const tagCounts = {};
          entries.forEach((e) => e.tags?.forEach((t) => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));

          return (
            <div
              key={speaker}
              className="speaker-group"
              role="listitem"
              style={{ borderColor: colors.border }}>

              {/* Speaker header */}
              <button
                className="speaker-header"
                onClick={() => toggleSpeaker(speaker)}
                aria-expanded={isExpanded}
                aria-controls={`speaker-entries-${speaker}`}
                style={{ background: colors.bg, borderBottom: `2px solid ${colors.border}` }}>
                <span className="speaker-name" style={{ color: colors.text }}>
                  {speaker}
                </span>
                <div className="speaker-stats">
                  <span className="speaker-stat">{entries.length} entries</span>
                  {lowCount > 0 && (
                    <span className="speaker-stat speaker-stat-warn">
                      ⚠ {lowCount} low confidence
                    </span>
                  )}
                  {Object.entries(tagCounts).slice(0, 3).map(([tag, count]) => (
                    <span key={tag} className="tag-chip" aria-label={`${count} ${tag} entries`}>
                      {tag} ×{count}
                    </span>
                  ))}
                </div>
                <span className="speaker-toggle" aria-hidden="true">
                  {isExpanded ? "▲" : "▼"}
                </span>
              </button>

              {/* Speaker entries */}
              <div
                id={`speaker-entries-${speaker}`}
                className={`speaker-entries ${isExpanded ? "speaker-entries-open" : "speaker-entries-closed"}`}
                aria-label={`Entries by ${speaker}`}>
                {entries.map((entry, i) => (
                  <div
                    key={entry.id}
                    className={`speaker-entry ${entry.confidence === "low" ? "speaker-entry-low" : ""}`}
                    aria-label={`${entry.timestamp}: ${entry.text}`}>
                    <span className="speaker-entry-timestamp">{entry.timestamp}</span>
                    <p className="speaker-entry-text">{entry.text}</p>
                    <div className="speaker-entry-meta">
                      {entry.confidence === "low" && (
                        <span className="confidence-badge" aria-label="Low confidence">
                          <span aria-hidden="true">⚠</span> Low confidence
                        </span>
                      )}
                      {entry.tags?.length > 0 && (
                        <span className="speaker-entry-tags" aria-label={`Tags: ${entry.tags.join(", ")}`}>
                          {entry.tags.map((t) => (
                            <span key={t} className="tag-chip" aria-hidden="true">{t}</span>
                          ))}
                        </span>
                      )}
                      {entry.wordNotes?.length > 0 && (
                        <span className="speaker-entry-notes" aria-label={`${entry.wordNotes.length} annotation${entry.wordNotes.length > 1 ? "s" : ""}`}>
                          📌 {entry.wordNotes.length} annotation{entry.wordNotes.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
