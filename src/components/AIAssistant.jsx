import { useState, useRef, useEffect } from "react";

const QUICK_PROMPTS = [
  "Summarize the key concepts from this transcript",
  "What are the main topics covered?",
  "Which parts are unclear or need clarification?",
  "Create study questions from this lecture",
  "Translate the low-confidence segments into plain language",
  "What action items were mentioned?",
];

export default function AIAssistant({ transcript, transcriptContext }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your AI transcript assistant. I can help you understand, summarize, translate, or extract information from your transcript. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const lastMessageRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    // Move focus to latest assistant message for screen readers
    if (messages[messages.length - 1]?.role === "assistant" && lastMessageRef.current) {
      lastMessageRef.current.focus();
    }
  }, [messages]);

  const buildSystemPrompt = () => {
    const transcriptText = transcript
      .map((e) => `[${e.timestamp}] ${e.speaker}: ${e.text} (confidence: ${e.confidence}${e.tags?.length ? ", tags: " + e.tags.join(", ") : ""})`)
      .join("\n");

    return `You are a helpful AI assistant embedded in an accessible transcript review tool for students, including those who are Deaf or Hard of Hearing. Your job is to help users understand, study, and extract meaning from lecture transcripts.

${transcriptContext ? `USER-PROVIDED CONTEXT:\n${transcriptContext}\n` : ""}

TRANSCRIPT:
${transcriptText}

Guidelines:
- Be concise and clear — many users rely on captions due to hearing disabilities
- When referencing transcript content, include timestamps
- For low-confidence segments (marked with confidence: low), acknowledge uncertainty
- Use plain, accessible language
- If asked to translate or simplify, do so clearly`;
  };

  const sendMessage = async (messageText) => {
    const text = messageText || input.trim();
    if (!text || loading) return;

    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const conversationHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: buildSystemPrompt(),
          messages: conversationHistory,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const assistantText = data.content?.find((b) => b.type === "text")?.text || "Sorry, I couldn't generate a response.";
      setMessages((prev) => [...prev, { role: "assistant", content: assistantText }]);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="ai-assistant" aria-label="AI Assistant chat">

      {/* Context indicator */}
      {transcriptContext ? (
        <div className="ai-context-indicator" role="note" aria-label={`Transcript context is active: ${transcriptContext.substring(0, 80)}`}>
          <span aria-hidden="true">🧠</span>
          <span>AI is using your transcript context: <em>"{transcriptContext.substring(0, 80)}{transcriptContext.length > 80 ? "…" : ""}"</em></span>
        </div>
      ) : (
        <div className="ai-context-indicator ai-context-empty" role="note" aria-label="No transcript context set. Tip: add a description above for better answers.">
          <span aria-hidden="true">💡</span>
          <span>Tip: Add a transcript description in the bar above for more relevant AI answers.</span>
        </div>
      )}

      {/* Quick prompts */}
      <div className="quick-prompts" role="group" aria-label="Quick prompt suggestions — activate to send a preset question to the AI">
        <span className="quick-prompts-label" aria-hidden="true">Quick prompts:</span>
        <div className="quick-prompts-list">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              className="quick-prompt-btn"
              onClick={() => sendMessage(prompt)}
              disabled={loading}
              aria-label={`Send question: ${prompt}`}>
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div
        className="ai-messages"
        role="log"
        aria-live="polite"
        aria-label="Conversation history"
        aria-relevant="additions">

        {messages.map((msg, i) => {
          const isLast = i === messages.length - 1;
          const isAssistant = msg.role === "assistant";
          return (
            <div
              key={i}
              className={`ai-message ai-message-${msg.role}`}
              ref={isLast && isAssistant ? lastMessageRef : null}
              tabIndex={isLast && isAssistant ? -1 : undefined}>
              <span className="message-role" aria-hidden="true">
                {isAssistant ? "🤖 AI" : "👤 You"}
              </span>
              {/* Role announced via aria label on wrapper, not duplicated in content */}
              <div
                className="message-content"
                aria-label={`${isAssistant ? "AI response" : "Your message"}: ${msg.content}`}>
                {msg.content.split("\n").filter(Boolean).map((line, j) => (
                  <p key={j}>{line}</p>
                ))}
              </div>
            </div>
          );
        })}

        {loading && (
          <div
            className="ai-message ai-message-assistant ai-loading"
            role="status"
            aria-label="AI is generating a response, please wait">
            <span className="message-role" aria-hidden="true">🤖 AI</span>
            <div className="loading-dots" aria-hidden="true">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}

        {error && (
          <div className="ai-error" role="alert" aria-live="assertive">{error}</div>
        )}

        <div ref={bottomRef} aria-hidden="true" />
      </div>

      {/* Input */}
      <div className="ai-input-area" role="group" aria-label="Send a message to the AI">
        <label htmlFor="ai-message-input" className="sr-only">
          Type your message. Press Enter to send, Shift+Enter for a new line.
        </label>
        <textarea
          id="ai-message-input"
          ref={inputRef}
          className="ai-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about this transcript… (Enter to send, Shift+Enter for new line)"
          rows={2}
          disabled={loading}
          aria-disabled={loading}
        />
        <button
          className="btn btn-send"
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          aria-disabled={loading || !input.trim()}
          aria-label="Send message">
          {loading ? "…" : "Send ↑"}
        </button>
      </div>
    </div>
  );
}
