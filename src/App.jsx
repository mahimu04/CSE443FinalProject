import { useState } from "react";
import TranscriptRow from "./components/TranscriptRow";
import StudyMode from "./components/StudyMode";
import { sampleTranscript } from "./data/sampleTranscript";
import "./styles/App.css";

export default function App() {
  const [transcript, setTranscript] = useState(sampleTranscript);
  const [activeTab, setActiveTab] = useState("review"); // "review" | "study"
  const [collapsedSections, setCollapsedSections] = useState(new Set());
  const [filterConfidence, setFilterConfidence] = useState("all");
  const [filterTag, setFilterTag] = useState("all");

  const handleUpdateEntry = (id, changes) => {
    setTranscript((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...changes } : entry))
    );
  };

  const toggleCollapse = (id) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredTranscript = transcript.filter((e) => {
    const confMatch = filterConfidence === "all" || e.confidence === filterConfidence;
    const tagMatch = filterTag === "all" || e.tags?.includes(filterTag);
    return confMatch && tagMatch;
  });

  const lowConfidenceCount = transcript.filter((e) => e.confidence === "low").length;
  const editedCount = transcript.filter((e) => e.edited).length;

  return (
    <div className="app" lang="en">
      {/* Skip Navigation for accessibility */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Header */}
      <header className="app-header" role="banner">
        <div className="header-content">
          <h1 className="app-title">
            <span className="title-icon" aria-hidden="true">📝</span>
            Transcript Review Tool
          </h1>
          <p className="app-subtitle">CSE 443 — Accessible AI Transcript Tool</p>
        </div>

        {/* Stats bar */}
        <div className="stats-bar" role="status" aria-live="polite" aria-label="Transcript statistics">
          <span className="stat">
            <strong>{transcript.length}</strong> segments
          </span>
          <span className="stat stat-warning">
            <strong>{lowConfidenceCount}</strong> low confidence
          </span>
          <span className="stat stat-edited">
            <strong>{editedCount}</strong> edited
          </span>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="tab-nav" role="tablist" aria-label="Application modes">
        <button
          role="tab"
          aria-selected={activeTab === "review"}
          aria-controls="review-panel"
          id="review-tab"
          className={`tab-btn ${activeTab === "review" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("review")}>
          🔍 Review & Repair
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "study"}
          aria-controls="study-panel"
          id="study-tab"
          className={`tab-btn ${activeTab === "study" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("study")}>
          📚 Study Mode
        </button>
      </nav>

      {/* Main Content */}
      <main id="main-content" className="main-content">

        {/* Review Mode Panel */}
        {activeTab === "review" && (
          <div
            id="review-panel"
            role="tabpanel"
            aria-labelledby="review-tab"
            className="panel">

            {/* Filters */}
            <div className="filter-bar" role="search" aria-label="Filter transcript entries">
              <div className="filter-group">
                <label htmlFor="conf-filter" className="filter-label">Filter by confidence:</label>
                <select
                  id="conf-filter"
                  value={filterConfidence}
                  onChange={(e) => setFilterConfidence(e.target.value)}>
                  <option value="all">All</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="tag-filter" className="filter-label">Filter by tag:</label>
                <select
                  id="tag-filter"
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}>
                  <option value="all">All</option>
                  <option value="Key Concept">Key Concept</option>
                  <option value="Definition">Definition</option>
                  <option value="Example">Example</option>
                  <option value="Question">Question</option>
                  <option value="Action Item">Action Item</option>
                </select>
              </div>
              <button
                className="btn btn-collapse-all"
                onClick={() => setCollapsedSections(new Set(transcript.map((e) => e.id)))}
                aria-label="Collapse all transcript entries">
                Collapse All
              </button>
              <button
                className="btn btn-expand-all"
                onClick={() => setCollapsedSections(new Set())}
                aria-label="Expand all transcript entries">
                Expand All
              </button>
            </div>

            {/* Legend */}
            <div className="legend" role="note" aria-label="Color coding legend">
              <span className="legend-item legend-low">⚠ Low Confidence</span>
              <span className="legend-item legend-high">✓ High Confidence</span>
              <span className="legend-item legend-edited">✏ User Edited</span>
            </div>

            {/* Transcript Entries */}
            <div
              className="transcript-list"
              role="feed"
              aria-label="Transcript entries"
              aria-live="polite">
              {filteredTranscript.length === 0 ? (
                <p className="empty-state">No entries match your current filters.</p>
              ) : (
                filteredTranscript.map((entry) => (
                  <div key={entry.id} className="entry-wrapper">
                    <button
                      className="collapse-toggle"
                      onClick={() => toggleCollapse(entry.id)}
                      aria-expanded={!collapsedSections.has(entry.id)}
                      aria-controls={`entry-${entry.id}`}
                      aria-label={`${collapsedSections.has(entry.id) ? "Expand" : "Collapse"} entry at ${entry.timestamp}`}>
                      {collapsedSections.has(entry.id) ? "▶" : "▼"} {entry.timestamp}
                    </button>
                    <div id={`entry-${entry.id}`}>
                      <TranscriptRow
                        entry={entry}
                        onUpdate={handleUpdateEntry}
                        isCollapsed={collapsedSections.has(entry.id)}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Study Mode Panel */}
        {activeTab === "study" && (
          <div
            id="study-panel"
            role="tabpanel"
            aria-labelledby="study-tab"
            className="panel">
            <StudyMode transcript={transcript} />
          </div>
        )}
      </main>
    </div>
  );
}
