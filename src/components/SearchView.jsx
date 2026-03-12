import { useState, useRef, useEffect } from "react";

function highlightText(text, query) {
  if (!query.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="search-highlight">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function SearchView({ transcript }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const matchRefs = useRef([]);

  const trimmed = query.trim().toLowerCase();

  const matches = trimmed
    ? transcript.filter((e) => e.text.toLowerCase().includes(trimmed))
    : [];

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (matches.length > 0 && matchRefs.current[activeIndex]) {
      matchRefs.current[activeIndex].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeIndex, matches.length]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (matches.length === 0) return;
      setActiveIndex((prev) => (prev + 1) % matches.length);
    }
  };

  const allEntries = trimmed ? matches : transcript;

  return (
    <div className="search-view" aria-label="Search transcript">

      {/* Search bar */}
      <div className="search-bar-wrapper" role="search" aria-label="Search transcript entries">
        <label htmlFor="transcript-search" className="sr-only">Search transcript</label>
        <div className="search-input-row">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            id="transcript-search"
            ref={inputRef}
            type="search"
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for any word or phrase…"
            aria-label="Search transcript text"
            aria-describedby="search-results-count"
            autoFocus
          />
          {query && (
            <button
              className="search-clear"
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              aria-label="Clear search">
              ✕
            </button>
          )}
        </div>

        {/* Results count + navigation */}
        <div className="search-controls">
          <span
            id="search-results-count"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="search-count">
            {trimmed
              ? matches.length === 0
                ? "No results found"
                : `${matches.length} result${matches.length !== 1 ? "s" : ""} — press Enter to navigate`
              : `${transcript.length} entries`}
          </span>
          {matches.length > 1 && (
            <div className="search-nav" role="group" aria-label="Navigate search results">
              <button
                className="btn-search-nav"
                onClick={() => setActiveIndex((prev) => (prev - 1 + matches.length) % matches.length)}
                aria-label="Previous result">
                ↑
              </button>
              <span className="search-nav-pos" aria-live="polite">
                {activeIndex + 1} / {matches.length}
              </span>
              <button
                className="btn-search-nav"
                onClick={() => setActiveIndex((prev) => (prev + 1) % matches.length)}
                aria-label="Next result">
                ↓
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div
        className="search-results"
        role="list"
        aria-label={trimmed ? "Search results" : "All transcript entries"}
        aria-live="polite">
        {allEntries.length === 0 && trimmed ? (
          <p className="empty-state">No entries contain "{query}".</p>
        ) : (
          allEntries.map((entry, i) => {
            const matchIdx = matches.indexOf(entry);
            const isActive = trimmed && matchIdx === activeIndex;
            return (
              <div
                key={entry.id}
                ref={(el) => { if (trimmed) matchRefs.current[matchIdx] = el; }}
                className={`search-entry ${entry.confidence === "low" ? "confidence-low" : ""} ${isActive ? "search-entry-active" : ""}`}
                role="listitem"
                aria-label={`${entry.timestamp}, ${entry.speaker}: ${entry.text}`}
                aria-current={isActive ? "true" : undefined}
                tabIndex={isActive ? 0 : -1}>
                <div className="search-entry-meta">
                  <span className="timestamp">
                    <span className="sr-only">At </span>{entry.timestamp}
                  </span>
                  <span className="search-entry-speaker">{entry.speaker}</span>
                  {entry.confidence === "low" && (
                    <span className="confidence-badge" aria-label="Low confidence">
                      <span aria-hidden="true">⚠</span> Low
                    </span>
                  )}
                  {entry.tags?.length > 0 && (
                    <span aria-label={`Tags: ${entry.tags.join(", ")}`}>
                      {entry.tags.map((t) => (
                        <span key={t} className="tag-chip" aria-hidden="true">{t}</span>
                      ))}
                    </span>
                  )}
                </div>
                <p className="search-entry-text">
                  {highlightText(entry.text, query)}
                </p>
                {entry.wordNotes?.length > 0 && (
                  <ul className="search-entry-notes" aria-label="Annotations">
                    {entry.wordNotes.map((n) => (
                      <li key={n.id} className="word-note-item">
                        <span className="word-note-word">"{n.word}":</span>
                        <span className="word-note-text">{n.note}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
