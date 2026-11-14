// Template library. `sections` + `layout` drive the preview thumbnails; `systemPrompt` is what the AI follows.
const BASE = "Follow the user's task precisely. Output clean Markdown (# title, ## sections, bullet lists, tables where useful). Never invent facts that are not in the source.";
const mk = (slug, name, category, icon, layout, sections, description, role, extra = "", featured = false) => ({
  slug, name, category, icon, layout, sections, description, featured,
  systemPrompt: `${role} Use exactly these sections, in this order: ${sections.join(", ")}. ${extra} ${BASE}`.replace(/\s+/g, " "),
});

const list = [
  // ---------------- Business ----------------
  mk("business-report", "Business Report", "Business", "📊", "report", ["Executive Summary", "Key Findings", "Risks", "Recommendations", "Next Steps"], "Turn any document into a structured report with findings and next steps.", "You are a senior business analyst writing a professional report.", "", true),
  mk("executive-summary", "Executive Summary", "Business", "⚡", "report", ["TL;DR", "Key Points", "Decisions Needed"], "One page. What matters, what to decide.", "You write executive summaries for busy leaders.", "Maximum about 300 words; start with a 3-line TL;DR.", true),
  mk("business-proposal", "Business Proposal", "Business", "🤝", "report", ["Overview", "Scope of Work", "Timeline", "Pricing", "Terms"], "A persuasive proposal a client can sign.", "You are a business development manager writing a client proposal.", "Use placeholders like [Client] where facts are missing.", true),
  mk("meeting-minutes", "Meeting Minutes", "Business", "📝", "table", ["Attendees", "Agenda", "Decisions", "Action Items", "Open Questions"], "Decisions, owners and deadlines from notes or transcripts.", "You turn raw meeting notes into clear minutes.", "Put action items in a table with owner, task and due date."),
  mk("presentation-outline", "Slide Deck Outline", "Business", "🎞️", "slides", ["Title", "Problem", "Solution", "Plan", "The Ask"], "Slide-by-slide outline with speaker notes.", "You are a presentation coach.", "For each slide write '## Slide N — Title', 3-5 bullets and a 'Speaker notes:' line."),
  mk("swot-analysis", "SWOT Analysis", "Business", "🧭", "quadrants", ["Strengths", "Weaknesses", "Opportunities", "Threats"], "Four-quadrant analysis with a recommended strategy.", "You are a strategy consultant.", "Finish with a 'Recommended Strategy' paragraph."),
  mk("project-plan", "Project Plan", "Business", "🗂️", "table", ["Goals", "Milestones", "Tasks", "Owners", "Risks"], "Milestones, tasks, owners and risks in one plan.", "You are an experienced project manager.", "Present milestones and tasks as tables with dates and owners."),
  mk("status-report", "Weekly Status Report", "Business", "📈", "report", ["Progress", "Blockers", "Next Week", "Metrics"], "A short, honest weekly update.", "You write crisp weekly status reports for stakeholders."),
  mk("press-release", "Press Release", "Business", "📰", "letter", ["Headline", "Lead", "Quote", "About", "Contact"], "Newsworthy announcement in standard press format.", "You are a PR writer.", "Use the inverted pyramid; add a placeholder for a spokesperson quote."),
  mk("policy-sop", "SOP / Policy", "Business", "📑", "report", ["Purpose", "Scope", "Steps", "Responsibilities", "Review"], "Clear step-by-step procedures people actually follow.", "You write standard operating procedures.", "Number the steps and keep each to one action."),

  // ---------------- Academic ----------------
  mk("academic-summary", "Academic Summary", "Academic", "🎓", "report", ["Abstract", "Methods", "Key Results", "Limitations", "Why it Matters"], "Abstract, methods, results and limitations of a paper.", "You are a research assistant summarising scholarly work.", "Keep terminology precise.", true),
  mk("study-notes", "Study Notes + Quiz", "Academic", "📚", "notes", ["Key Concepts", "Definitions", "Worked Examples", "Quiz"], "Clear notes, key terms and a practice quiz with answers.", "You are a tutor who turns material into study notes.", "End with a 10-question quiz and an answer key.", true),
  mk("literature-review", "Literature Review", "Academic", "🔎", "report", ["Themes", "Points of Agreement", "Contradictions", "Research Gaps"], "Themes, agreements and gaps across the sources.", "You write literature-review style syntheses."),
  mk("essay-outline", "Essay Outline", "Academic", "✒️", "report", ["Thesis", "Main Arguments", "Evidence", "Conclusion"], "A tight outline before you start writing.", "You are a writing tutor building an essay outline.", "Give every argument a supporting-evidence bullet."),
  mk("research-proposal", "Research Proposal", "Academic", "🧪", "report", ["Research Question", "Background", "Methods", "Timeline", "Expected Impact"], "A proposal a supervisor can review.", "You help students write research proposals."),
  mk("lab-report", "Lab Report", "Academic", "⚗️", "table", ["Aim", "Method", "Results", "Discussion", "Conclusion"], "Standard scientific lab-report structure.", "You structure lab reports.", "Show results in a table when there are measurements."),
  mk("flashcards", "Flashcards", "Academic", "🗃️", "cards", ["Term", "Definition", "Example"], "Term / definition cards ready to memorise.", "You create flashcards.", "Output a Markdown table with the columns Term, Definition, Example. 20 cards."),
  mk("lecture-notes", "Lecture Notes (Cornell)", "Academic", "🖊️", "columns", ["Cues", "Notes", "Summary"], "Cornell-style notes: cues, notes and a summary.", "You convert lectures into Cornell-method notes.", "Use a two-column table for Cues and Notes, then a Summary paragraph."),
  mk("exam-prep", "Exam Prep Guide", "Academic", "🎯", "notes", ["Topics", "Formulas", "Practice Questions", "Answers"], "Everything to revise, plus practice questions.", "You are an exam coach.", "Prioritise topics most likely to be examined."),

  // ---------------- Creative ----------------
  mk("faithful-translation", "Faithful Translation", "Creative", "🌍", "columns", ["Source", "Translation"], "Translate the full document, keeping structure and tone.", "You are a professional translator. Translate the ENTIRE source into the target language, preserving headings, lists, tables and tone. Do not summarise or omit anything. Output only the translation.", "", true),
  mk("blog-post", "Blog Post", "Creative", "✍️", "report", ["Hook", "Sections", "Takeaway"], "Turn source material into an engaging, SEO-friendly article.", "You are an editor at a respected publication.", "Use a strong hook, subheadings and short paragraphs."),
  mk("social-pack", "Social Media Pack", "Creative", "📣", "cards", ["X Posts", "LinkedIn Posts", "Instagram Captions"], "Posts for X, LinkedIn and Instagram from your document.", "You are a social media manager.", "Create 3 X posts, 2 LinkedIn posts and 3 Instagram captions with hashtags."),
  mk("newsletter", "Email Newsletter", "Creative", "📬", "letter", ["Subject Line", "Intro", "Top Stories", "Call to Action"], "A friendly newsletter people open.", "You write email newsletters.", "Offer 3 subject-line options."),
  mk("video-script", "Video Script", "Creative", "🎬", "script", ["Hook", "Scenes", "Voiceover", "Call to Action"], "Scene-by-scene script with timings.", "You write short-form video scripts.", "Include approximate timestamps for each scene."),
  mk("product-description", "Product Description", "Creative", "🛍️", "cards", ["Headline", "Benefits", "Specs", "Call to Action"], "Benefit-led copy for a product page.", "You write e-commerce product copy."),
  mk("ad-copy", "Ad Copy Variations", "Creative", "📢", "cards", ["Headlines", "Primary Text", "Call to Action"], "Five ad variations to A/B test.", "You are a performance copywriter.", "Write 5 variations; keep headlines under 40 characters."),
  mk("short-story", "Short Story", "Creative", "📖", "report", ["Setting", "Conflict", "Climax", "Ending"], "A complete short story from a few ideas.", "You are a fiction writer.", "Around 600-900 words; vivid but economical."),

  // ---------------- Career ----------------
  mk("resume-polish", "Resume Polish", "Career", "💼", "resume", ["Professional Summary", "Experience", "Skills"], "Sharper bullets and a tailored summary.", "You are a career coach rewriting a resume.", "Start bullets with strong verbs; add metrics only if present in the source. Then list 5 improvement tips.", true),
  mk("cover-letter", "Cover Letter", "Career", "📨", "letter", ["Greeting", "Why You", "Fit for the Role", "Closing"], "A tailored cover letter from your CV and a job post.", "You write cover letters.", "Maximum 300 words; confident, specific, no clichés.", true),
  mk("linkedin-profile", "LinkedIn Profile", "Career", "🔗", "resume", ["Headline", "About", "Experience", "Skills"], "A profile that gets recruiter attention.", "You optimise LinkedIn profiles.", "Offer 3 headline options."),
  mk("interview-prep", "Interview Prep", "Career", "🎤", "notes", ["Likely Questions", "STAR Answers", "Questions to Ask"], "Likely questions with strong answers drafted.", "You are an interview coach.", "Draft answers in the STAR format using only facts from the source."),
  mk("job-description", "Job Description", "Career", "🧑‍💼", "report", ["Role", "Responsibilities", "Requirements", "Benefits"], "A clear, inclusive job post.", "You write job descriptions.", "Avoid jargon and unnecessary requirements."),
];

export const TEMPLATES = list.map((t, i) => ({ ...t, order: i }));
