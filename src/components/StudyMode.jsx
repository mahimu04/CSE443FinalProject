import { useState, useEffect } from "react";

function generateStudyContent(transcript) {
  const keyConceptEntries = transcript.filter((e) => e.tags?.includes("Key Concept"));
  const definitionEntries = transcript.filter((e) => e.tags?.includes("Definition"));
  const exampleEntries = transcript.filter((e) => e.tags?.includes("Example"));

  const summary = transcript
    .filter((e) => e.confidence !== "low" && e.speaker === "Professor")
    .map((e) => e.text)
    .join(" ")
    .substring(0, 400) + "...";

  return { keyConceptEntries, definitionEntries, exampleEntries, summary };
}

export default function StudyMode({ transcript }) {
  const [fontSize, setFontSize] = useState(16);
  const [readingLevel, setReadingLevel] = useState("standard");
  const [exported, setExported] = useState(false);
  const { keyConceptEntries, definitionEntries, exampleEntries, summary } =
    generateStudyContent(transcript);

  const handleExport = () => {
    const content = [
      "=== STUDY NOTES EXPORT ===\n",
      "SUMMARY:\n" + summary + "\n",
      "\nKEY CONCEPTS:\n" + keyConceptEntries.map((e) => `- ${e.text}`).join("\n"),
      "\nDEFINITIONS:\n" + definitionEntries.map((e) => `- ${e.text}`).join("\n"),
      "\nEXAMPLES:\n" + exampleEntries.map((e) => `- ${e.text}`).join("\n"),
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "study-notes.txt";
    a.click();
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="study-mode" role="main" aria-label="Study Mode">
      {/* Controls */}
      <div className="study-controls" role="toolbar" aria-label="Study mode settings">
        <div className="control-group">
          <label htmlFor="font-size" className="control-label">Text Size: {fontSize}px</label>
          <input
            id="font-size"
            type="range"
            min={12}
            max={28}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            aria-label={`Text size, currently ${fontSize} pixels`}
          />
        </div>
        <div className="control-group">
          <label htmlFor="reading-level" className="control-label">Reading Level</label>
          <select
            id="reading-level"
            value={readingLevel}
            onChange={(e) => setReadingLevel(e.target.value)}
            aria-label="Reading level">
            <option value="simplified">Simplified</option>
            <option value="standard">Standard</option>
            <option value="detailed">Detailed</option>
          </select>
        </div>
        <button
          className="btn btn-export"
          onClick={handleExport}
          aria-label="Export study notes as text file">
          {exported ? "✓ Exported!" : "Export Notes"}
        </button>
      </div>

      {/* Study Content */}
      <div className="study-content" style={{ fontSize: `${fontSize}px` }}>

        {/* Summary */}
        <section className="study-section" aria-labelledby="summary-heading">
          <h2 id="summary-heading">📋 Plain-Language Summary</h2>
          <p className="summary-text">
            {readingLevel === "simplified"
              ? "This lecture covered how AI systems learn from data. The main ideas were: how to train models, what goes wrong when models memorize instead of learn, and how to adjust a model step by step."
              : summary}
          </p>
        </section>

        {/* Key Concepts */}
        <section className="study-section" aria-labelledby="concepts-heading">
          <h2 id="concepts-heading">💡 Key Concepts</h2>
          {keyConceptEntries.length === 0 ? (
            <p className="empty-state">
              No key concepts tagged yet. Go to Review Mode and tag entries as "Key Concept".
            </p>
          ) : (
            <ul className="study-list" role="list">
              {keyConceptEntries.map((e) => (
                <li key={e.id} className="study-list-item">
                  <span className="item-timestamp">{e.timestamp}</span>
                  <span>{e.text}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Definitions */}
        <section className="study-section" aria-labelledby="defs-heading">
          <h2 id="defs-heading">📖 Definitions</h2>
          {definitionEntries.length === 0 ? (
            <p className="empty-state">No definitions tagged yet.</p>
          ) : (
            <dl className="definitions-list">
              {definitionEntries.map((e) => (
                <div key={e.id} className="definition-item">
                  <dt className="item-timestamp">{e.timestamp}</dt>
                  <dd>{e.text}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>

        {/* Examples */}
        <section className="study-section" aria-labelledby="examples-heading">
          <h2 id="examples-heading">🔍 Examples</h2>
          {exampleEntries.length === 0 ? (
            <p className="empty-state">No examples tagged yet.</p>
          ) : (
            <ul className="study-list" role="list">
              {exampleEntries.map((e) => (
                <li key={e.id} className="study-list-item">
                  <span className="item-timestamp">{e.timestamp}</span>
                  <span>{e.text}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Full Structured Outline */}
        <section className="study-section" aria-labelledby="outline-heading">
          <h2 id="outline-heading">🗂 Structured Outline</h2>
          <ol className="outline-list" role="list">
            {transcript
              .filter((e) => e.speaker === "Professor" && e.confidence !== "low")
              .map((e) => (
                <li key={e.id} className="outline-item">
                  <span className="item-timestamp">{e.timestamp}</span>
                  <span>{e.text}</span>
                  {e.tags?.length > 0 && (
                    <span className="outline-tags">
                      {e.tags.map((t) => <span key={t} className="tag-chip">{t}</span>)}
                    </span>
                  )}
                </li>
              ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
