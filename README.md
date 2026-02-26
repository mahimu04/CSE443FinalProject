# CSE443FinalProject
Sahana and Mahima's final project for CSE443

# Tasks and Timeline
**1. List of Tasks We Plan to Support**

Task 1: Record and Transcribe Lecture
* User opens the application
* Selects “Start Recording”
* Speech is transcribed live with timestamps and speaker labels
* User stops recording and saves the session

Task 2: Review and Correct Notes
* User opens a saved session
* Navigates transcript by timestamps
* Edits incorrect text
* Highlights key information
* Saves updated transcript
* User selects “Generate Summary”
* System produces structured notes including:
    * Key Points
    * Action Items
    * Definitions
* User exports notes for later use
These tasks are informed by our research on speech recognition ambiguity, bias in ASR systems, and interactive error recovery. Instead of just showing AI output, our system allows users to actively review, correct, and structure their notes, which helps reduce ambiguity and improve accessibility.

**2. Validation Plan**

We will validate the project through system-based evaluation rather than user studies.

Correctness Analysis
* Use prerecorded audio samples
* Compare transcript output to ground truth text
* Measure:
    * Word Error Rate (WER)
    * Timestamp alignment accuracy
    * Summary accuracy relative to lecture content

Task Completion Validation
* Confirm users can complete the full workflow:
    * Record
    * Save
    * Edit
    * Export
* Ensure all tasks can be completed using keyboard-only navigation

Accessibility Audit
* Evaluate the interface using the WCAG 2.1 checklist
* Conduct screen reader testing (VoiceOver / NVDA)
* Verify color contrast compliance
* Validate heading structure and semantic labeling

**3. Storyboard Link**
Our storyboard images (with ALT text included in the README) are available here:

For Task 1:
![FullSizeRender]((https://github.com/mahimu04/CSE443FinalProject/blob/main/IMG_7738.jpeg))
ALT: A hand-drawn four-panel storyboard 
Panel 1 shows a a student walking into lecture and opening the speech to text app. 
Panel 2 shows the app live transcribing the lecture as the professor lectures.
Panel 3 shows the app automatically assigning the transcribed notes into groups, specifically a "History of tech", "formulas" and "papers: group. There is also a save notes button. 
Panel 4: shows the notes being saved, and the student with a happy face. It also states that the student can reference and edit the notes later. 

![FullSizeRender](https://github.com/user-attachments/assets/22b65164-ae0e-4074-a201-0c6228bd1425)
ALT: A hand-drawn three-panel storyboard titled “Task 2 – Review & Correct Notes.” 
Panel 1 shows a saved lecture transcript labeled “Saved lecture – CSE 443” with timestamped entries such as “00:01 Professor: Today we discussed accessibility models.” 
Panel 2 shows the user navigating by timestamps and editing an incorrect word in the transcript, with an “edited” label at the top. 
Panel 3 shows the user highlighting important text and pressing a “Generate” button to create a structured summary. Each panel includes simple navigation buttons at the bottom, and handwritten captions explain the steps of opening a saved session, editing transcript errors, and generating a summary.


Each storyboard includes at least three panels (entry, interaction, and exit) showing the complete user experience for each task.

**4. Timeline**
Week 9 – Functional Prototype
Goal: Working system with core functionality
Sahana:
* Design transcript display UI
* Implement timestamp navigation
* Add editing functionality
* Add accessibility features (keyboard navigation, contrast, text resizing)
Mahima:
* Implement real-time transcription
* Integrate speech-to-text API
* Ensure live captioning works
Deliverable: End-to-end record, save, edit workflow

Week 10 – Validation Phase
Sahana:
* Conduct WCAG accessibility audit
* Test keyboard-only navigation
* Perform screen reader testing
* Refine UI based on accessibility findings
Mahima:
* Conduct WER analysis
* Test summary generation accuracy
* Validate timestamp alignment
Deliverable: Documented validation results and refined system

Final Presentation Week
* Live demo ready
* Poster prepared
* README complete
* Storyboards uploaded with ALT text

**5. Feasibility Analysis**
Technical Feasibility
We believe this project is technically feasible within the three-week timeline. We are using existing technologies rather than building new speech recognition systems from scratch.
Technologies:
* Speech-to-text API
* Web-based frontend interface
* Accessibility testing tools (VoiceOver, WCAG checklist)
Both team members have experience with frontend development and accessibility evaluation from previous coursework, so we feel confident implementing the interface and testing accessibility features.
We are focusing more on interface design, correction tools, and structured summaries rather than complex AI model training, which keeps the scope manageable.

**Fallback Plan:**
* Use prerecorded audio if real-time processing fails
* Start with rule-based summary generation before integrating advanced AI models

**Timeline Feasibility**
Each team member will commit 6–8 hours per week. We will implement core functionality first, then move to validation and refinement. Weekly check-ins will help us keep the scope realistic and avoid last-minute issues.

**Risks & Mitigation**
* Summary quality may depend on transcription accuracy. We mitigate this by allowing users to edit before generating summaries.
* Accessibility compliance may require iteration. We will test early in Week 10.
* Scope creep in AI features. We will prioritize essential functionality first.

# Disability Analysis

**Principle 1: Leadership of Those Most Impacted**

Definition: 
The principle of Leadership of Those Most Impacted states that accessibility solutions should be guided by people who directly experience disability-related barriers, rather than designed solely by non disabled people. Disabled individuals possess lived experience that is extremely valuable. They know about systemic accessibility failures, communication barriers, and accessible strategies that cannot be replicated.

Our project does not fully meet this principle, because our team members do not personally identify as disabled users of speech-to-text assistive technologies. As a result, there is risk that design decisions may unintentionally reflect assumptions about user needs rather than lived realities.

However, we attempt to mitigate this limitation through practices learned in class:
- incorporating first-person accounts from Deaf, hard-of-hearing, and neurodivergent users discussing note-taking barriers
- analyzing accessibility critiques of existing captioning and transcription systems,
- grounding feature decisions (editable transcripts, customizable summaries, multilingual support) in documented accessibility needs rather than convenience-driven design.

While these steps are some improvement, they of course do not replace direct leadership by disabled users. 

**Principle 2: Intersectionality**

Intersectionality recognizes that disability is not the sole idenity of an individual, and they do not tell the whole story of a persons experience. Experiences of accessibility are shaped by overlapping identities such as language background, race, socioeconomic status, education, and additional disabilities. Technologies that assume a single “average” disabled user often exclude those with compounded barriers.

We want our technology to reflect intersectionality and prioritize it. The design intentionally accommodates diverse user contexts by:
- supporting multiple spoken languages,
- enabling interaction without reliance on fine motor control, providing visual, textual, and editable outputs,
- allowing customization of summaries to reduce cognitive load.

These choices acknowledge that users may simultaneously experience hearing loss, motor impairments, language barriers, or neurodivergence. Rather than targeting one disability category, we want to provide access for people from many different identities and environments. So, we hope that our technology does meet this principle.

**Is the Technology Ableist?**

We hope that our technology, as it is designed with accessibility as a priority, will not be ableist. However, while the app attempts to reduce ableism, it may still reproduce ableist assumptions common in speech technologies. This will be dependent on if our system is trained on good data, and can have a high success rate. Speech-to-text systems often perform worse for non-standard accents, speech impairments, or atypical communication styles, implicitly privileging normative speech patterns, and we need to make sure we do our best to mitigate this if it is technically feasible to do so.  

A good thing is by designing the features of transcript correction, personalization, and post-editing control, our system challenges the assumption that AI output is authoritative. Thus, allowing users to have more control over their tool. But, reliance on speech input means barriers may remain for users with limited or non-verbal speech, indicating partial, but not complete, avoidance of ableism.

**Is It Informed by Disabled Perspectives?**

The project is not led or designed by people with disabilities. However, it is informed by disabled perspectives through accessibility research, first-person narratives, and critiques of existing assistive technologies. Our design decisions prioritize documented frustrations from users with disabilities using these kinds of technologies in the past. These frustrations include caption inaccuracies, cognitive overload, and lack of editing agency.

However, without participatory design or co-creation with disabled stakeholders, one could argue it is not informed enough. 

**Does It Oversimplify Disability or Identity?**

We want to avoid oversimplification by recognizing the true range accessibility needs and offering customizable interaction modes. It does not assume a single disability type or uniform solution.

That said, any technology like this risks oversimplification risks oversimplification, just due to different existing models inadequacies. Improvements would require engagement with diverse disability communities to ensure accurate representations of real-world experiences.
