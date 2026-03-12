import { useState, useRef } from "react";

// ── Rule-based outline generator ──────────────────────────────
function buildOutline(transcript) {
  const keyConcepts   = transcript.filter((e) => e.tags?.includes("Key Concept"));
  const definitions   = transcript.filter((e) => e.tags?.includes("Definition"));
  const examples      = transcript.filter((e) => e.tags?.includes("Example"));
  const questions     = transcript.filter((e) => e.tags?.includes("Question"));
  const actionItems   = transcript.filter((e) => e.tags?.includes("Action Item"));
  const allTagged     = transcript.filter((e) => e.tags?.length > 0);
  const professorHigh = transcript.filter(
    (e) => e.speaker === "Professor" && e.confidence !== "low"
  );
  const summary = professorHigh
    .map((e) => e.text)
    .join(" ")
    .substring(0, 500) + (professorHigh.length ? "…" : "No high-confidence professor entries found.");
  const allAnnotations = transcript.flatMap((e) =>
    (e.wordNotes || []).map((n) => ({ ...n, timestamp: e.timestamp }))
  );
  return { keyConcepts, definitions, examples, questions, actionItems, allTagged, summary, allAnnotations };
}

// ── Note format templates ──────────────────────────────────────
const NOTE_FORMATS = [
  { id: "structured", label: "📋 Structured Outline" },
  { id: "cornell",    label: "📓 Cornell Notes" },
  { id: "mednotes",   label: "🩺 Med Notes" },
  { id: "todos",      label: "✅ To-Dos" },
  { id: "custom",     label: "✏️ Custom" },
];

// ── Structured Outline ─────────────────────────────────────────
function StructuredOutline({ data, fontSize }) {
  const { keyConcepts, definitions, examples, summary, allAnnotations } = data;
  return (
    <div className="note-template" style={{ fontSize }}>
      <section className="note-section" aria-labelledby="note-summary">
        <h3 id="note-summary"><span aria-hidden="true">📋</span> Summary</h3>
        <p>{summary}</p>
      </section>

      <section className="note-section note-keyconcepts" aria-labelledby="note-kc">
        <h3 id="note-kc"><span aria-hidden="true">⭐</span> Key Concepts</h3>
        {keyConcepts.length === 0
          ? <p className="empty-state">No entries tagged as Key Concept yet.</p>
          : <ul>{keyConcepts.map((e) => <li key={e.id}><span className="note-ts">{e.timestamp}</span>{e.text}</li>)}</ul>}
      </section>

      <section className="note-section" aria-labelledby="note-defs">
        <h3 id="note-defs"><span aria-hidden="true">📖</span> Definitions</h3>
        {definitions.length === 0
          ? <p className="empty-state">No entries tagged as Definition yet.</p>
          : <dl>{definitions.map((e) => (
              <div key={e.id} className="definition-item">
                <dt className="note-ts">{e.timestamp}</dt>
                <dd>{e.text}</dd>
              </div>))}</dl>}
      </section>

      <section className="note-section" aria-labelledby="note-ex">
        <h3 id="note-ex"><span aria-hidden="true">🔍</span> Examples</h3>
        {examples.length === 0
          ? <p className="empty-state">No entries tagged as Example yet.</p>
          : <ul>{examples.map((e) => <li key={e.id}><span className="note-ts">{e.timestamp}</span>{e.text}</li>)}</ul>}
      </section>

      {allAnnotations.length > 0 && (
        <section className="note-section" aria-labelledby="note-ann">
          <h3 id="note-ann"><span aria-hidden="true">📌</span> Your Annotations</h3>
          <ul>{allAnnotations.map((n) => (
            <li key={n.id}><span className="note-ts">{n.timestamp}</span><strong>"{n.word}":</strong> {n.note}</li>))}</ul>
        </section>
      )}
    </div>
  );
}

