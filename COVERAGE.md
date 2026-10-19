# Deck coverage

This file maps every slide in the program deck (*Agentic AI Security & Governance*, Modules 07–16) to where the app covers it.

**Tabs:**
- **Lab** is the main exercise.
- **Drill** is a Concept drills item.
- **Scen.** is a scenario card in the Scenarios tab.
- **Disc.** is the leadership discussion at the end of the Scenarios tab.
- **Home** is the home screen.

The scenario and discussion text, including the facilitators' model answers, is generated from the deck's own slides and speaker notes (`app/js/scenario-data.js`).

| Deck slide | Covered in |
|---|---|
| Journey: ten leadership questions | Home cards and each lab header; Home wrap-up ("which can you now answer?") |
| Why this matters | Home hero; takeaway 1 |
| Outcomes: Govern, Challenge, Defend, Prove | Home outcomes row |
| 34 live scenarios, one rhythm | Scenarios tab in every lab (31 scenarios + 3 capstone cases) |
| **Module 07 · Trust architecture** | |
| Zero Trust applied to agents | Drill "Zero Trust, applied to agents" |
| Six things an AI system must decide to trust | Drill "Six things an AI system must decide to trust" |
| Trust boundaries & runtime trust validation | Drill "Trust is checked at every boundary" |
| Identity propagation | Lab: identity switch (shared account vs on-behalf-of), which changes the blast radius |
| Trust scoring | Drill "Trust is scored on every action" |
| Supply chain trust, AI-BOM | Drills "Evidence that beats the vendor's word" and "Integration tokens" |
| Scenarios: Drift tokens, McHire, Vertex AI | Scen. ×3 |
| Leadership discussion | Disc.; Lab: blast-radius map |
| **Module 08 · Responsible AI** | |
| Six principles with tests | Lab: scorecard with radar and regulator challenges |
| Bias enters at four points | Drills "Bias enters at four points" and "The PIN-code problem" |
| Human oversight: match autonomy to impact | Drill "Match autonomy to impact" |
| Four frameworks | Drill "Four frameworks, four different jobs" |
| NIST AI RMF & OECD | Drill "Inside NIST AI RMF" |
| Model governance lifecycle | Drill "Every model has a life" |
| Implementation in four moves | Drill "From principles to practice" |
| Scenarios: Workday, Deloitte, PIN-code bank | Scen. ×3 |
| Leadership discussion | Disc.; Lab: 30-day gap |
| **Module 09 · Responsive AI** | |
| Responsive AI concepts | Drill "Responsive AI adapts to context" |
| Real-time feedback loops | Lab: agent-loop diagram |
| Runtime policy enforcement | Lab: policy generator; Drills "Rules the agent cannot talk its way past" and "Enforce in code at the gateway" |
| Adaptive risk controls | Drill "Controls tighten as risk signals rise" |
| Intervention & escalation ladder | Drill "A ladder of intervention" |
| AI observability: five signals | Drill "Five signals" |
| Six-layer responsive architecture | Drill "Six layers" |
| Scenarios: Taco Bell, OpenClaw, airline vouchers, silent upgrade | Scen. ×4 |
| Leadership discussion | Disc. |
| **Module 10 · Architecture review workshop** | |
| Workshop brief and verdict criteria | Lab: workbench verdict (secure, scalable, trustworthy, governable, ready) |
| Reference architecture, trust boundaries | Lab: warm-up trust-zone diagram; Drill "Every crossing needs three things" |
| Five-step review method | Drill "Five steps to review any AI architecture" |
| The leader's eight questions | Lab: eight questions for each exercise |
| Exercise 1: Security Copilot | Lab: workbench, exercise 1 |
| Sample answer (threat, boundary, control, owner, residual) | Lab: risk register; Answers: suggested registers |
| Exercise 2: Knowledge Assistant (RAG) | Lab: workbench, exercise 2 |
| Exercise 3: MCP Risk Advisory Platform | Lab: workbench, exercise 3 |
| Three deliverables | Lab: deliverables generator; Drill "Three deliverables" |
| Scenarios: ForcedLeak, calendar invite, five-flaw claims agent | Scen. ×3 |
| Leadership discussion | Disc. |
| **Module 11 · Attack surface** | |
| Attack surface expansion | Drill "An agent takes instructions from everything it reads" |
| Prompt injection & jailbreaks | Lab: memo demo, context window, defence simulator, Gandalf; Drill "Direct or indirect" |
| Tool abuse, escalation, runaway | Drill "When agents act" |
| Memory & identity attacks | Drill "When agents act" |
| OWASP Agentic Top 10 (ASI01–ASI10) | Drill "OWASP Top 10 for Agentic Applications" |
| Four real incidents | Drill "Four incidents, four lessons" |
| Scenarios: Amazon Q, web traps, attacker agents, deepfake CFO | Scen. ×4 |
| Leadership discussion | Disc. |
| **Module 12 · RAG & MCP** | |
| RAG pipeline attacks | Lab: pipeline coverage diagram; Drill "Which RAG stage is attacked?" |
| Data leakage | Lab: permission-aware retrieval demo |
| Six RAG controls | Lab: pipeline control picker |
| MCP attack vectors | Lab: approval board and rug-pull round; Drill "Every MCP connection is a door" |
| Secure MCP deployment & governance | Lab: approval conditions; Drill "A governed catalogue" |
| Toxic trio | Drill "The toxic trio" |
| Scenarios: postmark-mcp, GitHub MCP, Supabase MCP, "Ask HR" | Scen. ×4 |
| Leadership discussion | Disc. |
| **Module 13 · Productization** | |
| Secure AI SDLC | Drill "Security built into every stage" |
| Deployment architecture | Drill "Cloud, hybrid or private" |
| Security testing & model validation | Drill "Test AI the way attackers will use it" |
| Release & change management | Drill "A prompt edit is a production change" |
| Runtime controls & human approval gates | Drills "Controls that work while the agent works" and "Human approval gates by action" |
| Monitoring, audit trails & logging | Drill "Being able to explain any decision" |
| Governance checkpoints (gates 0–3) | Drill "Five gates" |
| Production readiness assessment | Lab: go/no-go meeting, readiness pack, conditions, risk grid, memo |
| Scenarios: CBA voice bot, s1ngularity, Friday prompt edit | Scen. ×3 |
| Leadership discussion | Disc. |
| **Module 14 · SOC** | |
| AI in SOC environments | Drill "The SOC now uses AI, and must also defend it" |
| AI telemetry | Drill "What the SOC must see" |
| Monitoring pipeline (gateway, SIEM, SOAR) | Drill "From agent activity to SOC action" |
| Detection engineering, behaviour monitoring, threat hunting | Lab: detection workbench; Drills "Five detections" and "Beyond fixed detections" |
| Incident response workflow | Drill "The familiar playbook, with AI-specific steps" |
| Kill switches & containment | Lab: kill-switch trade-off; Drill "Who may pull each lever?" |
| Scenarios: HR copilot 02:14, LLMjacking, runaway POs, unreported actions | Scen. ×4 |
| Leadership discussion | Disc.; Lab: incident ticket |
| **Module 15 · Governance** | |
| Governance operating model | Drill "Who decides what, at three levels" |
| EU AI Act tiers, dates, fines | Lab: classification; Drills "EU AI Act: obligations phased to 2028" and "true or false" |
| Control frameworks (EU AI Act, ISO, NIST, DPDP) | Drill "How law, standards and frameworks fit together" |
| Internal tiering model | Lab: four-factor scoring and heat map |
| Assurance & auditability | Drill "From controls on paper to evidence on demand" |
| Six board numbers | Lab: board dashboard with thresholds and decisions |
| Leadership decision framework | Lab: decision rights per use case |
| Control maturity | Drill: maturity self-assessment with radar |
| Scenarios: Digital Omnibus, CEO avatar, OpenClaw | Scen. ×3 |
| Leadership discussion | Disc.; Lab: board report |
| **Module 16 · Capstone** | |
| Three exercises | Lab: capstone overview, linking to the Module 10 and 12 workbenches |
| Capstone deliverables | Lab: deliverables checklist |
| Incident simulation | Lab: branching Aria tabletop |
| Cases A–C | Scen. ×3 |
| Assessment rubric | Lab: weighted rubric self-score |
| **Close** | |
| Key takeaways | Home wrap-up: weakest takeaway |
| 90-day plan | Home wrap-up: Know, Control, Prove builder |
