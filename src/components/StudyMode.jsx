import { useState, useRef, useEffect } from "react";

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
  const [studyRequest, setStudyRequest] = useState("");
  const [appliedRequest, setAppliedRequest] = useState("");
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const aiResultRef = useRef(null);

  const { keyConceptEntries, definitionEntries, exampleEntries, summary } =
    generateStudyContent(transcript);

  const allAnnotations = transcript.flatMap((e) =>
    (e.wordNotes || []).map((n) => ({ ...n, timestamp: e.timestamp, speaker: e.speaker }))
  );

  // Move focus to AI result when it arrives
  useEffect(() => {
    if (aiSummary && aiResultRef.current) {
      aiResultRef.current.focus();
    }
  }, [aiSummary]);

  const announce = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 3000);
  };

  const handleApplyRequest = async () => {
    if (!studyRequest.trim()) return;
    setLoadingAI(true);
    setAiError(null);
    setAiSummary(null);
    announce("Generating custom study notes, please wait.");

    const transcriptText = transcript
      .map((e) => `[${e.timestamp}] ${e.speaker}: ${e.text}`)
      .join("\n");

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a helpful study assistant. The user will give you a transcript and a specific request for how they want their study notes to look. Respond ONLY with the study content they asked for — no preamble. Use plain, accessible language.`,
          messages: [{ role: "user", content: `Here is the transcript:\n\n${transcriptText}\n\nMy request: ${studyRequest}` }],
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content?.find((b) => b.type === "text")?.text;
      setAiSummary(text);
      setAppliedRequest(studyRequest);
      announce("Custom study notes are ready.");
    } catch (err) {
      setAiError("Something went wrong generating study notes. Please try again.");
      announce("Error generating study notes.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleExport = () => {
    const content = [
      "=== STUDY NOTES EXPORT ===\n",
      appliedRequest ? `REQUEST: ${appliedRequest}\n\nAI RESPONSE:\n${aiSummary}\n` : "",
      "SUMMARY:\n" + summary + "\n",
      keyConceptEntries.length > 0 ? "\nKEY CONCEPTS:\n" + keyConceptEntries.map((e) => `- [${e.timestamp}] ${e.text}`).join("\n") : "",
      definitionEntries.length > 0 ? "\nDEFINITIONS:\n" + definitionEntries.map((e) => `- ${e.text}`).join("\n") : "",
      exampleEntries.length > 0 ? "\nEXAMPLES:\n" + exampleEntries.map((e) => `- ${e.text}`).join("\n") : "",
      allAnnotations.length > 0 ? "\nWORD ANNOTATIONS:\n" + allAnnotations.map((n) => `- "${n.word}" [${n.timestamp}]: ${n.note}`).join("\n") : "",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "study-notes.txt";
    a.click();
    setExported(true);
    announce("Study notes exported successfully.");
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="study-mode" aria-label="Study Mode">

      {/* Global SR status announcer */}
      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {statusMsg}
      </span>

      {/* Controls */}
      <div className="study-controls" role="group" aria-label="Study mode settings">
        <div className="control-group">
          <label htmlFor="font-size" className="control-label">
            Text Size: <span aria-live="polite">{fontSize}px</span>
          </label>
          <input
            id="font-size"
            type="range"
            min={12}
            max={28}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            aria-valuemin={12}
            aria-valuemax={28}
            aria-valuenow={fontSize}
            aria-valuetext={`${fontSize} pixels`}
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
          {exported ? "✓ Exported!" : "Export Notes"}
        </button>
      </div>

      {/* Study Request Box */}
      <div className="study-request-box" role="region" aria-labelledby="study-request-heading">
        <label id="study-request-heading" htmlFor="study-request" className="study-request-label">
          <span aria-hidden="true">✏️</span> Specify what you want your study notes to look like:
        </label>
        <textarea
          id="study-request"
          className="study-request-input"
          value={studyRequest}
          onChange={(e) => setStudyRequest(e.target.value)}
          placeholder="e.g. Give me bullet points of only the key concepts. Focus on definitions. Make it easier to understand. Create flashcard-style Q&A..."
          rows={2}
          aria-describedby="study-request-hint"
        />
        <div className="study-request-actions">
          <span id="study-request-hint" className="study-request-hint">
            The AI will generate custom study notes based on your request.
          </span>
          <button
            className="btn btn-apply-request"
            onClick={handleApplyRequest}
            disabled={loadingAI || !studyRequest.trim()}
            aria-disabled={loadingAI || !studyRequest.trim()}
            aria-label={loadingAI ? "Generating study notes, please wait" : "Generate custom study notes"}>
            {loadingAI ? "Generating…" : "Generate ✨"}
          </button>
        </div>
        {loadingAI && (
          <p role="status" aria-live="polite" className="ai-loading-msg">
            Generating your custom study notes…
          </p>
        )}
        {aiError && <p className="ai-error" role="alert">{aiError}</p>}
      </div>

      {/* AI Generated Content */}
      {aiSummary && (
        <section
          className="study-section study-section-ai"
          aria-labelledby="ai-response-heading"
          tabIndex={-1}
          ref={aiResultRef}>
          <h2 id="ai-response-heading">
            <span aria-hidden="true">✨</span> Custom Study Notes
          </h2>
          <p className="ai-request-label">
            Your request: <em>"{appliedRequest}"</em>
          </p>
          <div className="ai-response-content" aria-label="AI generated study notes">
            {aiSummary.split("\n").filter(Boolean).map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </section>
      )}

      {/* Study Content */}
      <div className="study-content" style={{ fontSize: `${fontSize}px` }}>

        <section className="study-section" aria-labelledby="summary-heading">
          <h2 id="summary-heading">
            <span aria-hidden="true">📋</span> Plain-Language Summary
          </h2>
          <p className="summary-text">
            {readingLevel === "simplified"
              ? "This lecture covered how AI systems learn from data. The main ideas were: how to train models, what goes wrong when models memorize instead of learn, and how to adjust a model step by step."
              : summary}
          </p>
        </section>

        <section className="study-section study-section-keyconcepts" aria-labelledby="keyconcepts-heading">
          <h2 id="keyconcepts-heading">
            <span aria-hidden="true">⭐</span> Key Concepts
          </h2>
          {keyConceptEntries.length === 0 ? (
            <p className="empty-state">
              No key concepts tagged yet. Go to Review &amp; Repair and tag entries as "Key Concept".
            </p>
          ) : (
            <ul className="key-concepts-list">
              {keyConceptEntries.map((e) => (
                <li key={e.id} className="key-concept-item">
                  <span className="key-concept-star" aria-hidden="true">⭐</span>
                  <div className="key-concept-body">
                    <span className="item-timestamp">
                      <span className="sr-only">At </span>{e.timestamp}
                    </span>
                    <span className="key-concept-text">{e.text}</span>
                    {e.wordNotes?.length > 0 && (
                      <ul className="key-concept-notes" aria-label="Annotations for this concept">
                        {e.wordNotes.map((n) => (
                          <li key={n.id} className="key-concept-note">
                            <strong>"{n.word}":</strong> {n.note}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="study-section" aria-labelledby="defs-heading">
          <h2 id="defs-heading">
            <span aria-hidden="true">📖</span> Definitions
          </h2>
          {definitionEntries.length === 0 ? (
            <p className="empty-state">No definitions tagged yet.</p>
          ) : (
            <dl className="definitions-list">
              {definitionEntries.map((e) => (
                <div key={e.id} className="definition-item">
                  <dt className="item-timestamp"><span className="sr-only">At </span>{e.timestamp}</dt>
                  <dd>{e.text}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>

        <section className="study-section" aria-labelledby="examples-heading">
          <h2 id="examples-heading">
            <span aria-hidden="true">🔍</span> Examples
          </h2>
          {exampleEntries.length === 0 ? (
            <p className="empty-state">No examples tagged yet.</p>
          ) : (
            <ul className="study-list">
              {exampleEntries.map((e) => (
                <li key={e.id} className="study-list-item">
                  <span className="item-timestamp"><span className="sr-only">At </span>{e.timestamp}</span>
                  <span>{e.text}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {allAnnotations.length > 0 && (
          <section className="study-section" aria-labelledby="annotations-heading">
            <h2 id="annotations-heading">
              <span aria-hidden="true">📌</span> Your Word Annotations
            </h2>
            <ul className="annotations-list">
              {allAnnotations.map((n) => (
                <li key={n.id} className="annotation-item">
                  <span className="item-timestamp"><span className="sr-only">At </span>{n.timestamp}</span>
                  <span className="annotation-word"><span className="sr-only">Word: </span>"{n.word}"</span>
                  <span className="annotation-note"><span className="sr-only">Note: </span>{n.note}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="study-section" aria-labelledby="outline-heading">
          <h2 id="outline-heading">
            <span aria-hidden="true">🗂</span> Structured Outline
          </h2>
          <ol className="outline-list">
            {transcript
              .filter((e) => e.speaker === "Professor" && e.confidence !== "low")
              .map((e) => (
                <li key={e.id} className="outline-item">
                  <span className="item-timestamp"><span className="sr-only">At </span>{e.timestamp}</span>
                  <span>{e.text}</span>
                  {e.tags?.length > 0 && (
                    <span className="outline-tags" aria-label={`Tagged as: ${e.tags.join(", ")}`}>
                      {e.tags.map((t) => <span key={t} className="tag-chip" aria-hidden="true">{t}</span>)}
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
