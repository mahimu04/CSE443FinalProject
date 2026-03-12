import { useState } from "react";
import TranscriptRow from "./components/TranscriptRow";
import StudyMode from "./components/StudyMode";
import TranscriptUploader from "./components/TranscriptUploader";
import TimelineView from "./components/TimelineView";
import SpeakerView from "./components/SpeakerView";
import SearchView from "./components/SearchView";
import { sampleTranscript } from "./data/sampleTranscript";
import "./styles/App.css";

export default function App() {
  const [transcript, setTranscript]           = useState(sampleTranscript);
  const [activeTab, setActiveTab]             = useState("upload");
  const [activeView, setActiveView]           = useState("list");
  const [collapsedSections, setCollapsedSections] = useState(new Set());
  const [filterConfidence, setFilterConfidence]   = useState("all");
  const [filterTag, setFilterTag]             = useState("all");
  const [repairConfirmed, setRepairConfirmed] = useState(false); // gates Study Mode

  // ── handlers ──────────────────────────────────────────────
  const handleUpdateEntry = (id, changes) => {
    setTranscript((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...changes } : e))
    );
  };

  const toggleCollapse = (id) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleLoadTranscript = (newTranscript) => {
    setTranscript(newTranscript);
    setCollapsedSections(new Set());
    setFilterConfidence("all");
    setFilterTag("all");
    setRepairConfirmed(false); // reset gate on new upload
    setActiveTab("review");
    setActiveView("list");
  };

  const handleConfirmRepair = () => {
    setRepairConfirmed(true);
    setActiveTab("study");
  };

  // ── derived ───────────────────────────────────────────────
  const filteredTranscript = transcript.filter((e) => {
    const confMatch = filterConfidence === "all" || e.confidence === filterConfidence;
    const tagMatch  = filterTag === "all" || e.tags?.includes(filterTag);
    return confMatch && tagMatch;
  });

  const lowConfidenceCount = transcript.filter((e) => e.confidence === "low").length;
  const editedCount        = transcript.filter((e) => e.edited).length;
  const taggedCount        = transcript.filter((e) => e.tags?.length > 0).length;

  const VIEWS = [
    { id: "list",     label: "📋 List" },
    { id: "timeline", label: "⏱ Timeline" },
    { id: "speaker",  label: "👥 By Speaker" },
    { id: "search",   label: "🔍 Search" },
  ];

  // step indicator logic
  const stepState = (n) => {
    const order = { upload: 1, review: 2, study: 3 };
    const cur = order[activeTab] || 1;
    if (n < cur) return "tab-step-done";
    if (n === cur) return "tab-step-active";
    return "";
  };

  return (
    <div className="app" lang="en">
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* ── Header ── */}
      <header className="app-header" role="banner">
        <div className="header-content">
          <h1 className="app-title">
            <span className="title-icon" aria-hidden="true">📝</span>
            TranscriptAble
          </h1>
          <p className="app-subtitle">The Accessible Transcript Tool</p>
        </div>
        <div className="stats-bar" role="status" aria-live="polite" aria-label="Transcript statistics">
          <span className="stat"><strong>{transcript.length}</strong> segments</span>
          <span className="stat stat-warning"><strong>{lowConfidenceCount}</strong> low confidence</span>
          <span className="stat stat-edited"><strong>{editedCount}</strong> edited</span>
          <span className="stat"><strong>{taggedCount}</strong> tagged</span>
        </div>
      </header>



      {/* ── Tab nav ── */}
      <nav className="tab-nav" role="tablist" aria-label="Application steps">
        <div className="tab-step-indicator" aria-hidden="true">
          <span className={`tab-step ${stepState(1)}`}>1</span>
          <span className="tab-step-line" />
          <span className={`tab-step ${stepState(2)}`}>2</span>
          <span className="tab-step-line" />
          <span className={`tab-step ${stepState(3)}`}>3</span>
        </div>
        <div className="tab-btns" role="presentation">
          <button
            role="tab"
            id="upload-tab"
            aria-selected={activeTab === "upload"}
            aria-controls="upload-panel"
            className={`tab-btn ${activeTab === "upload" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("upload")}>
            📂 Upload
          </button>
          <span className="tab-arrow" aria-hidden="true">→</span>
          <button
            role="tab"
            id="review-tab"
            aria-selected={activeTab === "review"}
            aria-controls="review-panel"
            className={`tab-btn ${activeTab === "review" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("review")}>
            🔍 Review & Repair
          </button>
          <span className="tab-arrow" aria-hidden="true">→</span>
          <button
            role="tab"
            id="study-tab"
            aria-selected={activeTab === "study"}
            aria-controls="study-panel"
            aria-disabled={!repairConfirmed}
            disabled={!repairConfirmed}
            className={`tab-btn ${activeTab === "study" ? "tab-active" : ""} ${!repairConfirmed ? "tab-btn-locked" : ""}`}
            onClick={() => repairConfirmed && setActiveTab("study")}
            title={!repairConfirmed ? "Confirm your repairs first to unlock Study Mode" : undefined}>
            📚 Study Mode {!repairConfirmed && <span className="lock-icon" aria-hidden="true">🔒</span>}
          </button>
        </div>
      </nav>

      <main id="main-content" className="main-content">

        {/* ── STEP 1: UPLOAD ── */}
        {activeTab === "upload" && (
          <div id="upload-panel" role="tabpanel" aria-labelledby="upload-tab" className="panel upload-panel-full">
            <div className="upload-panel-inner">
              <h2 className="upload-heading">
                <span aria-hidden="true">📂</span> Upload Your Transcript
              </h2>
              <p className="upload-subheading">
                Paste or load a transcript below. Supported: timestamped, speaker-labeled, or plain text lines.
              </p>
              <TranscriptUploader onLoad={handleLoadTranscript} onClose={() => {}} embedded />
            </div>
          </div>
        )}

        {/* ── STEP 2: REVIEW & REPAIR ── */}
        {activeTab === "review" && (
          <div id="review-panel" role="tabpanel" aria-labelledby="review-tab" className="panel">

            {/* Instruction banner */}
            <div className="repair-instruction-banner" role="note">
              <div className="repair-banner-text">
                <span aria-hidden="true">🛠</span>
                <div>
                  <strong>Review & Repair your transcript.</strong>
                  <span> Fix errors, relabel speakers, and tag key entries. When you're satisfied, confirm below to unlock Study Mode.</span>
                </div>
              </div>
              <div className="repair-banner-actions">
                <button
                  className="btn btn-explore-views"
                  onClick={() => setActiveView(activeView === "list" ? "timeline" : "list")}
                  aria-label="Explore different transcript views">
                  🔭 Explore Views
                </button>
                <button
                  className="btn btn-confirm-repair"
                  onClick={handleConfirmRepair}
                  aria-label="Confirm transcript is correct and go to Study Mode">
                  ✅ Looks good — send to Study Mode
                </button>
              </div>
            </div>

            {/* View switcher */}
            <div className="view-switcher" role="group" aria-label="Transcript view options">
              <span className="view-switcher-label" aria-hidden="true">View:</span>
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  className={`view-btn ${activeView === v.id ? "view-btn-active" : ""}`}
                  onClick={() => setActiveView(v.id)}
                  aria-pressed={activeView === v.id}
                  aria-label={`Switch to ${v.label} view`}>
                  {v.label}
                </button>
              ))}
            </div>

            {/* LIST VIEW */}
            {activeView === "list" && (
              <>
                <div className="filter-bar" role="search" aria-label="Filter transcript entries">
                  <div className="filter-group">
                    <label htmlFor="conf-filter" className="filter-label">Confidence:</label>
                    <select id="conf-filter" value={filterConfidence} onChange={(e) => setFilterConfidence(e.target.value)}>
                      <option value="all">All</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label htmlFor="tag-filter" className="filter-label">Tag:</label>
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
                  <button className="btn btn-expand-all"   onClick={() => setCollapsedSections(new Set())} aria-label="Expand all">Expand All</button>
                </div>

                <div className="legend" role="note" aria-label="Color coding legend">
                  <span className="legend-item legend-low">⚠ Low Confidence</span>
                  <span className="legend-item legend-high">✓ High Confidence</span>
                  <span className="legend-item legend-edited">✏ Edited</span>
                </div>

                <div className="transcript-list" role="feed" aria-label="Transcript entries" aria-live="polite">
                  {filteredTranscript.length === 0
                    ? <p className="empty-state">No entries match your filters.</p>
                    : filteredTranscript.map((entry) => (
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
                              transcript={transcript}
                            />
                          </div>
                        </div>
                      ))
                  }
                </div>

                {/* Bottom confirm bar */}
                <div className="repair-confirm-footer">
                  <p className="repair-confirm-hint">
                    {editedCount > 0 || taggedCount > 0
                      ? `${editedCount} edit${editedCount !== 1 ? "s" : ""} · ${taggedCount} tagged — looking good!`
                      : "Make any edits or tags above, then confirm when ready."}
                  </p>
                  <div className="repair-confirm-btns">
                    <button
                      className="btn btn-explore-views"
                      onClick={() => setActiveView("timeline")}
                      aria-label="Explore timeline view">
                      🔭 Explore Views
                    </button>
                    <button
                      className="btn btn-confirm-repair"
                      onClick={handleConfirmRepair}
                      aria-label="Confirm and go to Study Mode">
                      ✅ Looks good — send to Study Mode
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeView === "timeline" && <TimelineView transcript={transcript} />}
            {activeView === "speaker"  && <SpeakerView  transcript={transcript} />}
            {activeView === "search"   && <SearchView   transcript={transcript} />}

            {/* Back-to-list confirm bar for non-list views */}
            {activeView !== "list" && (
              <div className="repair-confirm-footer">
                <div className="repair-confirm-btns">
                  <button className="btn btn-explore-views" onClick={() => setActiveView("list")} aria-label="Back to list view">
                    ← Back to List
                  </button>
                  <button className="btn btn-confirm-repair" onClick={handleConfirmRepair} aria-label="Confirm and go to Study Mode">
                    ✅ Looks good — send to Study Mode
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: STUDY MODE ── */}
        {activeTab === "study" && repairConfirmed && (
          <div id="study-panel" role="tabpanel" aria-labelledby="study-tab" className="panel">
            <StudyMode transcript={transcript} />
          </div>
        )}

        {/* Fallback if someone somehow lands on study without confirming */}
        {activeTab === "study" && !repairConfirmed && (
          <div className="panel locked-panel" role="alert">
            <p>🔒 Please complete Review & Repair and confirm your transcript first.</p>
            <button className="btn btn-confirm-repair" onClick={() => setActiveTab("review")}>
              Go to Review & Repair
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