// ── Cornell Notes ──────────────────────────────────────────────
function CornellNotes({ data, fontSize }) {
  const { keyConcepts, definitions, examples, questions, summary } = data;
  return (
    <div className="note-template cornell-template" style={{ fontSize }} aria-label="Cornell Notes format">
      <div className="cornell-header">
        <h3><span aria-hidden="true">📓</span> Cornell Notes</h3>
        <p className="cornell-hint">Cue column (left) — Notes column (right) — Summary (bottom)</p>
      </div>
      <div className="cornell-body">
        {/* Cue column: key concepts & questions */}
        <div className="cornell-cue" role="region" aria-label="Cue column — key concepts and questions">
          <div className="cornell-col-label">Cues / Questions</div>
          {keyConcepts.length === 0 && questions.length === 0
            ? <p className="empty-state">Tag entries as Key Concept or Question to populate this column.</p>
            : <>
                {keyConcepts.map((e) => (
                  <div key={e.id} className="cornell-cue-item">
                    <span className="note-ts">{e.timestamp}</span>
                    <p>{e.text}</p>
                  </div>
                ))}
                {questions.map((e) => (
                  <div key={e.id} className="cornell-cue-item cornell-question">
                    <span className="note-ts">{e.timestamp}</span>
                    <p>❓ {e.text}</p>
                  </div>
                ))}
              </>}
        </div>
        {/* Notes column: definitions + examples */}
        <div className="cornell-notes-col" role="region" aria-label="Notes column — definitions and examples">
          <div className="cornell-col-label">Notes</div>
          {definitions.length === 0 && examples.length === 0
            ? <p className="empty-state">Tag entries as Definition or Example to populate this column.</p>
            : <>
                {definitions.map((e) => (
                  <div key={e.id} className="cornell-note-item">
                    <span className="note-ts">{e.timestamp}</span>
                    <p><strong>DEF:</strong> {e.text}</p>
                  </div>
                ))}
                {examples.map((e) => (
                  <div key={e.id} className="cornell-note-item">
                    <span className="note-ts">{e.timestamp}</span>
                    <p><em>Ex:</em> {e.text}</p>
                  </div>
                ))}
              </>}
        </div>
      </div>
      {/* Summary row */}
      <div className="cornell-summary" role="region" aria-label="Summary row">
        <div className="cornell-col-label">Summary</div>
        <p>{summary}</p>
      </div>
    </div>
  );
}

// ── Med Notes ──────────────────────────────────────────────────
function MedNotes({ data, fontSize }) {
  const { keyConcepts, definitions, examples, actionItems, questions } = data;
  return (
    <div className="note-template mednotes-template" style={{ fontSize }} aria-label="Medical Notes format">
      <h3><span aria-hidden="true">🩺</span> Medical / Technical Notes</h3>
      <p className="template-hint">Organized by concept → definition → clinical examples → follow-up</p>

      <section className="note-section mednote-concepts" aria-labelledby="med-concepts">
        <h4 id="med-concepts">Core Concepts</h4>
        {keyConcepts.length === 0
          ? <p className="empty-state">Tag entries as Key Concept to populate this section.</p>
          : <ul className="mednote-list">{keyConcepts.map((e) => (
              <li key={e.id}><span className="note-ts">{e.timestamp}</span>{e.text}</li>))}</ul>}
      </section>

      <section className="note-section mednote-defs" aria-labelledby="med-defs">
        <h4 id="med-defs">Definitions & Mechanisms</h4>
        {definitions.length === 0
          ? <p className="empty-state">Tag entries as Definition to populate this section.</p>
          : <ul className="mednote-list">{definitions.map((e) => (
              <li key={e.id}><span className="note-ts">{e.timestamp}</span>{e.text}</li>))}</ul>}
      </section>

      <section className="note-section mednote-examples" aria-labelledby="med-ex">
        <h4 id="med-ex">Clinical / Applied Examples</h4>
        {examples.length === 0
          ? <p className="empty-state">Tag entries as Example to populate this section.</p>
          : <ul className="mednote-list">{examples.map((e) => (
              <li key={e.id}><span className="note-ts">{e.timestamp}</span>{e.text}</li>))}</ul>}
      </section>

      <section className="note-section mednote-followup" aria-labelledby="med-fu">
        <h4 id="med-fu">Follow-Up Questions</h4>
        {questions.length === 0
          ? <p className="empty-state">Tag entries as Question to populate this section.</p>
          : <ul className="mednote-list">{questions.map((e) => (
              <li key={e.id}><span className="note-ts">{e.timestamp}</span>{e.text}</li>))}</ul>}
      </section>

      {actionItems.length > 0 && (
        <section className="note-section mednote-actions" aria-labelledby="med-act">
          <h4 id="med-act">Action Items</h4>
          <ul className="mednote-list">{actionItems.map((e) => (
            <li key={e.id}><span className="note-ts">{e.timestamp}</span>{e.text}</li>))}</ul>
        </section>
      )}
    </div>
  );
}

