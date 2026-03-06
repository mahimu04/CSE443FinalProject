# Accessible AI Transcript Review Tool
**CSE 443 Final Project — Sahana & Mahima**

## Setup

Make sure you have [Node.js](https://nodejs.org/) installed (v16+).

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev
```

Then open http://localhost:5173 in your browser.

---

## Project Structure

```
src/
├── App.jsx                   # Main app, tab navigation, filter bar
├── main.jsx                  # React entry point
├── components/
│   ├── TranscriptRow.jsx     # Single transcript entry (edit, tag, speaker)
│   └── StudyMode.jsx         # Study mode (outline, summary, export)
├── data/
│   └── sampleTranscript.js   # Sample lecture transcript data
└── styles/
    └── App.css               # All styles (accessible, WCAG-aware)
```

---

## Features Implemented

### Task 1: Review & Repair
- [x] Pre-loaded lecture transcript with timestamps and speaker labels
- [x] Low-confidence entries highlighted with ⚠ badge (yellow/orange border)
- [x] Click-to-edit any transcript entry inline
- [x] Speaker relabeling via dropdown
- [x] Tag entries as: Key Concept, Definition, Example, Question, Action Item
- [x] Collapse/expand individual entries (or all at once) to reduce visual overload
- [x] Filter by confidence level or tag
- [x] Edited entries visually distinct from original AI text
- [x] Live stats bar showing totals, low-confidence count, edit count

### Task 2: Study Mode
- [x] Auto-generated plain-language summary
- [x] Key Concepts section (pulled from tags)
- [x] Definitions section (pulled from tags)
- [x] Examples section (pulled from tags)
- [x] Structured outline of professor's high-confidence entries
- [x] Adjustable text size (12px–28px slider)
- [x] Reading level toggle (Simplified / Standard / Detailed)
- [x] Export notes as .txt file

### Accessibility
- [x] Skip navigation link
- [x] Semantic HTML (nav, main, article, section, role attributes)
- [x] ARIA labels on all interactive elements
- [x] aria-live regions for dynamic updates
- [x] Keyboard navigable (Tab, Enter on all controls)
- [x] :focus-visible outlines on all interactive elements
- [x] High contrast color scheme
- [x] Screen reader-friendly (VoiceOver tested)
- [x] Role="tab" / "tabpanel" for tab navigation

---

## Next Steps (Week 10)
- [ ] WCAG 2.1 full audit
- [ ] Word Error Rate (WER) analysis on transcript
- [ ] Real speech-to-text API integration
- [ ] User testing sessions
- [ ] Summary generation with AI API
