import { useState } from "react";
import TranscriptRow from "./components/TranscriptRow";
import StudyMode from "./components/StudyMode";
import AIAssistant from "./components/AIAssistant";
import TranscriptUploader from "./components/TranscriptUploader";
import { sampleTranscript } from "./data/sampleTranscript";
import "./styles/App.css";

export default function App() {
  const [transcript, setTranscript] = useState(sampleTranscript);
  const [activeTab, setActiveTab] = useState("review");
  const [collapsedSections, setCollapsedSections] = useState(new Set());
  const [filterConfidence, setFilterConfidence] = useState("all");
  const [filterTag, setFilterTag] = useState("all");
  const [transcriptContext, setTranscriptContext] = useState("");
  const [contextSaved, setContextSaved] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

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

  const handleSaveContext = () => {
    setContextSaved(true);
    setTimeout(() => setContextSaved(false), 2500);
  };

  const handleLoadTranscript = (newTranscript) => {
    setTranscript(newTranscript);
    setShowUploader(false);
    setCollapsedSections(new Set());
    setFilterConfidence("all");
    setFilterTag("all");
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
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <header className="app-header" role="banner">
        <div className="header-content">
          <h1 className="app-title">
            <span className="title-icon" aria-hidden="true">📝</span>
            Transcript Review Tool
          </h1>
          <p className="app-subtitle">CSE 443 — Accessible AI Transcript Tool</p>
        </div>
        <div className="stats-bar" role="status" aria-live="polite" aria-label="Transcript statistics">
          <span className="stat"><strong>{transcript.length}</strong> segments</span>
          <span className="stat stat-warning"><strong>{lowConfidenceCount}</strong> low confidence</span>
          <span className="stat stat-edited"><strong>{editedCount}</strong> edited</span>
          <button
            className="btn btn-load-transcript"
            onClick={() => setShowUploader(!showUploader)}
            aria-expanded={showUploader}
            aria-label="Load your own transcript">
            {showUploader ? "✕ Close" : "📂 Load Transcript"}
          </button>
        </div>
      </header>

      {showUploader && (
        <div className="uploader-bar" role="region" aria-label="Load custom transcript">
          <TranscriptUploader onLoad={handleLoadTranscript} onClose={() => setShowUploader(false)} />
        </div>
      )}

      <div className="context-bar" role="region" aria-label="Transcript context">
        <div className="context-inner">
          <label htmlFor="transcript-context" className="context-label">
            <span className="context-label-icon" aria-hidden="true">🧠</span>
            Describe this transcript for AI:
          </label>
          <textarea
            id="transcript-context"
            className="context-textarea"
            value={transcriptContext}
            onChange={(e) => setTranscriptContext(e.target.value)}
            placeholder="e.g. This is a machine learning lecture from CSE 443. Help me identify key concepts for my exam..."
            rows={2}
            aria-describedby="context-hint"
          />
          <div className="context-actions">
            <span id="context-hint" className="context-hint">
              This description helps the AI give more relevant answers in the assistant panel.
            </span>
            <button
              className="btn btn-save-context"
              onClick={handleSaveContext}
              aria-label="Save transcript context">
              {contextSaved ? "✓ Saved!" : "Save Context"}
            </button>
          </div>
        </div>
      </div>

      <nav className="tab-nav" role="tablist" aria-label="Application modes">
        <button role="tab" aria-selected={activeTab === "review"} aria-controls="review-panel" id="review-tab"
          className={`tab-btn ${activeTab === "review" ? "tab-active" : ""}`} onClick={() => setActiveTab("review")}>
          🔍 Review & Repair
        </button>
        <button role="tab" aria-selected={activeTab === "study"} aria-controls="study-panel" id="study-tab"
          className={`tab-btn ${activeTab === "study" ? "tab-active" : ""}`} onClick={() => setActiveTab("study")}>
          📚 Study Mode
        </button>
        <button role="tab" aria-selected={activeTab === "ai"} aria-controls="ai-panel" id="ai-tab"
          className={`tab-btn ${activeTab === "ai" ? "tab-active" : ""}`} onClick={() => setActiveTab("ai")}>
          🤖 AI Assistant
        </button>
      </nav>

      <main id="main-content" className="main-content">
        {activeTab === "review" && (
          <div id="review-panel" role="tabpanel" aria-labelledby="review-tab" className="panel">
            <div className="filter-bar" role="search" aria-label="Filter transcript entries">
              <div className="filter-group">
                <label htmlFor="conf-filter" className="filter-label">Filter by confidence:</label>
                <select id="conf-filter" value={filterConfidence} onChange={(e) => setFilterConfidence(e.target.value)}>
                  <option value="all">All</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="tag-filter" className="filter-label">Filter by tag:</label>
                <select id="tag-filter" value={filterTag} onChange={(e) => setFilterTag(e.target.value)}>
                  <option value="all">All</option>
                  <option value="Key Concept">Key Concept</option>
                  <option value="Definition">Definition</option>
                  <option value="Example">Example</option>
                  <option value="Question">Question</option>
                  <option value="Action Item">Action Item</option>
                </select>
              </div>
              <button className="btn btn-collapse-all" onClick={() => setCollapsedSections(new Set(transcript.map((e) => e.id)))} aria-label="Collapse all">Collapse All</button>
              <button className="btn btn-expand-all" onClick={() => setCollapsedSections(new Set())} aria-label="Expand all">Expand All</button>
            </div>
            <div className="legend" role="note" aria-label="Color coding legend">
              <span className="legend-item legend-low">⚠ Low Confidence</span>
              <span className="legend-item legend-high">✓ High Confidence</span>
              <span className="legend-item legend-edited">✏ User Edited</span>
            </div>
            <div className="transcript-list" role="feed" aria-label="Transcript entries" aria-live="polite">
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
                      <TranscriptRow entry={entry} onUpdate={handleUpdateEntry} isCollapsed={collapsedSections.has(entry.id)} transcript={transcript} transcriptContext={transcriptContext} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "study" && (
          <div id="study-panel" role="tabpanel" aria-labelledby="study-tab" className="panel">
            <StudyMode transcript={transcript} />
          </div>
        )}

        {activeTab === "ai" && (
          <div id="ai-panel" role="tabpanel" aria-labelledby="ai-tab" className="panel">
            <AIAssistant transcript={transcript} transcriptContext={transcriptContext} />
          </div>
        )}
      </main>
    </div>
  );
}