// ── To-Dos ─────────────────────────────────────────────────────
function TodoNotes({ data, fontSize }) {
  const [checked, setChecked] = useState({});
  const { actionItems, questions, keyConcepts } = data;

  const toggle = (id) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const TodoItem = ({ entry, prefix = "" }) => (
    <li className={`todo-item ${checked[entry.id] ? "todo-done" : ""}`}>
      <label className="todo-label">
        <input
          type="checkbox"
          checked={!!checked[entry.id]}
          onChange={() => toggle(entry.id)}
          aria-label={`Mark as done: ${entry.text}`}
        />
        <span className="note-ts">{entry.timestamp}</span>
        <span className="todo-text">{prefix}{entry.text}</span>
      </label>
    </li>
  );

  const hasAnything = actionItems.length > 0 || questions.length > 0 || keyConcepts.length > 0;

  return (
    <div className="note-template todo-template" style={{ fontSize }} aria-label="To-Do Notes format">
      <h3><span aria-hidden="true">✅</span> To-Do Notes</h3>
      <p className="template-hint">Check off items as you review and study.</p>

      {!hasAnything && (
        <p className="empty-state">Tag entries as Action Item, Question, or Key Concept to populate your to-do list.</p>
      )}

      {actionItems.length > 0 && (
        <section className="note-section" aria-labelledby="todo-actions">
          <h4 id="todo-actions">Action Items</h4>
          <ul className="todo-list" aria-label="Action items checklist">
            {actionItems.map((e) => <TodoItem key={e.id} entry={e} />)}
          </ul>
        </section>
      )}

      {questions.length > 0 && (
        <section className="note-section" aria-labelledby="todo-questions">
          <h4 id="todo-questions">Questions to Follow Up</h4>
          <ul className="todo-list" aria-label="Questions checklist">
            {questions.map((e) => <TodoItem key={e.id} entry={e} prefix="❓ " />)}
          </ul>
        </section>
      )}

      {keyConcepts.length > 0 && (
        <section className="note-section" aria-labelledby="todo-review">
          <h4 id="todo-review">Concepts to Review</h4>
          <ul className="todo-list" aria-label="Key concepts to review checklist">
            {keyConcepts.map((e) => <TodoItem key={e.id} entry={e} />)}
          </ul>
        </section>
      )}
    </div>
  );
}

// ── Custom Notes ───────────────────────────────────────────────
function CustomNotes({ data, fontSize }) {
  const { keyConcepts, definitions, examples, questions, actionItems, allAnnotations } = data;
  const [selected, setSelected] = useState({
    keyConcepts: true,
    definitions: true,
    examples: true,
    questions: false,
    actionItems: false,
    annotations: false,
  });

  const toggle = (key) => setSelected((prev) => ({ ...prev, [key]: !prev[key] }));

  const SECTIONS = [
    { key: "keyConcepts",  label: "⭐ Key Concepts",   data: keyConcepts },
    { key: "definitions",  label: "📖 Definitions",    data: definitions },
    { key: "examples",     label: "🔍 Examples",       data: examples },
    { key: "questions",    label: "❓ Questions",       data: questions },
    { key: "actionItems",  label: "✅ Action Items",   data: actionItems },
    { key: "annotations",  label: "📌 Annotations",    data: allAnnotations },
  ];

  return (
    <div className="note-template custom-template" style={{ fontSize }} aria-label="Custom Notes format">
      <h3><span aria-hidden="true">✏️</span> Custom Notes</h3>
      <p className="template-hint">Choose which sections to include in your notes.</p>

      <div className="custom-toggles" role="group" aria-label="Toggle sections">
        {SECTIONS.map((s) => (
          <label key={s.key} className={`custom-toggle ${selected[s.key] ? "custom-toggle-on" : ""}`}>
            <input
              type="checkbox"
              checked={selected[s.key]}
              onChange={() => toggle(s.key)}
              aria-label={`Include ${s.label}`}
            />
            {s.label}
          </label>
        ))}
      </div>

      {SECTIONS.filter((s) => selected[s.key]).map((s) => (
        <section key={s.key} className="note-section" aria-labelledby={`custom-${s.key}`}>
          <h4 id={`custom-${s.key}`}>{s.label}</h4>
          {s.data.length === 0
            ? <p className="empty-state">No entries tagged yet.</p>
            : <ul>{s.data.map((e) => (
                <li key={e.id || e.word}>
                  <span className="note-ts">{e.timestamp}</span>
                  {e.word ? <><strong>"{e.word}":</strong> {e.note}</> : e.text}
                </li>))}</ul>}
        </section>
      ))}
    </div>
  );
}

