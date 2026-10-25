# Agentic AI Labs

Hands-on labs for Modules 07–16 of the **Agentic AI Security & Governance** program. Participants open the app on their phones and work in tables of four or five, in role and against the clock. No technical background is needed.

Live app: https://claude.ai/artifact/2SNepAFvq2HNnVBXJ5NLfS

## Story mode (the home screen)

**Agents at Meridian** opens with the deck's challenge, *Approve Project NEXUS*: you vote on a launch, watch it fail hour by hour, then rebuild NEXUS through ten episodes, one per module. Every episode starts with a fail-first trap and its reveal, and a repair board on the home screen turns NEXUS's six failures green as you go. You are Meridian's new Head of AI Risk. Each episode is a sequence of single screens, with no scrolling. In each screen a character speaks, you make one decision, tap items on an animated diagram, sort cards one at a time, flip switches, or talk to a stakeholder live. Every choice shows its consequence and moves three meters: Safety, Trust and Speed. Each episode ends with stars and its key lessons. The detailed labs below are the facilitator's deep-dive workbench at `#labs`.

**Every question is framed for leaders.** Before each decision, a character bridges from the last scene, an animated visual sets the stakes (a loss counter, tomorrow's headline, a live countdown, an attack travelling through a chain of systems), a "Why this matters to you" brief puts it in business terms, and tap-to-reveal definitions explain any jargon. Once answered, "What a leader takes from this" explains the strongest answer and what the other choices would have done, and the footer says what comes next. The framing lives in `app/js/story-extra.js`; the visuals in `app/js/story-viz.js`.

## The program deck (`#deck`)

The workbench carries the full program deck: 155 slides with speaker notes, shown at their original 1920×1080 layout and scaled to fit. Every lab has a **Deck** tab with its module's slides; `#deck` shows the whole deck with a chip per section, and `#deck-m07` opens it at a module. Arrow keys, swipes or taps move between slides, and Full screen presents. The home screen and the header link to both the workbench and the deck.

The deck's source is in `deck/` (exported from the Slides artifact). After updating it, run `npm run deck` to regenerate `app/js/deck-data.js`; the script refuses any slide markup that could load or run something.

## Core RAG Lab (`#rag`)

**Build Ask Meridian** is the hands-on core of Modules 09 and 12. Participants design a knowledge assistant's pipeline under a 13-point budget, choosing the approach (RAG, fine-tuning or pasting everything) and an option at each of eight stages: sources, ingestion, vector store, access, retrieval, generation, output and updates. Their design then runs through a day in production: nine events, from ordinary questions to a stale policy, a stale permission after a role change, a poisoned wiki, hidden instructions in a vendor PDF, a keyword-stuffed ticket, a secret in a runbook, an exposed vector store and an auto-updating parser. Each event animates through the pipeline and is stopped, weakened or succeeds. The incident report counts incidents, records exposed, wrong answers and direct loss, names the control, owner and module for each, and compares the design with an expert one. Participants redesign and replay; their run history shows the improvement. The simulation is deterministic, so tables with the same design see the same result.

## The ten labs

Each lab opens with the module's fail-first trap, then has five tabs: **1 · Work task** (a mission card, then numbered steps, each labelled Decide, Simulate, Write or Read, ending with **Check my work**), **2 · Quick quiz** (instant right/wrong feedback with the reason), **3 · Case studies** (the deck’s live scenarios and leadership discussion, each with an expert answer), **Expert answers** (opened by Check my work, with facilitator notes) and **Room** (compares every table).

| Module | Lab | Main exercise |
|---|---|---|
| 07 Responsible AI | Score one of your own AI systems | Six-principle scorecard, radar, regulator challenges, 30-day gap |
| 08 Responsive AI | Autonomy, runtime policy and escalation | Sort board, agent-loop diagram, risk map, policy generator |
| 09 Architecture review | Architecture review workshop | Warm-up flaw hunt; three exercise workbenches with threat registers, eight questions, verdicts and deliverables |
| 10 Trust | Trust architecture: who can a hijacked agent become? | Identity propagation switch, radial blast-radius map, live attack chains |
| 11 Attacks | Watch an injection, then defend against it | Hidden-text demo, context window, defence simulator, Gandalf log |
| 12 RAG & MCP | Secure retrieval and the tool approval board | RAG pipeline coverage, permission-aware retrieval demo, MCP approval board with a rug-pull round |
| 13 Productization | Go / no-go for ClaimsBot | Readiness pack, private briefs, conditions, risk grid, decision memo |
| 14 SOC | Find the attack, build the detection | Log console, timeline, detection workbench, kill-switch trade-off |
| 15 Governance | Classify eight use cases, brief the board | EU AI Act and internal tiers, heat map, decision rights, board dashboard, board report |
| 16 Capstone | RAG, MCP and the Aria incident | Exercises, deliverables checklist, branching tabletop, weighted rubric |

**No typing, all tapping.** Participants never type an answer. Each case study is three calls: every option locks in when tapped, shows its consequence and scores 10 (strong), 5 (partly there) or 0 (risky), with stars per case and the strongest move revealed when a table misses it. Leadership discussions are tapped positions (ready, partly, gap) with a readiness gauge. Modules 12, 13, 15 and 16 have a stakeholder role-play (a sponsor, the business owner, the Audit Committee chair, a journalist): the table picks a reply to each of three lines, the stakeholder reacts in character, a mood bar shows whether the table is winning the room, and a debrief scores the conversation. Lab write-ups are picks too: the system profile, evidence and 30-day gap in Module 07, owners and the eight questions in Module 09, notices built from sentence cards in Module 16. Nothing calls an AI service.

The home screen adds the ten leadership questions, the four program outcomes, and a wrap-up with the six takeaways and a 90-day plan. [COVERAGE.md](COVERAGE.md) maps every deck slide to where the app covers it.

## Running a session

1. Project the app on the main screen. Inside a lab, **Present** enlarges everything.
2. Each table taps its table number on the home screen and works through the lab on a phone.
3. At the end, each table taps **Share with the room** and pastes its result code into the room chat.
4. On the projector, open the lab's **Room** tab and paste all the codes at once. The room view compares every table.
5. Reveal answers after the comparison.

Answers are saved in each phone's browser. Nothing is sent anywhere unless a table shares its code.

**Optional live room.** If every participant is signed in to the same claude.ai organization as the artifact's owner, the app can share results live instead of through codes. To turn this on, republish with the `db` capability. That limits access to the organization and disables public links. The code already handles both modes.

## Project layout

```
app/
  index.html          page shell (the artifact host adds the document skeleton)
  css/app.css         design tokens (light and dark) and all component styles
  js/core.js          DOM/SVG builders, state, controls, lab clock, result codes, live room
  js/schematics.js    SVG helpers: edges, radar charts, room-result renderers
  js/scenario-data.js scenarios and leadership discussions, generated from the deck
  js/drills.js        Quick quiz and Case studies tabs (render, answers, room, summary)
  js/flows.js         guided steps per lab and the kinds of action (Decide, Simulate, Quiz, Read)
  js/case-play-data.js the scored options for every case-study call and discussion position
  js/play.js          tap-to-play pieces: move cards that lock in, stars, position cards, sentence builders
  js/roleplay.js      stakeholder role-plays as dialogue choices, for the labs and the story
  js/trap-data.js     fail-first traps and reveals, generated from the deck
  js/trap.js          the trap and reveal component, shared by the story and the labs
  js/deck-data.js     the program deck, generated from deck/ by scripts/import-deck.mjs
  js/deck.js          the slide viewer: Deck tabs and the #deck page
  js/story-extra.js   the framing of every episode question: bridge, stakes, why, terms, explanation
  js/story-viz.js     the animated stakes visuals and the question frame
  js/story-data.js    the story season: the NEXUS opening, ten episodes, the NEXUS failure timeline
  js/rag.js           the core RAG Lab: pipeline design, production run, incident report
  js/story.js         story engine: one-screen scenes, animation, meters, routing ('#' and '#e07'…)
  js/labs/m07–m16.js  one file per lab: data, render, answers, aggregation, summary
  js/main.js          home, lab view, tabs, presenter mode, room collector
scripts/
  check-syntax.mjs    syntax-checks every script the page loads
  smoke.mjs           renders every lab and tab in jsdom, clicks every control, checks result codes,
                      drill answer keys and that all 34 deck scenarios and 9 discussions are present
```

There is no build step: the scripts are plain browser JavaScript, loaded in order.

## Hosting it yourself

`app/index.html` is a page body: the artifact host adds the doctype, charset and viewport when it serves it. To host the labs anywhere else (GitHub Pages, Netlify, S3, any static server), run `npm run build` and upload the contents of `dist/`.

## Testing

```
npm install
npm test
```

## Deploying

The app is published as a multi-file Claude artifact from the `app/` folder, with `index.html` as the page and the CSS and JS files alongside it. Republish to the same artifact URL to keep the link participants already have.
