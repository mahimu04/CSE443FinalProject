export default function TimelineView({ transcript }) {
    // Parse timestamp string to seconds
    const toSeconds = (ts) => {
      const parts = ts.split(":").map(Number);
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      return 0;
    };
  
    const withSeconds = transcript.map((e) => ({
      ...e,
      seconds: toSeconds(e.timestamp),
    }));
  
    const maxSeconds = Math.max(...withSeconds.map((e) => e.seconds), 1);
  
    const SPEAKER_COLORS = {
      Professor: "#2a5caa",
      Student: "#1a7a3a",
      "Teaching Assistant": "#6b3fa0",
      Unknown: "#8a8278",
    };
  
    const confidencePattern = {
      low: "⚠",
      medium: "◈",
      high: "●",
    };
  
    return (
      <div className="timeline-view" aria-label="Timeline view of transcript">
        <p className="view-description">
          Each entry is positioned along a timeline based on its timestamp. Width reflects relative position in the lecture.
        </p>
  
        {/* Legend */}
        <div className="timeline-legend" role="note" aria-label="Speaker color legend">
          {Object.entries(SPEAKER_COLORS).map(([speaker, color]) => (
            <span key={speaker} className="legend-speaker">
              <span className="legend-dot" style={{ background: color }} aria-hidden="true" />
              {speaker}
            </span>
          ))}
          <span className="legend-divider" aria-hidden="true">·</span>
          <span className="legend-conf">⚠ Low</span>
          <span className="legend-conf">◈ Medium</span>
          <span className="legend-conf">● High</span>
        </div>
  
        {/* Timeline bar */}
        <div className="timeline-bar-container" aria-hidden="true">
          <div className="timeline-bar" />
          {[0, 25, 50, 75, 100].map((pct) => {
            const sec = Math.round((pct / 100) * maxSeconds);
            const mins = Math.floor(sec / 60);
            const secs = sec % 60;
            return (
              <span
                key={pct}
                className="timeline-tick"
                style={{ left: `${pct}%` }}>
                {mins}:{String(secs).padStart(2, "0")}
              </span>
            );
          })}
        </div>
  
        {/* Entries */}
        <div className="timeline-entries" role="list" aria-label="Timeline entries">
          {withSeconds.map((entry) => {
            const pct = (entry.seconds / maxSeconds) * 100;
            const color = SPEAKER_COLORS[entry.speaker] || SPEAKER_COLORS.Unknown;
            const conf = confidencePattern[entry.confidence] || "●";
            return (
              <div
                key={entry.id}
                className={`timeline-entry ${entry.confidence === "low" ? "timeline-entry-low" : ""}`}
                role="listitem"
                aria-label={`${entry.timestamp} — ${entry.speaker}: ${entry.text}`}>
                {/* dot on the bar */}
                <div
                  className="timeline-dot"
                  style={{ left: `${pct}%`, background: color }}
                  aria-hidden="true"
                />
                {/* connector line */}
                <div
                  className="timeline-connector"
                  style={{ left: `${pct}%` }}
                  aria-hidden="true"
                />
                {/* card, alternating above/below */}
                <div
                  className="timeline-card"
                  style={{
                    left: `clamp(0px, calc(${pct}% - 100px), calc(100% - 220px))`,
                    borderLeftColor: color,
                  }}>
                  <div className="timeline-card-meta">
                    <span className="timeline-timestamp">{entry.timestamp}</span>
                    <span className="timeline-speaker" style={{ color }}>
                      {entry.speaker}
                    </span>
                    <span className="timeline-conf" aria-label={`${entry.confidence} confidence`}>
                      {conf}
                    </span>
                    {entry.tags?.length > 0 && (
                      <span className="timeline-tags" aria-label={`Tags: ${entry.tags.join(", ")}`}>
                        {entry.tags.map((t) => (
                          <span key={t} className="tag-chip" aria-hidden="true">{t}</span>
                        ))}
                      </span>
                    )}
                  </div>
                  <p className="timeline-text">{entry.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  