// ── Main StudyMode component ───────────────────────────────────
export default function StudyMode({ transcript }) {
  const [fontSize, setFontSize] = useState(16);
  const [readingLevel, setReadingLevel] = useState("standard");
  const [noteFormat, setNoteFormat] = useState("structured");
  const [exported, setExported] = useState(false);

  const data = buildOutline(transcript);

  const handleExport = () => {
    const { keyConcepts, definitions, examples, questions, actionItems, summary, allAnnotations } = data;

    const lines = [
      `=== STUDY NOTES — ${noteFormat.toUpperCase()} FORMAT ===\n`,
      `SUMMARY:\n${summary}\n`,
      keyConcepts.length  ? `\nKEY CONCEPTS:\n${keyConcepts.map((e) => `- [${e.timestamp}] ${e.text}`).join("\n")}` : "",
      definitions.length  ? `\nDEFINITIONS:\n${definitions.map((e) => `- [${e.timestamp}] ${e.text}`).join("\n")}` : "",
      examples.length     ? `\nEXAMPLES:\n${examples.map((e) => `- [${e.timestamp}] ${e.text}`).join("\n")}` : "",
      questions.length    ? `\nQUESTIONS:\n${questions.map((e) => `- [${e.timestamp}] ${e.text}`).join("\n")}` : "",
      actionItems.length  ? `\nACTION ITEMS:\n${actionItems.map((e) => `- [${e.timestamp}] ${e.text}`).join("\n")}` : "",
      allAnnotations.length ? `\nANNOTATIONS:\n${allAnnotations.map((n) => `- [${n.timestamp}] "${n.word}": ${n.note}`).join("\n")}` : "",
    ].filter(Boolean).join("\n");

    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `study-notes-${noteFormat}.txt`;
    a.click();
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="study-mode" aria-label="Study Mode">

      {/* Controls */}
      <div className="study-controls" role="group" aria-label="Study mode settings">
        <div className="control-group">
          <label htmlFor="font-size" className="control-label">
            Text Size: <span aria-live="polite">{fontSize}px</span>
          </label>
          <input
            id="font-size"
            type="range" min={12} max={28} value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            aria-valuemin={12} aria-valuemax={28}
            aria-valuenow={fontSize} aria-valuetext={`${fontSize} pixels`}
          />
        </div>
        <div className="control-group">
          <label htmlFor="reading-level" className="control-label">Reading Level</label>
          <select id="reading-level" value={readingLevel} onChange={(e) => setReadingLevel(e.target.value)}>
            <option value="simplified">Simplified</option>
            <option value="standard">Standard</option>
            <option value="detailed">Detailed</option>
          </select>
        </div>
        <button className="btn btn-export" onClick={handleExport} aria-label="Export study notes as text file">
          {exported ? "✓ Exported!" : "Export Notes ↓"}
        </button>
      </div>

      {/* Note format selector */}
      <div className="note-format-bar" role="group" aria-label="Choose note format">
        <span className="note-format-label" aria-hidden="true">Note format:</span>
        {NOTE_FORMATS.map((f) => (
          <button
            key={f.id}
            className={`format-btn ${noteFormat === f.id ? "format-btn-active" : ""}`}
            onClick={() => setNoteFormat(f.id)}
            aria-pressed={noteFormat === f.id}
            aria-label={`Use ${f.label} format`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Hint if nothing tagged */}
      {data.allTagged.length === 0 && (
        <div className="tag-hint" role="note" aria-label="Tagging tip">
          <span aria-hidden="true">💡</span> Go to <strong>Review & Repair</strong> and tag entries as Key Concept, Definition, Example, Question, or Action Item — they'll automatically appear in your notes here.
        </div>
      )}

      {/* Render selected template */}
      <div className="study-content" style={{ fontSize: `${fontSize}px` }}>
        {noteFormat === "structured" && <StructuredOutline data={data} fontSize={`${fontSize}px`} />}
        {noteFormat === "cornell"    && <CornellNotes      data={data} fontSize={`${fontSize}px`} />}
        {noteFormat === "mednotes"   && <MedNotes          data={data} fontSize={`${fontSize}px`} />}
        {noteFormat === "todos"      && <TodoNotes         data={data} fontSize={`${fontSize}px`} />}
        {noteFormat === "custom"     && <CustomNotes       data={data} fontSize={`${fontSize}px`} />}
      </div>
    </div>
  );
}
