# Agentic AI Labs

Hands-on labs for Modules 07–16 of the **Agentic AI Security & Governance** program. Participants open the app on their phones and work in tables of four or five, in role and against the clock. No technical background is needed.

Live app: https://claude.ai/artifact/2SNepAFvq2HNnVBXJ5NLfS

## Story mode (the home screen)

**Agents at Meridian** is a ten-episode story, one per module. You are Meridian's new Head of AI Risk. Each episode is a sequence of single screens, with no scrolling. In each screen a character speaks, you make one decision, tap items on an animated diagram, sort cards one at a time, flip switches, or talk to a stakeholder live. Every choice shows its consequence and moves three meters: Safety, Trust and Speed. Each episode ends with stars and its key lessons. The detailed labs below are the facilitator's deep-dive workbench at `#labs`.

## The ten labs

Each lab has five tabs: **1 · Work task** (a mission card, then numbered steps, each labelled Decide, Simulate, Write or Read, ending with **Check my work**), **2 · Quick quiz** (instant right/wrong feedback with the reason), **3 · Case studies** (the deck’s live scenarios and leadership discussion, each with an expert answer), **Expert answers** (opened by Check my work, with facilitator notes) and **Room** (compares every table).

| Module | Lab | Main exercise |
|---|---|---|
| 07 Trust | Trust architecture: who can a hijacked agent become? | Identity propagation switch, radial blast-radius map, live attack chains |
| 08 Responsible AI | Score one of your own AI systems | Six-principle scorecard, radar, regulator challenges, 30-day gap |
| 09 Responsive AI | Autonomy, runtime policy and escalation | Sort board, agent-loop diagram, risk map, policy generator |
| 10 Architecture review | Architecture review workshop | Warm-up flaw hunt; three exercise workbenches with threat registers, eight questions, verdicts and deliverables |
| 11 Attacks | Watch an injection, then defend against it | Hidden-text demo, context window, defence simulator, Gandalf log |
| 12 RAG & MCP | Secure retrieval and the tool approval board | RAG pipeline coverage, permission-aware retrieval demo, MCP approval board with a rug-pull round |
| 13 Productization | Go / no-go for ClaimsBot | Readiness pack, private briefs, conditions, risk grid, decision memo |
| 14 SOC | Find the attack, build the detection | Log console, timeline, detection workbench, kill-switch trade-off |
| 15 Governance | Classify eight use cases, brief the board | EU AI Act and internal tiers, heat map, decision rights, board dashboard, board report |
| 16 Capstone | RAG, MCP and the Aria incident | Exercises, deliverables checklist, branching tabletop, weighted rubric |

**Live AI** (when opened in Claude while signed in): every case study has an AI coach that gives the table feedback against the expert answer, and Modules 12, 13, 15 and 16 include a live role-play with a stakeholder (a sponsor, the business owner, the Audit Committee chair, a journalist) followed by a coached debrief. It uses each viewer's own Claude account; without it the labs work as before.

The home screen adds the ten leadership questions, the four program outcomes, and a wrap-up with the six takeaways and a 90-day plan. [COVERAGE.md](COVERAGE.md) maps every deck slide to where the app covers it.

## Running a session

1. Project the app on the main screen. Inside a lab, **Present** enlarges everything.
2. Each table sets its name on the home screen and works through the lab on a phone.
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
  js/flows.js         guided steps per lab and the kinds of action (Decide, Simulate, Quiz, Write, Read, Live AI)
  js/coach.js         live AI via the sample capability: case-study coach feedback and stakeholder role-plays
  js/story-data.js    the story season: ten episodes of scenes
  js/story.js         story engine: one-screen scenes, animation, meters, routing ('#' and '#e07'…)
  js/labs/m07–m16.js  one file per lab: data, render, answers, aggregation, summary
  js/main.js          home, lab view, tabs, presenter mode, room collector
scripts/
  check-syntax.mjs    syntax-checks every script the page loads
  smoke.mjs           renders every lab and tab in jsdom, clicks every control, checks result codes,
                      drill answer keys and that all 34 deck scenarios and 9 discussions are present
```

There is no build step: the scripts are plain browser JavaScript, loaded in order.

## Testing

```
npm install
npm test
```

## Deploying

The app is published as a multi-file Claude artifact from the `app/` folder, with `index.html` as the page and the CSS and JS files alongside it. Republish to the same artifact URL to keep the link participants already have.
